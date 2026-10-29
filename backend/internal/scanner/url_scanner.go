package scanner

import (
	"context"
	"crypto/tls"
	"fmt"
	"html"
	"io"
	"net"
	"net/http"
	"net/url"
	"regexp"
	"sort"
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

// WebSecurityPosture captures live HTTP security headers and infrastructure defense posture.
type WebSecurityPosture struct {
	HTTPStatus        int      `json:"http_status"`
	HTTPSActive       bool     `json:"https_active"`
	HasHSTS           bool     `json:"has_hsts"`
	HasCSP            bool     `json:"has_csp"`
	HasXFrameOptions  bool     `json:"has_x_frame_options"`
	HasContentType    bool     `json:"has_content_type"`
	HasReferrerPolicy bool     `json:"has_referrer_policy"`
	ServerBanner      string   `json:"server_banner,omitempty"`
	SecurityGrade     string   `json:"security_grade"` // "A (Sangat Tangguh)", "B (Standar)", "C (Minim Pengamanan)"
	SecurityStrengths []string `json:"security_strengths"`
}

// URLScanResult holds diagnostic analysis for a URL.
type PageContentAnalysis struct {
	PageTitle              string   `json:"page_title,omitempty"`
	PageCategories         []string `json:"page_categories"`
	FormCount              int      `json:"form_count"`
	InputTypes             []string `json:"input_types"`
	LoginProviders         []string `json:"login_providers"`
	CrossOriginFormActions []string `json:"cross_origin_form_actions"`
	HasRewardBait          bool     `json:"has_reward_bait"`
	HasJobBait             bool     `json:"has_job_bait"`
	HasGamblingContent     bool     `json:"has_gambling_content"`
	RequestsPassword       bool     `json:"requests_password"`
	RequestsOTP            bool     `json:"requests_otp"`
	RequestsEWallet        bool     `json:"requests_ewallet"`
	RequestsFinancialData  bool     `json:"requests_financial_data"`
	RiskScore              int      `json:"risk_score"`
	Summary                string   `json:"summary"`
}

type URLScanResult struct {
	OriginalURL       string               `json:"original_url"`
	NormalizedURL     string               `json:"normalized_url"`
	Hostname          string               `json:"hostname"`
	TLD               string               `json:"tld"`
	IsIPAddress       bool                 `json:"is_ip_address"`
	RiskScore         int                  `json:"risk_score"`
	ThreatLevel       string               `json:"threat_level"`
	Coverage          string               `json:"coverage"`
	CoverageSummary   string               `json:"coverage_summary"`
	Sources           []SourceResult       `json:"sources"`
	ImpersonatedBrand string               `json:"impersonated_brand"`
	ResolvedIPs       []string             `json:"resolved_ips,omitempty"`
	GeoLocation       *IPGeoIntel          `json:"geolocation,omitempty"`
	TLSCert           *TLSCertIntel        `json:"tls_cert,omitempty"`
	WebPosture        *WebSecurityPosture  `json:"web_posture,omitempty"`
	PageAnalysis      *PageContentAnalysis `json:"page_analysis,omitempty"`
	DomainAgeSummary  string               `json:"domain_age_summary,omitempty"`
	RedFlags          []RedFlag            `json:"red_flags"`
	RedirectChain     []string             `json:"redirect_chain"`
	FinalDestination  string               `json:"final_destination"`
	IsShortlink       bool                 `json:"is_shortlink"`
	Recommendations   []string             `json:"recommendations"`
}

func scoreAfterSecurityPosture(score int, posture *WebSecurityPosture) int {
	// Security headers describe hardening quality; they neither prove legitimacy nor erase threat evidence.
	return score
}

var (
	htmlTagPattern    = regexp.MustCompile(`(?is)<[^>]+>`)
	htmlScriptPattern = regexp.MustCompile(`(?is)<(script|style|noscript)[^>]*>.*?</(script|style|noscript)>`)
	htmlTitlePattern  = regexp.MustCompile(`(?is)<title[^>]*>(.*?)</title>`)
	htmlInputPattern  = regexp.MustCompile(`(?is)<input\b[^>]*>`)
	htmlFormPattern   = regexp.MustCompile(`(?is)<form\b[^>]*>`)
)

func htmlAttribute(tag, name string) string {
	pattern := regexp.MustCompile(`(?i)\b` + regexp.QuoteMeta(name) + `\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))`)
	match := pattern.FindStringSubmatch(tag)
	if len(match) == 0 {
		return ""
	}
	for _, value := range match[1:] {
		if value != "" {
			return html.UnescapeString(strings.TrimSpace(value))
		}
	}
	return ""
}

func containsAnyText(text string, terms []string) bool {
	for _, term := range terms {
		if strings.Contains(text, term) {
			return true
		}
	}
	return false
}

func appendUnique(values []string, value string) []string {
	for _, existing := range values {
		if existing == value {
			return values
		}
	}
	return append(values, value)
}

// AnalyzePageContentHTML inventories public page forms without filling or submitting them.
func AnalyzePageContentHTML(pageURL string, body []byte) PageContentAnalysis {
	analysis := PageContentAnalysis{PageCategories: []string{}, InputTypes: []string{}, LoginProviders: []string{}, CrossOriginFormActions: []string{}}
	raw := string(body)
	if titleMatch := htmlTitlePattern.FindStringSubmatch(raw); len(titleMatch) > 1 {
		analysis.PageTitle = strings.TrimSpace(html.UnescapeString(htmlTagPattern.ReplaceAllString(titleMatch[1], " ")))
	}
	visible := strings.ToLower(html.UnescapeString(htmlTagPattern.ReplaceAllString(htmlScriptPattern.ReplaceAllString(raw, " "), " ")))

	analysis.HasRewardBait = containsAnyText(visible, []string{"klaim hadiah", "hadiah uang", "uang gratis", "saldo gratis", "bagi-bagi uang", "bagi bagi uang", "klaim saldo", "selamat anda terpilih", "bonus tunai", "dana gratis"})
	analysis.HasJobBait = containsAnyText(visible, []string{"lowongan kerja", "kerja online", "kerja sampingan", "tugas like", "tugas follow", "komisi harian", "deposit tugas", "tugas vip"})

	rawLower := strings.ToLower(raw)
	gamblingPatterns := []string{
		"bandar bola", "judi online", "taruhan bola", "taruhan online", "situs judi",
		"slot gacor", "situs slot", "slot online", "live casino", "togel online",
		"bandar togel", "sportbook", "agen bola", "daftar slot", "maxwin",
		"rtp slot", "deposit slot", "pragmatic play", "sbobet", "judi slot",
		"taruhan gamesport", "judi terpercaya", "bandar terpercaya", "poker online",
		"agen judi", "situs taruhan", "judi resmi", "slot resmi", "link alternatif slot",
	}
	for _, gp := range gamblingPatterns {
		if strings.Contains(visible, gp) || strings.Contains(strings.ToLower(analysis.PageTitle), gp) || strings.Contains(rawLower, gp) {
			analysis.HasGamblingContent = true
			break
		}
	}
	for _, provider := range []struct{ name, marker string }{{"Google", "google"}, {"Facebook", "facebook"}, {"Apple", "apple"}, {"Microsoft", "microsoft"}} {
		if (strings.Contains(visible, "login") || strings.Contains(visible, "masuk") || strings.Contains(visible, "lanjut")) && strings.Contains(visible, provider.marker) {
			analysis.LoginProviders = appendUnique(analysis.LoginProviders, provider.name)
		}
	}

	for _, inputTag := range htmlInputPattern.FindAllString(raw, -1) {
		inputType := strings.ToLower(htmlAttribute(inputTag, "type"))
		if inputType == "" {
			inputType = "text"
		}
		analysis.InputTypes = appendUnique(analysis.InputTypes, inputType)
		attrs := strings.ToLower(strings.Join([]string{htmlAttribute(inputTag, "name"), htmlAttribute(inputTag, "id"), htmlAttribute(inputTag, "placeholder"), htmlAttribute(inputTag, "autocomplete"), inputType}, " "))
		if inputType == "password" || containsAnyText(attrs, []string{"password", "kata sandi", "passwd"}) {
			analysis.RequestsPassword = true
		}
		if containsAnyText(attrs, []string{"otp", "one-time", "verification code", "kode verifikasi", "kode_otp"}) {
			analysis.RequestsOTP = true
		}
		if containsAnyText(attrs, []string{"dana", "gopay", "ovo", "shopeepay", "linkaja", "e-wallet", "ewallet", "nomor_dompet", "nomor_dana"}) {
			analysis.RequestsEWallet = true
		}
		if containsAnyText(attrs, []string{"card number", "nomor kartu", "credit_card", "debit_card", "cvv", "cvc", "pin", "rekening"}) {
			analysis.RequestsFinancialData = true
		}
	}

	analysis.FormCount = len(htmlFormPattern.FindAllString(raw, -1))
	base, _ := url.Parse(pageURL)
	for _, formTag := range htmlFormPattern.FindAllString(raw, -1) {
		action := htmlAttribute(formTag, "action")
		if action == "" || base == nil {
			continue
		}
		actionURL, err := url.Parse(action)
		if err != nil {
			continue
		}
		resolved := base.ResolveReference(actionURL)
		if resolved.Hostname() != "" && !strings.EqualFold(resolved.Hostname(), base.Hostname()) {
			analysis.CrossOriginFormActions = appendUnique(analysis.CrossOriginFormActions, resolved.String())
		}
	}

	lure := analysis.HasRewardBait || analysis.HasJobBait
	sensitive := analysis.RequestsPassword || analysis.RequestsOTP || analysis.RequestsEWallet || analysis.RequestsFinancialData
	score := 0
	if lure && analysis.RequestsPassword {
		score += 20
	}
	if lure && analysis.RequestsOTP {
		score += 25
	}
	if lure && (analysis.RequestsEWallet || analysis.RequestsFinancialData) {
		score += 20
	}
	if lure && len(analysis.LoginProviders) > 0 {
		score += 10
	}
	if lure && sensitive && len(analysis.CrossOriginFormActions) > 0 {
		score += 20
	}
	if score > 60 {
		score = 60
	}
	analysis.RiskScore = score
	if score > 0 {
		analysis.Summary = "Ditemukan kombinasi umpan dan permintaan data sensitif pada HTML publik. Ini adalah indikator alur rekayasa sosial, bukan bukti bahwa data pernah dikirim atau disalahgunakan."
	} else if sensitive {
		analysis.Summary = "Halaman memiliki formulir autentikasi atau data sensitif tanpa pola umpan yang terdeteksi. Login normal tidak dinilai berbahaya hanya karena meminta kredensial."
	} else {
		analysis.Summary = "Tidak ditemukan kombinasi umpan dan pengambilan data sensitif pada HTML publik yang berhasil dibaca."
	}
	if analysis.HasGamblingContent {
		analysis.PageCategories = appendUnique(analysis.PageCategories, "Judi Online / Taruhan Ilegal")
	}
	if analysis.HasRewardBait {
		analysis.PageCategories = appendUnique(analysis.PageCategories, "Promosi / Hadiah")
	}
	if analysis.HasJobBait {
		analysis.PageCategories = appendUnique(analysis.PageCategories, "Lowongan / Tugas Online")
	}
	if analysis.RequestsPassword || len(analysis.LoginProviders) > 0 {
		analysis.PageCategories = appendUnique(analysis.PageCategories, "Portal Autentikasi / Login")
	}
	if analysis.RequestsEWallet || analysis.RequestsFinancialData {
		analysis.PageCategories = appendUnique(analysis.PageCategories, "Pembayaran / Finansial")
	}
	if len(analysis.PageCategories) == 0 {
		analysis.PageCategories = appendUnique(analysis.PageCategories, "Halaman Informasi / Profil")
	}
	sort.Strings(analysis.PageCategories)

	sort.Strings(analysis.InputTypes)
	sort.Strings(analysis.LoginProviders)
	sort.Strings(analysis.CrossOriginFormActions)
	return analysis
}

// fetchPublicPageHTML performs a passive bounded GET and never submits forms or executes JavaScript.
func fetchPublicPageHTML(targetURL string) ([]byte, string, error) {
	parsed, err := url.Parse(strings.TrimSpace(targetURL))
	if err != nil || (parsed.Scheme != "http" && parsed.Scheme != "https") || parsed.User != nil {
		return nil, "", fmt.Errorf("target URL tidak valid")
	}
	if parsed.Port() != "" && parsed.Port() != "80" && parsed.Port() != "443" {
		return nil, "", fmt.Errorf("port target tidak diizinkan")
	}
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	if _, err := publicIPs(ctx, parsed.Hostname()); err != nil {
		return nil, "", err
	}
	client := &http.Client{
		Timeout:   5 * time.Second,
		Transport: &http.Transport{TLSClientConfig: &tls.Config{MinVersion: tls.VersionTLS12}, DialContext: (&net.Dialer{Timeout: 3 * time.Second}).DialContext},
		CheckRedirect: func(req *http.Request, via []*http.Request) error {
			if len(via) >= 5 {
				return http.ErrUseLastResponse
			}
			if req.URL.Scheme != "http" && req.URL.Scheme != "https" {
				return fmt.Errorf("redirect scheme ditolak")
			}
			if req.URL.Port() != "" && req.URL.Port() != "80" && req.URL.Port() != "443" {
				return fmt.Errorf("redirect port ditolak")
			}
			redirectCtx, redirectCancel := context.WithTimeout(req.Context(), 2*time.Second)
			defer redirectCancel()
			_, resolveErr := publicIPs(redirectCtx, req.URL.Hostname())
			return resolveErr
		},
	}
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, parsed.String(), nil)
	if err != nil {
		return nil, "", err
	}
	req.Header.Set("User-Agent", "PANDU-Passive-Page-Analyzer/1.0 (+https://pandu.web.id)")
	req.Header.Set("Accept", "text/html,application/xhtml+xml")
	resp, err := client.Do(req)
	if err != nil {
		return nil, "", err
	}
	defer resp.Body.Close()
	if resp.StatusCode < 200 || resp.StatusCode >= 400 {
		return nil, "", fmt.Errorf("http_%d", resp.StatusCode)
	}
	contentType := strings.ToLower(resp.Header.Get("Content-Type"))
	if !strings.Contains(contentType, "text/html") && !strings.Contains(contentType, "application/xhtml+xml") {
		return nil, contentType, fmt.Errorf("konten bukan HTML")
	}
	body, err := io.ReadAll(io.LimitReader(resp.Body, 1024*1024+1))
	if err != nil {
		return nil, contentType, err
	}
	if len(body) > 1024*1024 {
		return nil, contentType, fmt.Errorf("HTML melampaui batas 1 MB")
	}
	return body, contentType, nil
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
	hasStructuredThreatEvidence := false

	// 1. Cek apakah Hostname adalah Direct IP (contoh: http://103.123.45.67/login)
	if net.ParseIP(host) != nil {
		result.IsIPAddress = true
		score += 50
		result.RedFlags = append(result.RedFlags, RedFlag{
			Level:       "CRITICAL",
			Title:       "Menggunakan Alamat IP Langsung (Bukan Nama Domain)",
			Explanation: "Layanan resmi perbankan dan instansi umumnya menggunakan nama domain resmi dan sertifikat TLS. Alamat IP langsung adalah indikator teknis yang perlu diperiksa lebih lanjut, tetapi bukan bukti tunggal phishing.",
			Snippet:     host,
		})
	}

	// 2. Deteksi Pencatutan Brand / Typosquatting (Brand Impersonation)
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
				score += 25
				result.ImpersonatedBrand = b.BrandName
				result.RedFlags = append(result.RedFlags, RedFlag{
					Level:       "MEDIUM",
					Title:       fmt.Sprintf("Kemiripan Nama dengan Brand Resmi: %s", b.BrandName),
					Explanation: fmt.Sprintf("Domain '%s' memuat kata yang menyerupai brand '%s', sedangkan domain resmi yang dikenal adalah '%s'. Ini adalah indikator heuristik untuk verifikasi lebih lanjut, bukan bukti bahwa situs melakukan phishing.", host, b.BrandName, strings.Join(b.OfficialDomains, ", ")),
					Snippet:     host,
				})
			}
		}
	}

	// 3. Evaluasi Ekstensi Domain / TLD
	for tld := range suspiciousTLDs {
		if strings.HasSuffix(host, tld) {
			result.TLD = tld
			// TLD alternatif hanya konteks tambahan; tidak boleh mengubah kemiripan nama menjadi vonis phishing.
			if result.ImpersonatedBrand != "" {
				score += 5
			}
			break
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

	// 7. Passively inspect public HTML. Never fill fields, execute JavaScript, or submit forms.
	pageSource := NewSourceResult("page_content", "Analisis Pasif Form & Alur Halaman")
	pageSource.Limitation = "PANDU hanya membaca HTML publik maksimal 1 MB tanpa mengisi atau mengirim formulir. Konten yang baru muncul setelah JavaScript, login, CAPTCHA, atau interaksi pengguna mungkin tidak terlihat."
	pageSource.AttributionURL = result.FinalDestination
	if body, _, fetchErr := fetchPublicPageHTML(result.FinalDestination); fetchErr == nil {
		pageAnalysis := AnalyzePageContentHTML(result.FinalDestination, body)
		result.PageAnalysis = &pageAnalysis
		pageSource.Status = SourceQueried
		pageSource.Outcome = OutcomeContext
		pageSource.Evidence = append(pageSource.Evidence,
			EvidenceItem{Label: "Judul halaman", Value: pageAnalysis.PageTitle},
			EvidenceItem{Label: "Form publik ditemukan", Value: fmt.Sprintf("%d", pageAnalysis.FormCount)},
			EvidenceItem{Label: "Ringkasan alur", Value: pageAnalysis.Summary},
		)
		if len(pageAnalysis.PageCategories) > 0 {
			pageSource.Evidence = append(pageSource.Evidence, EvidenceItem{Label: "Klasifikasi halaman", Value: strings.Join(pageAnalysis.PageCategories, ", ")})
		}
		if len(pageAnalysis.InputTypes) > 0 {
			pageSource.Evidence = append(pageSource.Evidence, EvidenceItem{Label: "Tipe input", Value: strings.Join(pageAnalysis.InputTypes, ", ")})
		}
		if len(pageAnalysis.LoginProviders) > 0 {
			pageSource.Evidence = append(pageSource.Evidence, EvidenceItem{Label: "Login yang ditawarkan", Value: strings.Join(pageAnalysis.LoginProviders, ", ")})
		}
		if len(pageAnalysis.CrossOriginFormActions) > 0 {
			pageSource.Evidence = append(pageSource.Evidence, EvidenceItem{Label: "Tujuan form lintas domain", Value: strings.Join(pageAnalysis.CrossOriginFormActions, ", ")})
		}
		if pageAnalysis.HasGamblingContent {
			hasStructuredThreatEvidence = true
			if score < 80 {
				score = 80
			}
			result.RedFlags = append([]RedFlag{
				{
					Level:       "CRITICAL",
					Title:       "Terindikasi Situs Perjudian / Taruhan Online Ilegal",
					Explanation: "Halaman web secara eksplisit memuat konten taruhan olahraga, bandar bola, kasino, atau slot ilegal (melanggar regulasi digital Indonesia). Waspadai risiko penipuan saldo deposit, pencurian identitas rekening, dan sanksi pemblokiran akses resmi.",
					Snippet:     pageAnalysis.PageTitle,
				},
			}, result.RedFlags...)
		} else if pageAnalysis.RiskScore > 0 {
			score += pageAnalysis.RiskScore
			result.RedFlags = append(result.RedFlags, RedFlag{
				Level:       "HIGH",
				Title:       "Alur Umpan dan Permintaan Data Sensitif Terdeteksi",
				Explanation: pageAnalysis.Summary,
				Snippet:     pageAnalysis.PageTitle,
			})
		}
	} else {
		pageSource.ErrorCategory = "html_unavailable"
	}
	result.Sources = append(result.Sources, pageSource)

	// 8. Query public registration, scan context, and live web footprint in parallel.
	if net.ParseIP(host) == nil {
		ctx, cancel := context.WithTimeout(context.Background(), 12*time.Second)
		type sourceResponse struct{ source SourceResult }
		ch := make(chan sourceResponse, 3)
		go func() { ch <- sourceResponse{QueryRDAPDomain(ctx, host)} }()
		go func() { ch <- sourceResponse{QueryURLScan(ctx, host)} }()
		go func() { ch <- sourceResponse{QueryWebFootprint(ctx, "url", host)} }()
		for i := 0; i < 3; i++ {
			s := (<-ch).source
			result.Sources = append(result.Sources, s)
			if s.ID == "urlscan" && s.Outcome == OutcomeMatch {
				hasStructuredThreatEvidence = true
				score += 80
				result.RedFlags = append(result.RedFlags, RedFlag{
					Level:       "CRITICAL",
					Title:       "Domain Tercatat pada Feed Phishing Terstruktur",
					Explanation: "Riwayat pemindaian publik urlscan.io menunjukkan entri yang berasal dari feed OpenPhish. Kecocokan ini adalah bukti sumber eksternal, bukan sekadar domain pernah dipindai.",
					Snippet:     host,
				})
			}
			if s.ID == "web_footprint" && s.Outcome == OutcomeMatch && len(s.Evidence) > 0 {
				score += 35
				result.RedFlags = append(result.RedFlags, RedFlag{
					Level:       "HIGH",
					Title:       "Domain Muncul dalam Jejak Aduan / Laporan Publik",
					Explanation: "Ditemukan catatan pembicaraan publik atau forum aduan penipuan yang mengaitkan domain ini di internet.",
					Snippet:     host,
				})
			}
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

	// 9. Multi-Path Live Security Posture & Architecture Audit
	posture := AuditWebSecurityPosture(input)
	if posture != nil {
		result.WebPosture = posture
		score = scoreAfterSecurityPosture(score, posture)
		if strings.HasPrefix(posture.SecurityGrade, "A") {
			result.Recommendations = append(result.Recommendations, "Situs menerapkan hardening web modern. Ini menunjukkan kualitas konfigurasi teknis, bukan bukti identitas pemilik atau reputasi keamanan situs.")
		} else if strings.HasPrefix(posture.SecurityGrade, "C") && result.ImpersonatedBrand != "" {
			score += 15
			result.RedFlags = append(result.RedFlags, RedFlag{
				Level:       "HIGH",
				Title:       "Website Minim Konfigurasi Keamanan Standar",
				Explanation: "Situs tidak menerapkan proteksi HSTS atau anti-clickjacking yang umum ditemukan pada situs phishing tiruan.",
				Snippet:     input,
			})
		}
	}

	// 10. Extract Domain Age Summary from RDAP if present
	for _, s := range result.Sources {
		if s.ID == "rdap" {
			for _, ev := range s.Evidence {
				if ev.Label == "Umur Domain Aktif" {
					result.DomainAgeSummary = ev.Value
				}
			}
		}
	}

	// Heuristik lokal tidak boleh menghasilkan vonis phishing tinggi tanpa bukti ancaman terstruktur.
	if !hasStructuredThreatEvidence && score > 60 {
		score = 60
	}
	if score > 100 {
		score = 100
	}
	result.RiskScore = score

	switch {
	case hasStructuredThreatEvidence && score >= 70:
		if result.PageAnalysis != nil && result.PageAnalysis.HasGamblingContent {
			result.ThreatLevel = "BAHAYA / TERINDIKASI JUDI ONLINE"
			result.Recommendations = append(result.Recommendations, "Situs ini terindikasi kuat sebagai platform perjudian atau taruhan online ilegal.", "Jangan melakukan pendaftaran akun, pengisian nomor rekening, atau transfer deposit uang.")
		} else {
			result.ThreatLevel = "BAHAYA / TERCATAT PADA FEED PHISHING"
			result.Recommendations = append(result.Recommendations, "JANGAN BUKA TAUTAN INI!", "Jangan pernah memasukkan username, kata sandi, nomor kartu, atau kode OTP pada website ini.")
		}
	case score >= 35:
		result.ThreatLevel = "WASPADA / INDIKATOR HEURISTIK"
		result.Recommendations = append(result.Recommendations, "Periksa kembali ejaan domain di address bar sebelum melanjutkan.", "Kemiripan nama atau struktur domain bukan bukti tindak phishing tanpa kecocokan pada sumber ancaman.")
	case score > 0:
		result.ThreatLevel = "PERLU VERIFIKASI / INDIKATOR HEURISTIK RINGAN"
		result.Recommendations = append(result.Recommendations, "Ditemukan kemiripan struktur atau nama domain, tetapi tidak ada kecocokan pada feed ancaman yang berhasil diperiksa.")
	default:
		result.ThreatLevel = "TIDAK DITEMUKAN INDIKATOR ANCAMAN PADA SUMBER YANG DIPERIKSA"
		result.Recommendations = append(result.Recommendations, "Tidak ditemukannya indikator pada sumber yang berhasil diperiksa bukan jaminan bahwa website aman.")
	}
	result.Coverage, result.CoverageSummary = SummarizeCoverage(result.Sources)
	return result
}

// AuditWebSecurityPosture probes the target website for live HTTP security headers and infrastructure posture.
func AuditWebSecurityPosture(targetURL string) *WebSecurityPosture {
	cleanURL := strings.TrimSpace(targetURL)
	if !strings.HasPrefix(cleanURL, "http://") && !strings.HasPrefix(cleanURL, "https://") {
		cleanURL = "https://" + cleanURL
	}

	parsed, err := url.Parse(cleanURL)
	if err != nil {
		return nil
	}

	ctx, cancel := context.WithTimeout(context.Background(), 2*time.Second)
	_, err = publicIPs(ctx, parsed.Hostname())
	cancel()
	if err != nil {
		return nil
	}

	client := &http.Client{
		Timeout: 3 * time.Second,
		Transport: &http.Transport{
			TLSClientConfig: &tls.Config{InsecureSkipVerify: true},
			DialContext:     (&net.Dialer{Timeout: 2 * time.Second}).DialContext,
		},
	}

	req, err := http.NewRequest(http.MethodHead, cleanURL, nil)
	if err != nil {
		return nil
	}
	req.Header.Set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36 PanduSecurityScanner/1.0")

	resp, err := client.Do(req)
	if err != nil || resp.StatusCode >= 400 {
		req.Method = http.MethodGet
		resp, err = client.Do(req)
		if err != nil {
			return nil
		}
	}
	defer resp.Body.Close()

	posture := &WebSecurityPosture{
		HTTPStatus:        resp.StatusCode,
		HTTPSActive:       resp.TLS != nil || strings.HasPrefix(cleanURL, "https://"),
		HasHSTS:           resp.Header.Get("Strict-Transport-Security") != "",
		HasCSP:            resp.Header.Get("Content-Security-Policy") != "",
		HasXFrameOptions:  resp.Header.Get("X-Frame-Options") != "",
		HasContentType:    strings.Contains(strings.ToLower(resp.Header.Get("X-Content-Type-Options")), "nosniff"),
		HasReferrerPolicy: resp.Header.Get("Referrer-Policy") != "",
		ServerBanner:      resp.Header.Get("Server"),
		SecurityStrengths: []string{},
	}

	score := 0
	if posture.HTTPSActive {
		score += 25
		posture.SecurityStrengths = append(posture.SecurityStrengths, "Enkripsi Protokol HTTPS Aktif")
	}
	if posture.HasHSTS {
		score += 25
		posture.SecurityStrengths = append(posture.SecurityStrengths, "Proteksi HSTS (Strict-Transport-Security) Aktif")
	}
	if posture.HasXFrameOptions {
		score += 20
		posture.SecurityStrengths = append(posture.SecurityStrengths, fmt.Sprintf("Anti-Clickjacking Terpasang (X-Frame-Options: %s)", resp.Header.Get("X-Frame-Options")))
	}
	if posture.HasContentType {
		score += 15
		posture.SecurityStrengths = append(posture.SecurityStrengths, "Anti-MIME Sniffing Terpasang (nosniff)")
	}
	if posture.HasReferrerPolicy {
		score += 15
		posture.SecurityStrengths = append(posture.SecurityStrengths, "Perlindungan Privasi Referrer Terpasang")
	}

	switch {
	case score >= 70:
		posture.SecurityGrade = "A (Infrastruktur Terlindungi & Sangat Tangguh)"
	case score >= 40:
		posture.SecurityGrade = "B (Standar Pengamanan Dasar Aktif)"
	default:
		posture.SecurityGrade = "C (Minim Konfigurasi Keamanan Web)"
	}

	return posture
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
