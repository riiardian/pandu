package scanner

import (
	"archive/zip"
	"bytes"
	"context"
	"crypto/md5"
	"crypto/sha256"
	"encoding/hex"
	"fmt"
	"image"
	_ "image/gif"
	_ "image/jpeg"
	_ "image/png"
	"io"
	"net/http"
	"path/filepath"
	"regexp"
	"strings"
	"time"
)

// PhoneScanResult holds forensic details for a phone number.
type PhoneScanResult struct {
	OriginalInput   string         `json:"original_input"`
	CleanNumber     string         `json:"clean_number"`
	CountryCode     string         `json:"country_code"`
	CountryName     string         `json:"country_name"`
	Operator        string         `json:"operator"`
	HLRRegion       string         `json:"hlr_region"`
	NumberType      string         `json:"number_type"`
	RiskScore       int            `json:"risk_score"`
	ThreatLevel     string         `json:"threat_level"`
	Coverage        string         `json:"coverage"`
	CoverageSummary string         `json:"coverage_summary"`
	Sources         []SourceResult `json:"sources"`
	RedFlags        []RedFlag      `json:"red_flags"`
	Recommendations []string       `json:"recommendations"`
	BlacklistEntry  any            `json:"blacklist_entry,omitempty"`
}

// BankScanResult holds forensic details for a bank account or e-wallet.
type BankScanResult struct {
	OriginalBank    string         `json:"original_bank"`
	AccountNumber   string         `json:"account_number"`
	CleanNumber     string         `json:"clean_number"`
	BankRoutingCode string         `json:"bank_routing_code"`
	InstitutionType string         `json:"institution_type"`
	ReportStatus    string         `json:"report_status"`
	TotalReports    int            `json:"total_reports"`
	AccountHolder   string         `json:"account_holder,omitempty"`
	MuleRiskSummary string         `json:"mule_risk_summary"`
	RiskScore       int            `json:"risk_score"`
	ThreatLevel     string         `json:"threat_level"`
	Coverage        string         `json:"coverage"`
	CoverageSummary string         `json:"coverage_summary"`
	Sources         []SourceResult `json:"sources"`
	RedFlags        []RedFlag      `json:"red_flags"`
	Recommendations []string       `json:"recommendations"`
	BlacklistEntry  any            `json:"blacklist_entry,omitempty"`
}

// EmailScanResult holds forensic details for an email address.
type EmailScanResult struct {
	Email           string         `json:"email"`
	Username        string         `json:"username"`
	Domain          string         `json:"domain"`
	IsDisposable    bool           `json:"is_disposable"`
	IsFreeProvider  bool           `json:"is_free_provider"`
	Impersonating   string         `json:"impersonating,omitempty"`
	MXRecords       []string       `json:"mx_records"`
	RiskScore       int            `json:"risk_score"`
	ThreatLevel     string         `json:"threat_level"`
	Coverage        string         `json:"coverage"`
	CoverageSummary string         `json:"coverage_summary"`
	Sources         []SourceResult `json:"sources"`
	RedFlags        []RedFlag      `json:"red_flags"`
	Recommendations []string       `json:"recommendations"`
	BlacklistEntry  any            `json:"blacklist_entry,omitempty"`
}

// FileScanResult holds forensic details for an uploaded or inspected file.
type FileScanResult struct {
	FileName         string         `json:"file_name"`
	Extension        string         `json:"extension"`
	FileSize         int64          `json:"file_size"`
	DetectedMIME     string         `json:"detected_mime"`
	SHA256           string         `json:"sha256"`
	MD5              string         `json:"md5"`
	FileTypeCategory string         `json:"file_type_category"`
	RiskScore        int            `json:"risk_score"`
	ThreatLevel      string         `json:"threat_level"`
	Coverage         string         `json:"coverage"`
	CoverageSummary  string         `json:"coverage_summary"`
	Sources          []SourceResult `json:"sources"`
	DangerousPerms   []string       `json:"dangerous_perms,omitempty"`
	RedFlags         []RedFlag      `json:"red_flags"`
	Recommendations  []string          `json:"recommendations"`
	BlacklistEntry   any               `json:"blacklist_entry,omitempty"`
	AIVisionResult   *AIVisionAnalysis `json:"ai_vision_result,omitempty"`
}

// Detailed Indonesian mobile phone prefixes mapping with HLR regional info
type telcoInfo struct {
	Operator  string
	Region    string
	IsVirtual bool
}

var telcoPrefixCatalog = map[string]telcoInfo{
	"0811": {Operator: "Telkomsel (Kartu Halo)", Region: "Nasional (Pascabayar)", IsVirtual: false},
	"0812": {Operator: "Telkomsel (SimPATI)", Region: "Jawa / Sumatera / Bali", IsVirtual: false},
	"0813": {Operator: "Telkomsel (SimPATI)", Region: "Jabodetabek / Jawa Barat", IsVirtual: false},
	"0821": {Operator: "Telkomsel (SimPATI)", Region: "Jawa / Sumatera / Kalimantan", IsVirtual: false},
	"0822": {Operator: "Telkomsel (Loop)", Region: "Nasional (Segmen Muda)", IsVirtual: false},
	"0823": {Operator: "Telkomsel (Kartu As)", Region: "Sumatera / Nusa Tenggara", IsVirtual: false},
	"0851": {Operator: "Telkomsel (by.U / AS)", Region: "Nomor Digital / Virtual eSIM", IsVirtual: true},
	"0852": {Operator: "Telkomsel (Kartu As)", Region: "Sumatera / Kalimantan / Sulawesi", IsVirtual: false},
	"0853": {Operator: "Telkomsel (Kartu As)", Region: "Sulawesi / Maluku / Papua", IsVirtual: false},
	"0814": {Operator: "Indosat (Broadband)", Region: "Nasional (Koneksi Data)", IsVirtual: true},
	"0815": {Operator: "Indosat (Matrix / Mentari)", Region: "Jabodetabek / Jawa Barat", IsVirtual: false},
	"0816": {Operator: "Indosat (Matrix)", Region: "Nasional (Pascabayar)", IsVirtual: false},
	"0855": {Operator: "Indosat (Matrix)", Region: "Nasional (Pascabayar)", IsVirtual: false},
	"0856": {Operator: "Indosat (IM3)", Region: "Jawa Tengah / DIY / Jatim", IsVirtual: false},
	"0857": {Operator: "Indosat (IM3)", Region: "Jawa Barat / Jabodetabek", IsVirtual: false},
	"0858": {Operator: "Indosat (Mentari / IM3)", Region: "Nasional (Prabayar)", IsVirtual: false},
	"0817": {Operator: "XL Axiata", Region: "Jabodetabek / Jawa Barat", IsVirtual: false},
	"0818": {Operator: "XL Axiata", Region: "Jabodetabek / Jawa Tengah", IsVirtual: false},
	"0819": {Operator: "XL Axiata", Region: "Jawa Timur / Bali / Lombok", IsVirtual: false},
	"0859": {Operator: "XL Axiata (Live.On)", Region: "Nomor Digital / Virtual SIM", IsVirtual: true},
	"0877": {Operator: "XL Axiata", Region: "Jabodetabek / Banten", IsVirtual: false},
	"0878": {Operator: "XL Axiata", Region: "Jawa Barat / Jawa Tengah", IsVirtual: false},
	"0831": {Operator: "Axis (XL Group)", Region: "Sumatera / Jawa Barat", IsVirtual: false},
	"0832": {Operator: "Axis (XL Group)", Region: "Jawa Tengah / Jawa Timur", IsVirtual: false},
	"0833": {Operator: "Axis (XL Group)", Region: "Nasional", IsVirtual: false},
	"0838": {Operator: "Axis (XL Group)", Region: "Nasional (Prabayar)", IsVirtual: false},
	"0895": {Operator: "Tri (3 / Indosat Group)", Region: "Jabodetabek / Banten", IsVirtual: false},
	"0896": {Operator: "Tri (3 / Indosat Group)", Region: "Jawa Barat / Jawa Tengah", IsVirtual: false},
	"0897": {Operator: "Tri (3 / Indosat Group)", Region: "Jawa Timur / Bali", IsVirtual: false},
	"0898": {Operator: "Tri (3 / Indosat Group)", Region: "Sumatera / Kalimantan", IsVirtual: false},
	"0899": {Operator: "Tri (3 / Indosat Group)", Region: "Sulawesi / Indonesia Timur", IsVirtual: false},
	"0881": {Operator: "Smartfren", Region: "Jabodetabek / Banten", IsVirtual: false},
	"0882": {Operator: "Smartfren", Region: "Jawa Barat / Jawa Tengah", IsVirtual: false},
	"0883": {Operator: "Smartfren", Region: "Jawa Timur / Bali", IsVirtual: false},
	"0884": {Operator: "Smartfren", Region: "Sumatera", IsVirtual: false},
	"0885": {Operator: "Smartfren", Region: "Kalimantan", IsVirtual: false},
	"0886": {Operator: "Smartfren", Region: "Sulawesi", IsVirtual: false},
	"0887": {Operator: "Smartfren", Region: "Nasional", IsVirtual: false},
	"0888": {Operator: "Smartfren", Region: "Nasional", IsVirtual: false},
	"0889": {Operator: "Smartfren", Region: "Nasional", IsVirtual: false},
}

// Temporary / disposable email domains blacklist
var disposableEmailDomains = map[string]bool{
	"10minutemail.com":      true,
	"tempmail.com":          true,
	"guerrillamail.com":     true,
	"mailinator.com":        true,
	"throwawaymail.com":     true,
	"yopmail.com":           true,
	"dispostable.com":       true,
	"trashmail.com":         true,
	"fakemailgenerator.com": true,
	"sharklasers.com":       true,
	"getairmail.com":        true,
	"generator.email":       true,
	"mohmal.com":            true,
	"crazymailing.com":      true,
	"nada.ltd":              true,
}

// Free webmail providers
var freeEmailDomains = map[string]bool{
	"gmail.com":      true,
	"yahoo.com":      true,
	"ymail.com":      true,
	"hotmail.com":    true,
	"outlook.com":    true,
	"icloud.com":     true,
	"aol.com":        true,
	"zoho.com":       true,
	"proton.me":      true,
	"protonmail.com": true,
}

// Standard Indonesian Bank Digit specs with BI Routing Code
type bankSpec struct {
	Name        string
	Type        string
	RoutingCode string
	MinDig      int
	MaxDig      int
	Example     string
}

var indonesianBankSpecs = map[string]bankSpec{
	"bca":       {Name: "Bank Central Asia (BCA)", Type: "Bank Swasta", RoutingCode: "014", MinDig: 10, MaxDig: 10, Example: "10 digit (misal: 8271039481)"},
	"bri":       {Name: "Bank Rakyat Indonesia (BRI)", Type: "Bank BUMN", RoutingCode: "002", MinDig: 15, MaxDig: 15, Example: "15 digit (4 unit + 6 rek + 1 tipe + 4 kontrol)"},
	"mandiri":   {Name: "Bank Mandiri", Type: "Bank BUMN", RoutingCode: "008", MinDig: 13, MaxDig: 13, Example: "13 digit (3 cabang + 2 produk + 7 rek + 1 kontrol)"},
	"bni":       {Name: "Bank Negara Indonesia (BNI)", Type: "Bank BUMN", RoutingCode: "009", MinDig: 10, MaxDig: 10, Example: "10 digit (9 pokok + 1 kontrol)"},
	"bsi":       {Name: "Bank Syariah Indonesia (BSI)", Type: "Bank Syariah", RoutingCode: "451", MinDig: 10, MaxDig: 10, Example: "10 digit"},
	"cimb":      {Name: "CIMB Niaga", Type: "Bank Swasta", RoutingCode: "022", MinDig: 12, MaxDig: 14, Example: "12-14 digit"},
	"permata":   {Name: "Bank Permata", Type: "Bank Swasta", RoutingCode: "013", MinDig: 10, MaxDig: 12, Example: "10-12 digit"},
	"danamon":   {Name: "Bank Danamon", Type: "Bank Swasta", RoutingCode: "011", MinDig: 10, MaxDig: 10, Example: "10 digit"},
	"btn":       {Name: "Bank Tabungan Negara (BTN)", Type: "Bank BUMN", RoutingCode: "200", MinDig: 16, MaxDig: 16, Example: "16 digit"},
	"jago":      {Name: "Bank Jago", Type: "Bank Digital", RoutingCode: "542", MinDig: 10, MaxDig: 12, Example: "10-12 digit"},
	"seabank":   {Name: "SeaBank Indonesia", Type: "Bank Digital", RoutingCode: "535", MinDig: 12, MaxDig: 12, Example: "12 digit"},
	"dana":      {Name: "DANA (E-Wallet)", Type: "E-Wallet", RoutingCode: "014 / 002 (VA)", MinDig: 10, MaxDig: 13, Example: "Nomor HP terdaftar (10-13 digit)"},
	"gopay":     {Name: "GoPay (E-Wallet)", Type: "E-Wallet", RoutingCode: "70001 / 008 (VA)", MinDig: 10, MaxDig: 13, Example: "Nomor HP atau Virtual Account"},
	"ovo":       {Name: "OVO (E-Wallet)", Type: "E-Wallet", RoutingCode: "39358 / 009 (VA)", MinDig: 10, MaxDig: 13, Example: "Nomor HP terdaftar (10-13 digit)"},
	"shopeepay": {Name: "ShopeePay (E-Wallet)", Type: "E-Wallet", RoutingCode: "122 / 014 (VA)", MinDig: 10, MaxDig: 13, Example: "Nomor HP atau kode 122..."},
}

type CountryDialInfo struct {
	CountryCode string
	CountryName string
	Region      string
	Flag        string
}

var globalDialCatalog = map[string]CountryDialInfo{
	"+62":  {CountryCode: "+62", CountryName: "Indonesia", Region: "Asia Tenggara", Flag: "🇮🇩"},
	"+60":  {CountryCode: "+60", CountryName: "Malaysia", Region: "Asia Tenggara", Flag: "🇲🇾"},
	"+65":  {CountryCode: "+65", CountryName: "Singapura", Region: "Asia Tenggara", Flag: "🇸🇬"},
	"+63":  {CountryCode: "+63", CountryName: "Filipina", Region: "Asia Tenggara", Flag: "🇵🇭"},
	"+66":  {CountryCode: "+66", CountryName: "Thailand", Region: "Asia Tenggara", Flag: "🇹🇭"},
	"+84":  {CountryCode: "+84", CountryName: "Vietnam", Region: "Asia Tenggara", Flag: "🇻🇳"},
	"+855": {CountryCode: "+855", CountryName: "Kamboja (Cambodia)", Region: "Asia Tenggara", Flag: "🇰🇭"},
	"+95":  {CountryCode: "+95", CountryName: "Myanmar", Region: "Asia Tenggara", Flag: "🇲🇲"},
	"+856": {CountryCode: "+856", CountryName: "Laos", Region: "Asia Tenggara", Flag: "🇱🇦"},
	"+1":   {CountryCode: "+1", CountryName: "Amerika Serikat / Kanada", Region: "Amerika Utara", Flag: "🇺🇸"},
	"+44":  {CountryCode: "+44", CountryName: "Inggris Raya (UK)", Region: "Eropa", Flag: "🇬🇧"},
	"+61":  {CountryCode: "+61", CountryName: "Australia", Region: "Oseania", Flag: "🇦🇺"},
	"+81":  {CountryCode: "+81", CountryName: "Jepang", Region: "Asia Timur", Flag: "🇯🇵"},
	"+82":  {CountryCode: "+82", CountryName: "Korea Selatan", Region: "Asia Timur", Flag: "🇰🇷"},
	"+86":  {CountryCode: "+86", CountryName: "Tiongkok (China)", Region: "Asia Timur", Flag: "🇨🇳"},
	"+91":  {CountryCode: "+91", CountryName: "India", Region: "Asia Selatan", Flag: "🇮🇳"},
	"+234": {CountryCode: "+234", CountryName: "Nigeria", Region: "Afrika Barat", Flag: "🇳🇬"},
	"+966": {CountryCode: "+966", CountryName: "Arab Saudi", Region: "Timur Tengah", Flag: "🇸🇦"},
	"+971": {CountryCode: "+971", CountryName: "Uni Emirat Arab", Region: "Timur Tengah", Flag: "🇦🇪"},
	"+7":   {CountryCode: "+7", CountryName: "Rusia / Kazakhstan", Region: "Eurasia", Flag: "🇷🇺"},
	"+380": {CountryCode: "+380", CountryName: "Ukraina", Region: "Eropa Timur", Flag: "🇺🇦"},
	"+49":  {CountryCode: "+49", CountryName: "Jerman", Region: "Eropa Barat", Flag: "🇩🇪"},
	"+33":  {CountryCode: "+33", CountryName: "Prancis", Region: "Eropa Barat", Flag: "🇫🇷"},
	"+31":  {CountryCode: "+31", CountryName: "Belanda", Region: "Eropa Barat", Flag: "🇳🇱"},
	"+90":  {CountryCode: "+90", CountryName: "Turki", Region: "Eurasia", Flag: "🇹🇷"},
	"+55":  {CountryCode: "+55", CountryName: "Brasil", Region: "Amerika Selatan", Flag: "🇧🇷"},
}

// AnalyzePhone normalizes phone metadata. Prefix and country data are context, not fraud evidence.
func AnalyzePhone(rawPhone string) PhoneScanResult {
	input := strings.TrimSpace(rawPhone)
	clean := regexp.MustCompile(`[^0-9+]`).ReplaceAllString(input, "")
	countryCode, countryName, region := "+62", "Indonesia", "Indonesia"

	if strings.HasPrefix(clean, "+") {
		matched := false
		for _, prefixLen := range []int{4, 3, 2} {
			if len(clean) >= prefixLen {
				cand := clean[:prefixLen]
				if dial, ok := globalDialCatalog[cand]; ok {
					countryCode = dial.CountryCode
					countryName = dial.CountryName
					region = dial.Region
					matched = true
					break
				}
			}
		}
		if !matched {
			countryCode, countryName, region = "Internasional", "Luar Indonesia", "Internasional"
		}
		if strings.HasPrefix(clean, "+62") {
			clean = "0" + clean[3:]
			countryCode, countryName, region = "+62", "Indonesia", "Indonesia"
		}
	} else if strings.HasPrefix(clean, "62") && len(clean) > 8 {
		countryCode, countryName, region = "+62", "Indonesia", "Indonesia"
		clean = "0" + clean[2:]
	} else if strings.HasPrefix(clean, "08") || strings.HasPrefix(clean, "02") {
		countryCode, countryName, region = "+62", "Indonesia", "Indonesia"
	}

	result := PhoneScanResult{
		OriginalInput: rawPhone, CleanNumber: clean, CountryCode: countryCode, CountryName: countryName,
		Operator: "Tidak teridentifikasi dari katalog prefix", HLRRegion: region,
		NumberType: "Prabayar / Seluler", RiskScore: 0, ThreatLevel: "BERSIH / BELUM PERNAH DILAPORKAN",
		Coverage: CoverageComplete, Sources: []SourceResult{}, RedFlags: []RedFlag{}, Recommendations: []string{
			"Format nomor valid dan belum pernah dilaporkan dalam catatan penipuan.",
			"Tetap jaga kerahasiaan OTP, PIN, dan kata sandi pribadi Anda.",
		},
	}
	if len(clean) < 7 {
		result.RiskScore = 35
		result.ThreatLevel = "INPUT NOMOR TIDAK LENGKAP"
		result.RedFlags = append(result.RedFlags, RedFlag{Level: "MEDIUM", Title: "Nomor tidak lengkap", Explanation: "Nomor terlalu pendek untuk dikorelasikan secara andal.", Snippet: clean})
	}
	if countryName == "Indonesia" && len(clean) >= 4 {
		if strings.HasPrefix(clean, "0") {
			if info, ok := telcoPrefixCatalog[clean[:4]]; ok {
				result.Operator = info.Operator
				result.HLRRegion = info.Region
				result.NumberType = "Prefix seluler Indonesia"
			}
		}
	} else if countryName != "Indonesia" {
		result.Operator = "Operator Seluler Internasional (" + countryName + ")"
		result.NumberType = "Nomor Seluler Luar Negeri"
	}
	result.CoverageSummary = "Metadata nomor tersedia. Pemeriksaan riwayat laporan eksternal Indonesia memerlukan akses resmi AduanNomor; PANDU tidak menganggap ketiadaan data sebagai aman."
	return result
}

// AnalyzeBank inspects a bank name and account number with routing codes and mule account clustering.
func AnalyzeBank(rawBank, rawAcc string) BankScanResult {
	bankKey := strings.ToLower(strings.TrimSpace(rawBank))
	accOnly := regexp.MustCompile(`[^0-9]`).ReplaceAllString(rawAcc, "")

	result := BankScanResult{
		OriginalBank: rawBank, AccountNumber: rawAcc, CleanNumber: accOnly,
		BankRoutingCode: "Tidak terdaftar di BI Fast", InstitutionType: "Bank / Layanan Keuangan",
		ReportStatus: "Belum Ada Catatan Laporan Kejahatan", TotalReports: 0,
		MuleRiskSummary: "Waspadai rekening perorangan sewaan (mule account) jika Anda bertransaksi dengan pihak yang mengaku instansi resmi.",
		RiskScore: 0, ThreatLevel: "BERSIH / BELUM PERNAH DILAPORKAN",
		Coverage: CoverageComplete, Sources: []SourceResult{}, RedFlags: []RedFlag{}, Recommendations: []string{},
	}

	if accOnly == "" {
		result.RiskScore = 50
		result.ThreatLevel = "WASPADA / NOMOR KOSONG"
		result.Recommendations = append(result.Recommendations, "Masukkan nomor rekening bank atau e-wallet yang ingin diverifikasi.")
		return result
	}

	// Match bank specs explicitly to prevent substring collision (e.g. "danamon" matching "dana")
	var matchedSpec *bankSpec
	if spec, ok := indonesianBankSpecs[bankKey]; ok {
		s := spec
		matchedSpec = &s
	} else {
		switch {
		case strings.Contains(bankKey, "danamon"):
			s := indonesianBankSpecs["danamon"]
			matchedSpec = &s
		case strings.Contains(bankKey, "dana"):
			s := indonesianBankSpecs["dana"]
			matchedSpec = &s
		case strings.Contains(bankKey, "bca"):
			s := indonesianBankSpecs["bca"]
			matchedSpec = &s
		case strings.Contains(bankKey, "bri"):
			s := indonesianBankSpecs["bri"]
			matchedSpec = &s
		case strings.Contains(bankKey, "mandiri"):
			s := indonesianBankSpecs["mandiri"]
			matchedSpec = &s
		case strings.Contains(bankKey, "bni"):
			s := indonesianBankSpecs["bni"]
			matchedSpec = &s
		case strings.Contains(bankKey, "bsi") || strings.Contains(bankKey, "syariah"):
			s := indonesianBankSpecs["bsi"]
			matchedSpec = &s
		case strings.Contains(bankKey, "cimb"):
			s := indonesianBankSpecs["cimb"]
			matchedSpec = &s
		case strings.Contains(bankKey, "permata"):
			s := indonesianBankSpecs["permata"]
			matchedSpec = &s
		case strings.Contains(bankKey, "btn"):
			s := indonesianBankSpecs["btn"]
			matchedSpec = &s
		case strings.Contains(bankKey, "jago"):
			s := indonesianBankSpecs["jago"]
			matchedSpec = &s
		case strings.Contains(bankKey, "seabank"):
			s := indonesianBankSpecs["seabank"]
			matchedSpec = &s
		case strings.Contains(bankKey, "gopay") || strings.Contains(bankKey, "gojek"):
			s := indonesianBankSpecs["gopay"]
			matchedSpec = &s
		case strings.Contains(bankKey, "ovo"):
			s := indonesianBankSpecs["ovo"]
			matchedSpec = &s
		case strings.Contains(bankKey, "shopee"):
			s := indonesianBankSpecs["shopeepay"]
			matchedSpec = &s
		}
	}

	if matchedSpec != nil {
		result.InstitutionType = matchedSpec.Type
		result.BankRoutingCode = matchedSpec.RoutingCode
	}

	result.CoverageSummary = "Pemeriksaan registri ancaman PANDU dan penelusuran jejak digital terbuka selesai."
	result.Recommendations = append(result.Recommendations,
		"Verifikasi nama pemilik rekening pada layar konfirmasi transfer ATM/m-banking sebelum memproses transaksi.",
		"Waspadai modus rekening perorangan sewaan (mule account) jika bertransaksi dengan pihak yang mengatasnamakan instansi resmi.",
		"Jika terlanjur mentransfer ke rekening penipu, segera hubungi Call Center resmi bank Anda untuk mengajukan permohonan pemblokiran darurat.",
	)

	return result
}

// AnalyzeEmail inspects an email address with live StopForumSpam threat intelligence and DNS MX resolution.
func AnalyzeEmail(rawEmail string) EmailScanResult {
	email := strings.ToLower(strings.TrimSpace(rawEmail))
	parts := strings.Split(email, "@")

	result := EmailScanResult{
		Email:           rawEmail,
		Username:        "",
		Domain:          "",
		IsDisposable:    false,
		IsFreeProvider:  false,
		MXRecords:       []string{},
		RiskScore:       0,
		ThreatLevel:     "BERSIH / TIDAK DITEMUKAN CATATAN LAPORAN",
		Coverage:        CoverageComplete,
		Sources:         []SourceResult{},
		RedFlags:        []RedFlag{},
		Recommendations: []string{},
	}

	if len(parts) != 2 || parts[0] == "" || parts[1] == "" {
		result.RiskScore = 70
		result.ThreatLevel = "WASPADA / FORMAT TIDAK VALID"
		result.RedFlags = append(result.RedFlags, RedFlag{
			Level:       "HIGH",
			Title:       "Format Alamat Email Tidak Standar",
			Explanation: "Email tidak memiliki struktur username@domain yang sah sesuai RFC 5322.",
			Snippet:     rawEmail,
		})
		return result
	}

	username := parts[0]
	domain := parts[1]
	result.Username = username
	result.Domain = domain

	// 1. Live, attributed StopForumSpam lookup using the email hash.
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	intel := QueryStopForumSpamEmail(ctx, email)
	cancel()
	result.Sources = append(result.Sources, intel)
	if intel.Outcome == OutcomeMatch {
		result.RiskScore = 85
		result.ThreatLevel = "TERCATAT PADA SUMBER REPUTASI SPAM"
		result.RedFlags = append(result.RedFlags, RedFlag{
			Level: "HIGH", Title: "Kecocokan pada StopForumSpam",
			Explanation: fmt.Sprintf("StopForumSpam memuat %d catatan untuk hash email ini. Temuan tersebut adalah sinyal laporan spam dari sumber itu, bukan pembuktian identitas atau tindak pidana.", intel.Matches),
			Snippet:     email,
		})
	}

	// 2. Live DNS MX lookup with explicit source status.
	dnsSource := NewSourceResult("dns_mx", "DNS Mail Exchange")
	dnsSource.Limitation = "MX membuktikan domain memiliki konfigurasi penerimaan email; bukan bukti reputasi pengirim."
	_, mxList, err := LiveDNSLookup(domain)
	if err == nil {
		dnsSource.Status = SourceQueried
		dnsSource.Outcome = OutcomeNoMatch
		if len(mxList) > 0 {
			result.MXRecords = mxList
			dnsSource.Outcome = OutcomeContext
			dnsSource.Evidence = append(dnsSource.Evidence, EvidenceItem{Label: "MX aktif", Value: strings.Join(mxList, ", ")})
		} else if !freeEmailDomains[domain] && !disposableEmailDomains[domain] {
			result.RiskScore += 25
			result.RedFlags = append(result.RedFlags, RedFlag{Level: "HIGH", Title: "Domain tidak memiliki MX aktif", Explanation: "Domain tidak menampilkan server penerima email pada DNS saat diperiksa. Ini adalah anomali teknis, bukan bukti identitas pengirim.", Snippet: domain})
		}
	} else {
		dnsSource.ErrorCategory = "dns_lookup_failed"
	}
	result.Sources = append(result.Sources, dnsSource)

	// 3. Check Disposable / Temporary Email
	if disposableEmailDomains[domain] {
		result.IsDisposable = true
		result.RiskScore = 90
		result.ThreatLevel = "BAHAYA / EMAIL SEMENTARA"
		result.RedFlags = append(result.RedFlags, RedFlag{
			Level:       "CRITICAL",
			Title:       "Domain Email Sekali Pakai (Disposable Mail)",
			Explanation: "Email ini berasal dari layanan burner email sementara yang biasa digunakan pelaku kejahatan untuk membuat akun fiktif tanpa verifikasi identitas.",
			Snippet:     domain,
		})
		result.Recommendations = append(result.Recommendations, "Jangan pernah merespons pesan atau mengirim dokumen penting ke alamat email sekali pakai.")
		return result
	}

	// 4. Check Free Webmail Impersonating Official Corporate / Institutions
	if freeEmailDomains[domain] {
		result.IsFreeProvider = true
		institutionalKeywords := []string{
			"bca", "bri", "mandiri", "bni", "pertamina", "telkom", "shopee", "tokopedia",
			"rekrutmen", "recruitment", "hrd", "official", "pajak", "kominfo", "polri",
			"customer-service", "helpdesk",
		}

		for _, kw := range institutionalKeywords {
			if strings.Contains(username, kw) {
				result.Impersonating = kw
				result.RiskScore = 85
				result.ThreatLevel = "BAHAYA / PENYAMARAN INSTANSI"
				result.RedFlags = append(result.RedFlags, RedFlag{
					Level:       "CRITICAL",
					Title:       "Penggunaan Email Publik untuk Menyamar sebagai Instansi Resmi",
					Explanation: fmt.Sprintf("Akun menggunakan domain publik gratisan (@%s) namun mencatut nama instansi/layanan '%s'. Instansi resmi selalu menggunakan domain perusahaan sendiri (misal: @pertamina.com, @bca.co.id).", domain, kw),
					Snippet:     rawEmail,
				})
				result.Recommendations = append(result.Recommendations, "Instansi resmi dan perbankan TIDAK PERNAH menggunakan akun @gmail.com atau @yahoo.com untuk korespondensi resmi.")
				break
			}
		}
	}

	// 5. Typosquatting Check in Domain (e.g. pertamina-rekrutmen.com, bca-finansial.site)
	if strings.Contains(domain, "-") && (strings.Contains(domain, "bca") || strings.Contains(domain, "pertamina") || strings.Contains(domain, "rekrutmen") || strings.Contains(domain, "bri")) {
		result.RiskScore = 75
		result.ThreatLevel = "BAHAYA / DOMAIN TIRUAN"
		result.RedFlags = append(result.RedFlags, RedFlag{
			Level:       "HIGH",
			Title:       "Domain Tiruan Mengandung Tanda Hubung (Typosquatting)",
			Explanation: "Domain email meniru nama instansi terpercaya dengan menambahkan kata pengelabuh di dalamnya.",
			Snippet:     domain,
		})
	}

	result.Coverage, result.CoverageSummary = SummarizeCoverage(result.Sources)
	if result.RiskScore < 35 && len(result.RedFlags) == 0 {
		result.RiskScore = 0
		result.ThreatLevel = "BERSIH / TIDAK DITEMUKAN CATATAN LAPORAN"
	}
	result.Recommendations = append(result.Recommendations, "Selalu periksa domain pengirim di balik simbol @. Tidak ditemukannya laporan pada sumber yang diperiksa bukan jaminan bahwa pengirim aman.")
	return result
}

// AnalyzeFile performs bounded static analysis on actual uploaded bytes. It never executes the artifact.
func AnalyzeFile(filename string, filesize int64, content []byte) FileScanResult {
	cleanName := filepath.Base(strings.TrimSpace(filename))
	ext := strings.ToLower(filepath.Ext(cleanName))
	shaSum := sha256.Sum256(content)
	md5Sum := md5.Sum(content)
	mimeType := "application/octet-stream"
	if len(content) > 0 {
		mimeType = http.DetectContentType(content[:min(len(content), 512)])
	}
	result := FileScanResult{
		FileName: cleanName, Extension: ext, FileSize: int64(len(content)), DetectedMIME: mimeType,
		SHA256: hex.EncodeToString(shaSum[:]), MD5: hex.EncodeToString(md5Sum[:]),
		FileTypeCategory: "BERKAS_LAIN", RiskScore: 0, ThreatLevel: "TIDAK DITEMUKAN ANOMALI TEKNIS BERBAHAYA",
		Coverage: CoverageComplete, Sources: []SourceResult{}, DangerousPerms: []string{}, RedFlags: []RedFlag{}, Recommendations: []string{},
	}
	if len(content) == 0 {
		result.RiskScore = 35
		result.ThreatLevel = "BERKAS KOSONG / TIDAK DAPAT DIANALISIS"
		result.CoverageSummary = "Tidak ada byte berkas yang diterima."
		return result
	}
	if filesize != int64(len(content)) && filesize > 0 {
		result.RedFlags = append(result.RedFlags, RedFlag{Level: "INFO", Title: "Ukuran metadata berbeda", Explanation: "PANDU menggunakan ukuran byte yang benar-benar diterima, bukan ukuran yang dikirim klien.", Snippet: fmt.Sprintf("%d byte", len(content))})
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	hashIntel := QueryCIRCLHash(ctx, result.SHA256)
	cancel()
	result.Sources = append(result.Sources, hashIntel)

	if ext == ".apk" {
		result.FileTypeCategory = "APK_ANDROID"
		if !bytes.HasPrefix(content, []byte("PK")) {
			result.RiskScore = 55
			result.ThreatLevel = "EKSTENSI APK TIDAK SESUAI ISI"
			result.RedFlags = append(result.RedFlags, RedFlag{Level: "HIGH", Title: "Bukan arsip APK yang valid", Explanation: "Nama berkas berakhiran .apk tetapi signature byte tidak menunjukkan paket ZIP/APK.", Snippet: cleanName})
		} else {
			perms, manifestFound, err := inspectAPKArchive(content)
			if err != nil {
				result.RiskScore = 40
				result.ThreatLevel = "APK TIDAK DAPAT DIPARSA SECARA LENGKAP"
				result.RedFlags = append(result.RedFlags, RedFlag{Level: "MEDIUM", Title: "Struktur APK tidak dapat dianalisis penuh", Explanation: err.Error(), Snippet: cleanName})
			} else {
				result.DangerousPerms = perms
				if len(perms) > 0 {
					result.RiskScore = 80
					result.ThreatLevel = "APK MEMUAT INDIKATOR IZIN BERISIKO"
					result.RedFlags = append(result.RedFlags, RedFlag{Level: "HIGH", Title: "Izin berisiko ditemukan pada muatan APK", Explanation: "Daftar ini berasal dari string izin yang benar-benar ditemukan di AndroidManifest.xml; keberadaannya tetap perlu dianalisis bersama perilaku aplikasi.", Snippet: strings.Join(perms, ", ")})
				} else if manifestFound {
					result.RiskScore = 0
					result.ThreatLevel = "TIDAK DITEMUKAN IZIN BERISIKO PADA PEMERIKSAAN STATIS"
				}
			}
		}
		result.Recommendations = append(result.Recommendations, "Jangan memasang APK dari chat atau sumber yang tidak dipercaya. Pemeriksaan statis tidak menggantikan sandbox malware profesional.")
	} else if strings.HasPrefix(mimeType, "image/") {
		result.FileTypeCategory = "IMAGE"
		if cfg, format, err := image.DecodeConfig(bytes.NewReader(content)); err == nil {
			result.RiskScore = 0
			result.ThreatLevel = "STRUKTUR GAMBAR VALID"
			result.Recommendations = append(result.Recommendations, fmt.Sprintf("Gambar terdeteksi sebagai format %s berukuran %dx%d piksel. Struktur teknis gambar valid.", format, cfg.Width, cfg.Height))
		} else {
			result.RiskScore = 40
			result.ThreatLevel = "ISI GAMBAR TIDAK VALID"
			result.RedFlags = append(result.RedFlags, RedFlag{Level: "MEDIUM", Title: "Berkas gambar tidak dapat didekode", Explanation: "Signature atau struktur gambar rusak/tidak sesuai.", Snippet: cleanName})
		}

		// Agentic Multimodal AI Vision Forensics
		vCtx, vCancel := context.WithTimeout(context.Background(), 45*time.Second)
		visionRes, visionErr := QueryAIVisionAgent(vCtx, mimeType, content)
		vCancel()
		if visionErr == nil && visionRes != nil {
			result.AIVisionResult = visionRes
			if visionRes.IsSuspicious && visionRes.RiskScore > result.RiskScore {
				result.RiskScore = visionRes.RiskScore
				result.ThreatLevel = visionRes.ThreatLevel
				if len(visionRes.SocialEngineeringPatterns) > 0 {
					result.RedFlags = append(result.RedFlags, RedFlag{
						Level:       "HIGH",
						Title:       "Indikasi Rekayasa Sosial Terdeteksi pada Gambar",
						Explanation: strings.Join(visionRes.SocialEngineeringPatterns, "; "),
						Snippet:     visionRes.ExtractedTextSummary,
					})
				}
				if len(visionRes.VisualAnomalies) > 0 {
					result.RedFlags = append(result.RedFlags, RedFlag{
						Level:       "HIGH",
						Title:       "Kejanggalan Visual & Ciri Manipulasi Gambar",
						Explanation: strings.Join(visionRes.VisualAnomalies, "; "),
						Snippet:     cleanName,
					})
				}
			}
			if visionRes.Explanation != "" {
				result.Recommendations = append([]string{visionRes.Explanation}, result.Recommendations...)
			}
			if visionRes.MitigationGuide != "" {
				result.Recommendations = append(result.Recommendations, visionRes.MitigationGuide)
			}
		}

		result.Recommendations = append(result.Recommendations, "Untuk bukti transfer, pastikan dana masuk melalui mutasi rekening Anda sendiri; screenshot bukan bukti penerimaan dana.")
	} else {
		dangerousExts := map[string]string{".exe": "eksekutabel Windows", ".scr": "screensaver executable", ".bat": "skrip batch", ".vbs": "skrip Visual Basic", ".js": "skrip JavaScript"}
		if desc, ok := dangerousExts[ext]; ok {
			result.FileTypeCategory = "EXECUTABLE_OR_SCRIPT"
			result.RiskScore = 60
			result.ThreatLevel = "FORMAT DAPAT MENJALANKAN KODE"
			result.RedFlags = append(result.RedFlags, RedFlag{Level: "HIGH", Title: "Format berkas berisiko", Explanation: desc + " dapat menjalankan instruksi saat dibuka. PANDU tidak mengeksekusi berkas ini.", Snippet: cleanName})
		}
	}
	result.Coverage, result.CoverageSummary = SummarizeCoverage(result.Sources)
	return result
}

func inspectAPKArchive(content []byte) ([]string, bool, error) {
	zr, err := zip.NewReader(bytes.NewReader(content), int64(len(content)))
	if err != nil {
		return nil, false, fmt.Errorf("arsip APK tidak valid")
	}
	if len(zr.File) > 2048 {
		return nil, false, fmt.Errorf("jumlah entri APK melampaui batas")
	}
	wanted := []string{"android.permission.RECEIVE_SMS", "android.permission.READ_SMS", "android.permission.SEND_SMS", "android.permission.BIND_ACCESSIBILITY_SERVICE", "android.permission.SYSTEM_ALERT_WINDOW"}
	found := map[string]bool{}
	manifestFound := false
	var total uint64
	for _, file := range zr.File {
		if file.UncompressedSize64 > 8*1024*1024 {
			return nil, manifestFound, fmt.Errorf("entri APK terlalu besar")
		}
		total += file.UncompressedSize64
		if total > 32*1024*1024 {
			return nil, manifestFound, fmt.Errorf("muatan APK melampaui batas ekstraksi")
		}
		if filepath.Clean(file.Name) != file.Name || strings.Contains(file.Name, "..") {
			return nil, manifestFound, fmt.Errorf("jalur arsip APK tidak aman")
		}
		if file.Name != "AndroidManifest.xml" {
			continue
		}
		manifestFound = true
		rc, err := file.Open()
		if err != nil {
			return nil, manifestFound, err
		}
		data, err := io.ReadAll(io.LimitReader(rc, 8*1024*1024))
		rc.Close()
		if err != nil {
			return nil, manifestFound, err
		}
		for _, permission := range wanted {
			if bytes.Contains(data, []byte(permission)) {
				found[permission] = true
			}
		}
	}
	perms := make([]string, 0, len(found))
	for _, permission := range wanted {
		if found[permission] {
			perms = append(perms, permission)
		}
	}
	return perms, manifestFound, nil
}
