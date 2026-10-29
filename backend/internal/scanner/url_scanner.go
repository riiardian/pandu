package scanner

import (
	"context"
	"crypto/tls"
	"fmt"
	"net"
	"net/http"
	"net/url"
	"strings"
	"time"
)

// BrandTarget defines a major Indonesian institution frequently spoofed.
type BrandTarget struct {
	BrandName       string
	Keyword         string
	OfficialDomains []string
}

// Indonesian brands reference catalog
var targetedBrands = []BrandTarget{
	{BrandName: "Bank Central Asia (BCA)", Keyword: "bca", OfficialDomains: []string{"bca.co.id", "klikbca.com", "mybca.bca.co.id"}},
	{BrandName: "Bank Rakyat Indonesia (BRI)", Keyword: "bri", OfficialDomains: []string{"bri.co.id", "ib.bri.co.id", "brimo.bri.co.id"}},
	{BrandName: "Bank Mandiri", Keyword: "mandiri", OfficialDomains: []string{"bankmandiri.co.id", "livin.mandiri.co.id"}},
	{BrandName: "Bank Negara Indonesia (BNI)", Keyword: "bni", OfficialDomains: []string{"bni.co.id", "bniexperience.bni.co.id"}},
	{BrandName: "DANA Indonesia", Keyword: "dana", OfficialDomains: []string{"dana.id"}},
	{BrandName: "GoPay Indonesia", Keyword: "gopay", OfficialDomains: []string{"gopay.co.id", "gojek.com"}},
	{BrandName: "OVO", Keyword: "ovo", OfficialDomains: []string{"ovo.id"}},
	{BrandName: "Shopee / ShopeePay", Keyword: "shopee", OfficialDomains: []string{"shopee.co.id"}},
	{BrandName: "PLN (Perusahaan Listrik Negara)", Keyword: "pln", OfficialDomains: []string{"pln.co.id"}},
	{BrandName: "BPJS Kesehatan / Ketenagakerjaan", Keyword: "bpjs", OfficialDomains: []string{"bpjs-kesehatan.go.id", "bpjsketenagakerjaan.go.id"}},
	{BrandName: "Kartu Prakerja", Keyword: "prakerja", OfficialDomains: []string{"prakerja.go.id"}},
	{BrandName: "Telkomsel", Keyword: "telkomsel", OfficialDomains: []string{"telkomsel.com"}},
	{BrandName: "Indosat Ooredoo Hutchison", Keyword: "indosat", OfficialDomains: []string{"indosatooredoo.com", "im3.id", "ioh.co.id"}},
}

var suspiciousTLDs = map[string]string{
	".xyz":    "Ekstensi domain murah yang sangat sering disalahgunakan untuk campaign phishing kilat.",
	".top":    "Domain murah berisiko tinggi tanpa regulasi verifikasi identitas ketat.",
	".site":   "Sering digunakan untuk situs promosi/undian palsu jangka pendek.",
	".cfd":    "Ekstensi sering dipakai malware dan phishing bot.",
	".cc":     "Sering dipakai sebagai domain cadangan situs penipuan dan judi online.",
	".click":  "Sering dipakai untuk link jebakan clickjacking.",
	".link":   "Sering dipakai untuk shortlink penipuan.",
	".tk":     "Domain gratisan peninggalan Dot TK yang rawan phishing.",
	".ml":     "Domain gratisan yang sering diasosiasikan dengan campaign malware.",
	".ga":     "Domain gratisan berisiko tinggi.",
	".sbs":    "Domain berbiaya murah yang kerap diborong oleh sindikat penipu.",
	".online": "Banyak dipakai untuk halaman phising undian dan kuota gratis.",
	".fun":    "Banyak dipakai untuk tautan giveaway palsu.",
}

// URLScanResult holds diagnostic analysis for a URL.
type URLScanResult struct {
	OriginalURL       string         `json:"original_url"`
	NormalizedURL     string         `json:"normalized_url"`
	Hostname          string         `json:"hostname"`
	TLD               string         `json:"tld"`
	IsIPAddress       bool           `json:"is_ip_address"`
	RiskScore         int            `json:"risk_score"`
	ThreatLevel       string         `json:"threat_level"`
	Coverage          string         `json:"coverage"`
	CoverageSummary   string         `json:"coverage_summary"`
	Sources           []SourceResult `json:"sources"`
	ImpersonatedBrand string         `json:"impersonated_brand"`
	ResolvedIPs       []string       `json:"resolved_ips,omitempty"`
	GeoLocation       *IPGeoIntel    `json:"geolocation,omitempty"`
	TLSCert           *TLSCertIntel  `json:"tls_cert,omitempty"`
	RedFlags          []RedFlag      `json:"red_flags"`
	RedirectChain     []string       `json:"redirect_chain"`
	FinalDestination  string         `json:"final_destination"`
	IsShortlink       bool           `json:"is_shortlink"`
	Recommendations   []string       `json:"recommendations"`
}

// AnalyzeURL evaluates a web URL against heuristic deception rules.
func AnalyzeURL(rawInput string, followRedirects bool) URLScanResult {
	input := strings.TrimSpace(rawInput)
	if !strings.HasPrefix(input, "http://") && !strings.HasPrefix(input, "https://") {
		input = "https://" + input
	}

	result := URLScanResult{
		OriginalURL: rawInput, NormalizedURL: input,
		Coverage: CoverageUnavailable, Sources: []SourceResult{},
		RedFlags: []RedFlag{}, RedirectChain: []string{input}, Recommendations: []string{},
	}

	parsed, err := url.Parse(input)
	if err != nil {
		result.RiskScore = 60
		result.ThreatLevel = "WASPADA / FORMAT RUSAK"
		result.RedFlags = append(result.RedFlags, RedFlag{
			Level:       "HIGH",
			Title:       "Format URL Tidak Valid atau Malformed",
			Explanation: "Alamat web yang dimasukkan tidak memenuhi standar RFC web. Penipu sering menggunakan trik karakter tersembunyi untuk membingungkan browser.",
			Snippet:     rawInput,
		})
		return result
	}

	host := strings.ToLower(parsed.Hostname())
	result.Hostname = host

	score := 0

	// 1. Cek apakah Hostname adalah Direct IP (contoh: http://103.123.45.67/login)
	if net.ParseIP(host) != nil {
		result.IsIPAddress = true
		score += 50
		result.RedFlags = append(result.RedFlags, RedFlag{
			Level:       "CRITICAL",
			Title:       "Menggunakan Alamat IP Langsung (Bukan Nama Domain)",
			Explanation: "Layanan resmi perbankan dan instansi terpercaya selalu menggunakan nama domain resmi dengan sertifikat SSL valid. Penggunaan IP mentah di browser hampir 100% adalah server eksploit atau phishing.",
			Snippet:     host,
		})
	}

	// 2. Cek Ekstensi Domain / TLD Mencurigakan
	for tld, reason := range suspiciousTLDs {
		if strings.HasSuffix(host, tld) {
			result.TLD = tld
			score += 30
			result.RedFlags = append(result.RedFlags, RedFlag{
				Level:       "HIGH",
				Title:       fmt.Sprintf("Domain Menggunakan TLD Murah / Berisiko Tinggi (%s)", tld),
				Explanation: reason,
				Snippet:     host,
			})
			break
		}
	}

	// 3. Deteksi Pencatutan Brand / Typosquatting (Brand Impersonation)
	for _, b := range targetedBrands {
		if strings.Contains(host, b.Keyword) {
			isOfficial := false
			for _, off := range b.OfficialDomains {
				if host == off || strings.HasSuffix(host, "."+off) {
					isOfficial = true
					break
				}
			}

			if !isOfficial {
				score += 55
				result.ImpersonatedBrand = b.BrandName
				result.RedFlags = append(result.RedFlags, RedFlag{
					Level:       "CRITICAL",
					Title:       fmt.Sprintf("Pencatutan Nama Instansi / Brand Resmi: %s", b.BrandName),
					Explanation: fmt.Sprintf("Domain '%s' memuat nama '%s', namun domain resmi yang sah adalah '%s'. Ini adalah indikasi kuat situs tiruan (phishing) yang berniat mencuri akun Anda.", host, b.BrandName, strings.Join(b.OfficialDomains, ", ")),
					Snippet:     host,
				})
			}
		}
	}

	// 4. Deteksi Karakter Penipu (Dash berlebihan, Subdomain bertumpuk)
	dashes := strings.Count(host, "-")
	if dashes >= 2 {
		score += 20
		result.RedFlags = append(result.RedFlags, RedFlag{
			Level:       "MEDIUM",
			Title:       "Nama Domain Menggunakan Tanda Hubung (-) Berulang",
			Explanation: "Penipu sering menambahkan tanda hubung (misal: 'bca-klaim-hadiah-2026.com') untuk mengelabui korban agar terkesan seperti subdomain resmi.",
			Snippet:     host,
		})
	}

	subdomains := strings.Split(host, ".")
	if len(subdomains) >= 4 {
		score += 15
		result.RedFlags = append(result.RedFlags, RedFlag{
			Level:       "MEDIUM",
			Title:       "Struktur Subdomain Bertingkat Dalam",
			Explanation: "Struktur subdomain bertingkat (misal: 'layanan.bca.login.promo-resmi.net') sering digunakan untuk menyamarkan domain induk asli di ujung belakang.",
			Snippet:     host,
		})
	}

	// 5. Shortlink Detection & Safe Unmasking
	shortlinkHosts := []string{"bit.ly", "s.id", "tinyurl.com", "cutt.ly", "t.co", "linktr.ee", "shorturl.at"}
	for _, sl := range shortlinkHosts {
		if host == sl || strings.HasSuffix(host, "."+sl) {
			result.IsShortlink = true
			score += 20
			result.RedFlags = append(result.RedFlags, RedFlag{
				Level:       "MEDIUM",
				Title:       fmt.Sprintf("Layanan Pemendek Tautan Terdeteksi (%s)", sl),
				Explanation: "Alamat asli disembunyikan di balik shortlink. Penipu sering memanfaatkan layanan ini agar korban tidak bisa melihat domain phishing secara langsung.",
				Snippet:     host,
			})
			break
		}
	}

	// 6. Trace Redirection (Safe HEAD request, Timeout 3s, SSRF Guard)
	if followRedirects && (result.IsShortlink || score >= 20) {
		chain, finalDest := safeTraceRedirect(input)
		if len(chain) > 1 {
			result.RedirectChain = chain
			result.FinalDestination = finalDest

			finalParsed, err := url.Parse(finalDest)
			if err == nil {
				finalHost := strings.ToLower(finalParsed.Hostname())
				if finalHost != host {
					score += 15
					result.RedFlags = append(result.RedFlags, RedFlag{
						Level:       "HIGH",
						Title:       "Tautan Mengalihkan ke Domain Berbeda (Cross-Domain Redirect)",
						Explanation: fmt.Sprintf("Tautan awal (%s) mengarahkan browser korban ke domain akhir yang sama sekali berbeda: '%s'.", host, finalHost),
						Snippet:     finalDest,
					})
				}
			}
		}
	}

	if result.FinalDestination == "" {
		result.FinalDestination = input
	}

	// 7. Query public registration and scan context in parallel.
	if net.ParseIP(host) == nil {
		ctx, cancel := context.WithTimeout(context.Background(), 7*time.Second)
		type sourceResponse struct{ source SourceResult }
		ch := make(chan sourceResponse, 2)
		go func() { ch <- sourceResponse{QueryRDAPDomain(ctx, host)} }()
		go func() { ch <- sourceResponse{QueryURLScan(ctx, host)} }()
		for i := 0; i < 2; i++ {
			result.Sources = append(result.Sources, (<-ch).source)
		}
		cancel()
		sortSources(result.Sources)
	}

	// 8. Resolve only public addresses before geolocation or TLS connections.
	dnsSource := NewSourceResult("dns", "DNS Publik")
	ips, _, dnsErr := LiveDNSLookup(host)
	if dnsErr == nil {
		dnsSource.Status, dnsSource.Outcome = SourceQueried, OutcomeContext
		dnsSource.Evidence = append(dnsSource.Evidence, EvidenceItem{Label: "Alamat IP publik", Value: strings.Join(ips, ", ")})
		result.ResolvedIPs = ips
		if len(ips) > 0 {
			result.GeoLocation = QueryIPGeolocation(ips[0])
		}
	} else {
		dnsSource.ErrorCategory = "dns_or_non_public_target"
	}
	result.Sources = append(result.Sources, dnsSource)

	tlsSource := NewSourceResult("tls", "Sertifikat TLS")
	cert := InspectTLSCertificate(host)
	if cert != nil {
		tlsSource.Status, tlsSource.Outcome = SourceQueried, OutcomeContext
		tlsSource.Evidence = append(tlsSource.Evidence, EvidenceItem{Label: "Penerbit", Value: cert.Issuer}, EvidenceItem{Label: "Berlaku", Value: cert.ValidFrom + " s/d " + cert.ValidUntil})
		result.TLSCert = cert
		if cert.IsRecent {
			score += 10
			result.RedFlags = append(result.RedFlags, RedFlag{Level: "MEDIUM", Title: "Sertifikat TLS baru diterbitkan", Explanation: "Usia sertifikat adalah indikator lemah dan bukan usia registrasi domain atau bukti phishing.", Snippet: cert.ValidFrom})
		}
	} else {
		tlsSource.ErrorCategory = "tls_unavailable"
	}
	result.Sources = append(result.Sources, tlsSource)

	// Cap score
	if score > 100 {
		score = 100
	}
	result.RiskScore = score

	switch {
	case score >= 70:
		result.ThreatLevel = "BAHAYA / INDIKASI PHISHING TINGGI"
		result.Recommendations = append(result.Recommendations, "JANGAN BUKA TAUTAN INI!", "Jangan pernah memasukkan username, kata sandi, nomor kartu, atau kode OTP pada website ini.")
	case score >= 35:
		result.ThreatLevel = "WASPADA / MENCURIGAKAN"
		result.Recommendations = append(result.Recommendations, "Periksa kembali ejaan domain di address bar sebelum melanjutkan.", "Pastikan Anda hanya mengakses situs resmi instansi terkait.")
	default:
		result.ThreatLevel = "TIDAK DITEMUKAN INDIKATOR KUAT"
		result.Recommendations = append(result.Recommendations, "Tidak ditemukan indikator kuat pada pemeriksaan yang berhasil dijalankan. Hasil ini bukan jaminan bahwa tautan aman.")
	}
	result.Coverage, result.CoverageSummary = SummarizeCoverage(result.Sources)
	return result
}

// safeTraceRedirect traces HTTP redirects without exposing internal SSRF
func safeTraceRedirect(startURL string) ([]string, string) {
	chain := []string{startURL}
	current := startURL

	startParsed, err := url.Parse(startURL)
	if err != nil || (startParsed.Scheme != "http" && startParsed.Scheme != "https") || startParsed.User != nil {
		return chain, current
	}
	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	_, err = publicIPs(ctx, startParsed.Hostname())
	cancel()
	if err != nil {
		return chain, current
	}

	client := &http.Client{
		Timeout: 3 * time.Second,
		Transport: &http.Transport{
			TLSClientConfig: &tls.Config{InsecureSkipVerify: true}, // Allow checking even if self-signed cert on phishing
			DialContext: (&net.Dialer{
				Timeout: 2 * time.Second,
			}).DialContext,
		},
		CheckRedirect: func(req *http.Request, via []*http.Request) error {
			if len(via) >= 5 {
				return http.ErrUseLastResponse // Max 5 hops
			}
			return http.ErrUseLastResponse // Handle hop manually
		},
	}

	for i := 0; i < 5; i++ {
		req, err := http.NewRequest(http.MethodHead, current, nil)
		if err != nil {
			break
		}
		req.Header.Set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36 PanduSecurityScanner/1.0")

		// Validate every redirect hop before making an outbound request.
		parsed, err := url.Parse(current)
		if err != nil || (parsed.Scheme != "http" && parsed.Scheme != "https") || parsed.User != nil {
			break
		}
		if parsed.Port() != "" && parsed.Port() != "80" && parsed.Port() != "443" {
			break
		}
		hopCtx, hopCancel := context.WithTimeout(context.Background(), 2*time.Second)
		_, resolveErr := publicIPs(hopCtx, parsed.Hostname())
		hopCancel()
		if resolveErr != nil {
			break
		}

		resp, err := client.Do(req)
		if err != nil {
			break
		}
		resp.Body.Close()

		if resp.StatusCode >= 300 && resp.StatusCode < 400 {
			loc := resp.Header.Get("Location")
			if loc == "" {
				break
			}
			// Resolve relative URL
			relURL, err := url.Parse(loc)
			if err != nil {
				break
			}
			nextURL := parsed.ResolveReference(relURL).String()
			chain = append(chain, nextURL)
			current = nextURL
		} else {
			break
		}
	}

	return chain, current
}
