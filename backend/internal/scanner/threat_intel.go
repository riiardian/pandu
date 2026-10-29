package scanner

import (
	"crypto/tls"
	"encoding/json"
	"fmt"
	"net"
	"net/http"
	"strings"
	"time"
)

// StopForumSpamResponse defines the JSON schema from StopForumSpam API
type StopForumSpamResponse struct {
	Success int `json:"success"`
	Email   *struct {
		Value      string  `json:"value"`
		Appears    int     `json:"appears"`
		Frequency  int     `json:"frequency"`
		LastSeen   string  `json:"lastseen"`
		Confidence float64 `json:"confidence"`
	} `json:"email,omitempty"`
	IP *struct {
		Value      string  `json:"value"`
		Appears    int     `json:"appears"`
		Frequency  int     `json:"frequency"`
		LastSeen   string  `json:"lastseen"`
		Confidence float64 `json:"confidence"`
		TorExit    int     `json:"torexit"`
		Country    string  `json:"country"`
		ASN        int     `json:"asn"`
	} `json:"ip,omitempty"`
}

// GlobalThreatIntel holds real-time open-source threat intelligence data
type GlobalThreatIntel struct {
	Source      string  `json:"source"`
	Found       bool    `json:"found"`
	Appears     int     `json:"appears"`
	Frequency   int     `json:"frequency"`
	LastSeen    string  `json:"last_seen,omitempty"`
	Confidence  float64 `json:"confidence,omitempty"`
	RiskSummary string  `json:"risk_summary,omitempty"`
}

// IPGeoIntel holds live ASN and hosting location details from public registries
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

// TLSCertIntel holds live SSL certificate inspection findings
type TLSCertIntel struct {
	Subject       string `json:"subject"`
	Issuer        string `json:"issuer"`
	ValidFrom     string `json:"valid_from"`
	ValidUntil    string `json:"valid_until"`
	DaysRemaining int    `json:"days_remaining"`
	IsRecent      bool   `json:"is_recent"` // issued in last 14 days
}

var httpClient = &http.Client{
	Timeout: 4 * time.Second,
}

// QueryStopForumSpamEmail checks an email against the global StopForumSpam intelligence database
func QueryStopForumSpamEmail(email string) GlobalThreatIntel {
	result := GlobalThreatIntel{
		Source: "StopForumSpam Global Intelligence Network",
		Found:  false,
	}

	clean := strings.TrimSpace(email)
	if clean == "" || !strings.Contains(clean, "@") {
		return result
	}

	apiURL := fmt.Sprintf("https://api.stopforumspam.org/api?email=%s&json", clean)
	req, err := http.NewRequest(http.MethodGet, apiURL, nil)
	if err != nil {
		return result
	}
	req.Header.Set("User-Agent", "PANDU-Cyber-Intelligence/1.0 (Guardians of the Digital Space)")

	resp, err := httpClient.Do(req)
	if err != nil {
		return result
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return result
	}

	var data StopForumSpamResponse
	if err := json.NewDecoder(resp.Body).Decode(&data); err != nil {
		return result
	}

	if data.Email != nil && data.Email.Appears == 1 {
		result.Found = true
		result.Appears = data.Email.Appears
		result.Frequency = data.Email.Frequency
		result.LastSeen = data.Email.LastSeen
		result.Confidence = data.Email.Confidence
		result.RiskSummary = fmt.Sprintf("Email terdaftar di basis data kejahatan global dengan %d catatan pelaporan spam/penipuan (Tingkat Keyakinan: %.1f%%).", data.Email.Frequency, data.Email.Confidence)
	}

	return result
}

// LiveDNSLookup resolves public IPv4 and MX records for a hostname
func LiveDNSLookup(hostname string) ([]string, []string, error) {
	var ips []string
	var mxRecords []string

	cleanHost := strings.TrimSpace(hostname)
	if cleanHost == "" {
		return ips, mxRecords, fmt.Errorf("hostname kosong")
	}

	// 1. IP Lookup
	ipList, err := net.LookupIP(cleanHost)
	if err == nil {
		for _, ip := range ipList {
			if ipv4 := ip.To4(); ipv4 != nil {
				ips = append(ips, ipv4.String())
			}
		}
	}

	// 2. MX Lookup (if it's a domain)
	mxList, err := net.LookupMX(cleanHost)
	if err == nil {
		for _, mx := range mxList {
			mxRecords = append(mxRecords, fmt.Sprintf("%s (prioritas %d)", mx.Host, mx.Pref))
		}
	}

	return ips, mxRecords, nil
}

// QueryIPGeolocation checks IP ASN and hosting organization via public IP registry
func QueryIPGeolocation(ip string) *IPGeoIntel {
	if ip == "" || net.ParseIP(ip) == nil {
		return nil
	}

	apiURL := fmt.Sprintf("http://ip-api.com/json/%s?fields=status,message,country,countryCode,regionName,city,isp,org,as,query", ip)
	req, err := http.NewRequest(http.MethodGet, apiURL, nil)
	if err != nil {
		return nil
	}
	req.Header.Set("User-Agent", "PANDU-Cyber-Intelligence/1.0")

	resp, err := httpClient.Do(req)
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

	if err := json.NewDecoder(resp.Body).Decode(&data); err != nil || data.Status != "success" {
		return nil
	}

	return &IPGeoIntel{
		IP:          data.Query,
		Country:     data.Country,
		CountryCode: data.CountryCode,
		Region:      data.RegionName,
		City:        data.City,
		ISP:         data.ISP,
		Org:         data.Org,
		ASN:         data.AS,
	}
}

// InspectTLSCertificate connects to the host via TLS to inspect its live SSL certificate
func InspectTLSCertificate(hostname string) *TLSCertIntel {
	cleanHost := strings.TrimSpace(hostname)
	if cleanHost == "" {
		return nil
	}

	conf := &tls.Config{
		InsecureSkipVerify: true, // we want to inspect even self-signed/phishing certs
		ServerName:         cleanHost,
	}

	dialer := &net.Dialer{
		Timeout: 3 * time.Second,
	}

	conn, err := tls.DialWithDialer(dialer, "tcp", cleanHost+":443", conf)
	if err != nil {
		return nil
	}
	defer conn.Close()

	certs := conn.ConnectionState().PeerCertificates
	if len(certs) == 0 {
		return nil
	}

	leaf := certs[0]
	now := time.Now()
	daysRem := int(leaf.NotAfter.Sub(now).Hours() / 24)
	ageDays := int(now.Sub(leaf.NotBefore).Hours() / 24)

	issuer := leaf.Issuer.CommonName
	if issuer == "" && len(leaf.Issuer.Organization) > 0 {
		issuer = leaf.Issuer.Organization[0]
	}

	subject := leaf.Subject.CommonName
	if subject == "" && len(leaf.DNSNames) > 0 {
		subject = leaf.DNSNames[0]
	}

	return &TLSCertIntel{
		Subject:       subject,
		Issuer:        issuer,
		ValidFrom:     leaf.NotBefore.Format("2006-01-02"),
		ValidUntil:    leaf.NotAfter.Format("2006-01-02"),
		DaysRemaining: daysRem,
		IsRecent:      ageDays <= 14,
	}
}
