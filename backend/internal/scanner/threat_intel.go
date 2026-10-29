package scanner

import (
	"context"
	"crypto/md5"
	"crypto/tls"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"io"
	"net"
	"net/http"
	"net/url"
	"sort"
	"strings"
	"time"
)

const (
	SourceQueried       = "queried"
	SourceUnavailable   = "unavailable"
	SourceSkipped       = "skipped"
	OutcomeMatch        = "match"
	OutcomeNoMatch      = "no_match"
	OutcomeContext      = "context"
	OutcomeUnknown      = "unknown"
	CoverageComplete    = "complete"
	CoveragePartial     = "partial"
	CoverageUnavailable = "unavailable"
)

type EvidenceItem struct {
	Label      string `json:"label"`
	Value      string `json:"value"`
	ObservedAt string `json:"observed_at,omitempty"`
}

type SourceResult struct {
	ID             string         `json:"id"`
	Name           string         `json:"name"`
	Status         string         `json:"status"`
	Outcome        string         `json:"outcome"`
	CheckedAt      string         `json:"checked_at"`
	Matches        int            `json:"matches"`
	Evidence       []EvidenceItem `json:"evidence"`
	Limitation     string         `json:"limitation,omitempty"`
	AttributionURL string         `json:"attribution_url,omitempty"`
	ErrorCategory  string         `json:"error_category,omitempty"`
}

func NewSourceResult(id, name string) SourceResult {
	return SourceResult{ID: id, Name: name, Status: SourceUnavailable, Outcome: OutcomeUnknown, CheckedAt: time.Now().UTC().Format(time.RFC3339), Evidence: []EvidenceItem{}}
}

func SummarizeCoverage(sources []SourceResult) (string, string) {
	queried, unavailable := 0, 0
	for _, source := range sources {
		switch source.Status {
		case SourceQueried:
			queried++
		case SourceUnavailable:
			unavailable++
		}
	}
	if queried == 0 {
		return CoverageUnavailable, "Pemeriksaan belum dapat disimpulkan karena tidak ada sumber intelijen yang berhasil dihubungi."
	}
	if unavailable > 0 {
		return CoveragePartial, fmt.Sprintf("%d sumber berhasil diperiksa dan %d sumber tidak tersedia. Hasil ini bersifat parsial.", queried, unavailable)
	}
	return CoverageComplete, fmt.Sprintf("Pemeriksaan selesai pada %d sumber. Tidak ditemukannya catatan bukan jaminan bahwa target aman.", queried)
}

func sortSources(sources []SourceResult) {
	sort.SliceStable(sources, func(i, j int) bool { return sources[i].ID < sources[j].ID })
}

var threatHTTPClient = &http.Client{Timeout: 5 * time.Second}
var stopForumSpamBaseURL = "https://api.stopforumspam.org/api"
var circlHashlookupBaseURL = "https://hashlookup.circl.lu/lookup/sha256"
var rdapBaseURL = "https://rdap.org/domain"
var urlscanSearchBaseURL = "https://urlscan.io/api/v1/search/"

type stopForumSpamResponse struct {
	Success   int `json:"success"`
	Emailhash *struct {
		Appears    int     `json:"appears"`
		Frequency  int     `json:"frequency"`
		LastSeen   string  `json:"lastseen"`
		Confidence float64 `json:"confidence"`
	} `json:"emailhash,omitempty"`
}

func QueryStopForumSpamEmail(ctx context.Context, email string) SourceResult {
	result := NewSourceResult("stopforumspam", "StopForumSpam")
	result.AttributionURL = "https://www.stopforumspam.com/"
	result.Limitation = "Kecocokan menunjukkan riwayat laporan spam pada sumber ini, bukan pembuktian identitas atau tindak pidana."
	clean := strings.ToLower(strings.TrimSpace(email))
	if clean == "" || !strings.Contains(clean, "@") {
		result.Status = SourceSkipped
		result.ErrorCategory = "invalid_indicator"
		return result
	}
	hash := md5.Sum([]byte(clean))
	endpoint, err := url.Parse(stopForumSpamBaseURL)
	if err != nil {
		result.ErrorCategory = "configuration"
		return result
	}
	q := endpoint.Query()
	q.Set("emailhash", strings.ToUpper(hex.EncodeToString(hash[:])))
	q.Set("json", "")
	endpoint.RawQuery = q.Encode()
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, endpoint.String(), nil)
	if err != nil {
		result.ErrorCategory = "request_build"
		return result
	}
	req.Header.Set("User-Agent", "PANDU-Threat-Intel/2.0 (+https://pandu.web.id)")
	resp, err := threatHTTPClient.Do(req)
	if err != nil {
		result.ErrorCategory = "network"
		return result
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusOK {
		result.ErrorCategory = fmt.Sprintf("http_%d", resp.StatusCode)
		return result
	}
	var data stopForumSpamResponse
	if err := decodeJSONLimit(resp.Body, &data); err != nil || data.Success != 1 {
		result.ErrorCategory = "invalid_response"
		return result
	}
	result.Status = SourceQueried
	result.Outcome = OutcomeNoMatch
	if data.Emailhash != nil && data.Emailhash.Appears == 1 {
		result.Outcome = OutcomeMatch
		result.Matches = data.Emailhash.Frequency
		result.Evidence = append(result.Evidence,
			EvidenceItem{Label: "Frekuensi laporan", Value: fmt.Sprintf("%d", data.Emailhash.Frequency), ObservedAt: data.Emailhash.LastSeen},
			EvidenceItem{Label: "Confidence sumber", Value: fmt.Sprintf("%.1f%%", data.Emailhash.Confidence)},
		)
	}
	return result
}

func QueryCIRCLHash(ctx context.Context, sha256Hash string) SourceResult {
	result := NewSourceResult("circl_hashlookup", "CIRCL hashlookup")
	result.AttributionURL = "https://www.circl.lu/services/hashlookup/"
	result.Limitation = "Kecocokan berarti hash dikenal oleh salah satu dataset perangkat lunak CIRCL; ini bukan vonis malware maupun jaminan aman."
	hash := strings.ToLower(strings.TrimSpace(sha256Hash))
	if len(hash) != 64 {
		result.Status = SourceSkipped
		result.ErrorCategory = "invalid_hash"
		return result
	}
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, strings.TrimRight(circlHashlookupBaseURL, "/")+"/"+url.PathEscape(hash), nil)
	if err != nil {
		result.ErrorCategory = "request_build"
		return result
	}
	req.Header.Set("User-Agent", "PANDU-Threat-Intel/2.0 (+https://pandu.web.id)")
	resp, err := threatHTTPClient.Do(req)
	if err != nil {
		result.ErrorCategory = "network"
		return result
	}
	defer resp.Body.Close()
	if resp.StatusCode == http.StatusNotFound {
		result.Status = SourceQueried
		result.Outcome = OutcomeNoMatch
		return result
	}
	if resp.StatusCode != http.StatusOK {
		result.ErrorCategory = fmt.Sprintf("http_%d", resp.StatusCode)
		return result
	}
	var data map[string]any
	if err := decodeJSONLimit(resp.Body, &data); err != nil {
		result.ErrorCategory = "invalid_response"
		return result
	}
	result.Status = SourceQueried
	result.Outcome = OutcomeMatch
	result.Matches = 1
	for _, pair := range [][2]string{{"FileName", "Nama pada dataset"}, {"FileSize", "Ukuran pada dataset"}, {"source", "Dataset sumber"}, {"hashlookup:trust", "Trust CIRCL"}} {
		if value, ok := data[pair[0]]; ok {
			result.Evidence = append(result.Evidence, EvidenceItem{Label: pair[1], Value: fmt.Sprint(value)})
		}
	}
	return result
}

type rdapResponse struct {
	LDHName string   `json:"ldhName"`
	Status  []string `json:"status"`
	Events  []struct {
		Action string `json:"eventAction"`
		Date   string `json:"eventDate"`
	} `json:"events"`
}

func QueryRDAPDomain(ctx context.Context, domain string) SourceResult {
	result := NewSourceResult("rdap", "RDAP Registry")
	result.AttributionURL = "https://www.icann.org/rdap/"
	result.Limitation = "RDAP memberikan konteks registrasi domain, bukan penilaian apakah domain berbahaya."
	clean := strings.TrimSuffix(strings.ToLower(strings.TrimSpace(domain)), ".")
	if clean == "" || net.ParseIP(clean) != nil || strings.ContainsAny(clean, "/ @") {
		result.Status = SourceSkipped
		result.ErrorCategory = "invalid_domain"
		return result
	}
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, strings.TrimRight(rdapBaseURL, "/")+"/"+url.PathEscape(clean), nil)
	if err != nil {
		result.ErrorCategory = "request_build"
		return result
	}
	req.Header.Set("Accept", "application/rdap+json, application/json")
	req.Header.Set("User-Agent", "PANDU-Threat-Intel/2.0 (+https://pandu.web.id)")
	resp, err := threatHTTPClient.Do(req)
	if err != nil {
		result.ErrorCategory = "network"
		return result
	}
	defer resp.Body.Close()
	if resp.StatusCode == http.StatusNotFound {
		result.Status = SourceQueried
		result.Outcome = OutcomeNoMatch
		return result
	}
	if resp.StatusCode != http.StatusOK {
		result.ErrorCategory = fmt.Sprintf("http_%d", resp.StatusCode)
		return result
	}
	var data rdapResponse
	if err := decodeJSONLimit(resp.Body, &data); err != nil {
		result.ErrorCategory = "invalid_response"
		return result
	}
	result.Status = SourceQueried
	result.Outcome = OutcomeContext
	result.Evidence = append(result.Evidence, EvidenceItem{Label: "Domain registry", Value: data.LDHName})
	if len(data.Status) > 0 {
		result.Evidence = append(result.Evidence, EvidenceItem{Label: "Status registrasi", Value: strings.Join(data.Status, ", ")})
	}
	for _, event := range data.Events {
		if event.Action == "registration" || event.Action == "expiration" || event.Action == "last changed" {
			result.Evidence = append(result.Evidence, EvidenceItem{Label: event.Action, Value: event.Date})
		}
	}
	return result
}

func QueryURLScan(ctx context.Context, domain string) SourceResult {
	result := NewSourceResult("urlscan", "urlscan.io Public Search")
	result.AttributionURL = "https://urlscan.io/"
	result.Limitation = "Hasil adalah rekam pemindaian publik yang sudah ada; ketiadaan hasil bukan jaminan aman. PANDU tidak mengirim URL pengguna menjadi pemindaian publik."
	clean := strings.TrimSuffix(strings.ToLower(strings.TrimSpace(domain)), ".")
	if clean == "" || net.ParseIP(clean) != nil || strings.ContainsAny(clean, "/ @") {
		result.Status = SourceSkipped
		result.ErrorCategory = "invalid_domain"
		return result
	}
	endpoint, _ := url.Parse(urlscanSearchBaseURL)
	q := endpoint.Query()
	q.Set("q", "domain:"+clean)
	q.Set("size", "3")
	endpoint.RawQuery = q.Encode()
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, endpoint.String(), nil)
	if err != nil {
		result.ErrorCategory = "request_build"
		return result
	}
	req.Header.Set("User-Agent", "PANDU-Threat-Intel/2.0 (+https://pandu.web.id)")
	resp, err := threatHTTPClient.Do(req)
	if err != nil {
		result.ErrorCategory = "network"
		return result
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusOK {
		result.ErrorCategory = fmt.Sprintf("http_%d", resp.StatusCode)
		return result
	}
	var data struct {
		Total   int `json:"total"`
		Results []struct {
			Task struct {
				UUID string `json:"uuid"`
				Time string `json:"time"`
				URL  string `json:"url"`
			} `json:"task"`
			Page struct {
				Domain string `json:"domain"`
				Status string `json:"status"`
				IP     string `json:"ip"`
			} `json:"page"`
		} `json:"results"`
	}
	if err := decodeJSONLimit(resp.Body, &data); err != nil {
		result.ErrorCategory = "invalid_response"
		return result
	}
	result.Status = SourceQueried
	result.Outcome = OutcomeNoMatch
	if data.Total > 0 {
		result.Outcome = OutcomeContext
		result.Matches = data.Total
		result.Evidence = append(result.Evidence, EvidenceItem{Label: "Pemindaian publik ditemukan", Value: fmt.Sprintf("%d", data.Total)})
		if len(data.Results) > 0 {
			item := data.Results[0]
			result.Evidence = append(result.Evidence, EvidenceItem{Label: "Pemindaian publik terbaru", Value: item.Task.URL, ObservedAt: item.Task.Time})
		}
	}
	return result
}

func decodeJSONLimit(body io.Reader, dst any) error {
	return json.NewDecoder(io.LimitReader(body, 2<<20)).Decode(dst)
}

type IPGeoIntel struct {
	IP          string `json:"ip"`
	Country     string `json:"country"`
	CountryCode string `json:"country_code"`
	Region      string `json:"region_name"`
	City        string `json:"city"`
	ISP         string `json:"isp"`
	Org         string `json:"org"`
	ASN         string `json:"asn"`
}

type TLSCertIntel struct {
	Subject       string `json:"subject"`
	Issuer        string `json:"issuer"`
	ValidFrom     string `json:"valid_from"`
	ValidUntil    string `json:"valid_until"`
	DaysRemaining int    `json:"days_remaining"`
	IsRecent      bool   `json:"is_recent"`
}

func publicIPs(ctx context.Context, hostname string) ([]net.IP, error) {
	ips, err := net.DefaultResolver.LookupIP(ctx, "ip", hostname)
	if err != nil {
		return nil, err
	}
	if len(ips) == 0 {
		return nil, fmt.Errorf("tidak ada alamat IP")
	}
	for _, ip := range ips {
		if !isAllowedPublicIP(ip) {
			return nil, fmt.Errorf("alamat tujuan non-publik ditolak")
		}
	}
	return ips, nil
}

func isAllowedPublicIP(ip net.IP) bool {
	if ip == nil || !ip.IsGlobalUnicast() || ip.IsPrivate() || ip.IsLoopback() || ip.IsLinkLocalUnicast() || ip.IsLinkLocalMulticast() || ip.IsMulticast() || ip.IsUnspecified() {
		return false
	}
	if v4 := ip.To4(); v4 != nil {
		if v4[0] == 100 && v4[1]&0xc0 == 64 {
			return false
		}
		if v4[0] == 169 && v4[1] == 254 {
			return false
		}
		if v4[0] == 192 && v4[1] == 0 && (v4[2] == 0 || v4[2] == 2) {
			return false
		}
		if v4[0] == 198 && (v4[1] == 18 || v4[1] == 19) {
			return false
		}
		if v4[0] == 198 && v4[1] == 51 && v4[2] == 100 {
			return false
		}
		if v4[0] == 203 && v4[1] == 0 && v4[2] == 113 {
			return false
		}
	}
	return true
}

func LiveDNSLookup(hostname string) ([]string, []string, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()
	ips, err := publicIPs(ctx, strings.TrimSpace(hostname))
	if err != nil {
		return nil, nil, err
	}
	ipStrings := make([]string, 0, len(ips))
	for _, ip := range ips {
		ipStrings = append(ipStrings, ip.String())
	}
	mxRecords := []string{}
	if mxList, mxErr := net.DefaultResolver.LookupMX(ctx, strings.TrimSpace(hostname)); mxErr == nil {
		for _, mx := range mxList {
			mxRecords = append(mxRecords, fmt.Sprintf("%s (prioritas %d)", mx.Host, mx.Pref))
		}
	}
	return ipStrings, mxRecords, nil
}

func QueryIPGeolocation(ip string) *IPGeoIntel {
	parsed := net.ParseIP(ip)
	if !isAllowedPublicIP(parsed) {
		return nil
	}
	ctx, cancel := context.WithTimeout(context.Background(), 4*time.Second)
	defer cancel()
	endpoint := fmt.Sprintf("http://ip-api.com/json/%s?fields=status,country,countryCode,regionName,city,isp,org,as,query", url.PathEscape(ip))
	req, _ := http.NewRequestWithContext(ctx, http.MethodGet, endpoint, nil)
	resp, err := threatHTTPClient.Do(req)
	if err != nil {
		return nil
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusOK {
		return nil
	}
	var data struct {
		Status      string `json:"status"`
		Country     string `json:"country"`
		CountryCode string `json:"countryCode"`
		RegionName  string `json:"regionName"`
		City        string `json:"city"`
		ISP         string `json:"isp"`
		Org         string `json:"org"`
		AS          string `json:"as"`
		Query       string `json:"query"`
	}
	if err := decodeJSONLimit(resp.Body, &data); err != nil || data.Status != "success" {
		return nil
	}
	return &IPGeoIntel{IP: data.Query, Country: data.Country, CountryCode: data.CountryCode, Region: data.RegionName, City: data.City, ISP: data.ISP, Org: data.Org, ASN: data.AS}
}

func InspectTLSCertificate(hostname string) *TLSCertIntel {
	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()
	ips, err := publicIPs(ctx, strings.TrimSpace(hostname))
	if err != nil {
		return nil
	}
	dialer := &net.Dialer{Timeout: 3 * time.Second}
	raw, err := dialer.DialContext(ctx, "tcp", net.JoinHostPort(ips[0].String(), "443"))
	if err != nil {
		return nil
	}
	conn := tls.Client(raw, &tls.Config{InsecureSkipVerify: true, ServerName: hostname, MinVersion: tls.VersionTLS12})
	defer conn.Close()
	if err := conn.HandshakeContext(ctx); err != nil {
		return nil
	}
	certs := conn.ConnectionState().PeerCertificates
	if len(certs) == 0 {
		return nil
	}
	leaf := certs[0]
	now := time.Now()
	issuer := leaf.Issuer.CommonName
	if issuer == "" && len(leaf.Issuer.Organization) > 0 {
		issuer = leaf.Issuer.Organization[0]
	}
	subject := leaf.Subject.CommonName
	if subject == "" && len(leaf.DNSNames) > 0 {
		subject = leaf.DNSNames[0]
	}
	return &TLSCertIntel{Subject: subject, Issuer: issuer, ValidFrom: leaf.NotBefore.Format("2006-01-02"), ValidUntil: leaf.NotAfter.Format("2006-01-02"), DaysRemaining: int(leaf.NotAfter.Sub(now).Hours() / 24), IsRecent: now.Sub(leaf.NotBefore).Hours()/24 <= 14}
}
