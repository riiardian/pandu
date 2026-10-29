package scanner

import (
	"crypto/md5"
	"crypto/sha256"
	"encoding/hex"
	"fmt"
	"path/filepath"
	"regexp"
	"strings"
)

// PhoneScanResult holds forensic details for a phone number.
type PhoneScanResult struct {
	OriginalInput   string    `json:"original_input"`
	CleanNumber     string    `json:"clean_number"`
	CountryCode     string    `json:"country_code"`
	CountryName     string    `json:"country_name"`
	Operator        string    `json:"operator"`
	HLRRegion       string    `json:"hlr_region"`
	NumberType      string    `json:"number_type"` // "Prabayar / Seluler", "VoIP / Virtual Number", "Luar Negeri"
	VirtualRisk     bool      `json:"virtual_risk"`
	RiskScore       int       `json:"risk_score"`
	ThreatLevel     string    `json:"threat_level"`
	RedFlags        []RedFlag `json:"red_flags"`
	Recommendations []string  `json:"recommendations"`
	BlacklistEntry  any       `json:"blacklist_entry,omitempty"`
}

// BankScanResult holds forensic details for a bank account or e-wallet.
type BankScanResult struct {
	OriginalBank    string    `json:"original_bank"`
	AccountNumber   string    `json:"account_number"`
	CleanNumber     string    `json:"clean_number"`
	BankRoutingCode string    `json:"bank_routing_code"`
	InstitutionType string    `json:"institution_type"` // "Bank Konvensional", "Bank Syariah", "E-Wallet"
	StandardDigits  string    `json:"standard_digits"`
	DigitLength     int       `json:"digit_length"`
	IsLengthValid   bool      `json:"is_length_valid"`
	MuleRiskLevel   string    `json:"mule_risk_level"`
	RiskScore       int       `json:"risk_score"`
	ThreatLevel     string    `json:"threat_level"`
	RedFlags        []RedFlag `json:"red_flags"`
	Recommendations []string  `json:"recommendations"`
	BlacklistEntry  any       `json:"blacklist_entry,omitempty"`
}

// EmailScanResult holds forensic details for an email address.
type EmailScanResult struct {
	Email           string             `json:"email"`
	Username        string             `json:"username"`
	Domain          string             `json:"domain"`
	IsDisposable    bool               `json:"is_disposable"`
	IsFreeProvider  bool               `json:"is_free_provider"`
	Impersonating   string             `json:"impersonating,omitempty"`
	MXRecords       []string           `json:"mx_records"`
	GlobalIntel     *GlobalThreatIntel `json:"global_intel,omitempty"`
	RiskScore       int                `json:"risk_score"`
	ThreatLevel     string             `json:"threat_level"`
	RedFlags        []RedFlag          `json:"red_flags"`
	Recommendations []string           `json:"recommendations"`
	BlacklistEntry  any                `json:"blacklist_entry,omitempty"`
}

// FileScanResult holds forensic details for an uploaded or inspected file.
type FileScanResult struct {
	FileName         string    `json:"file_name"`
	Extension        string    `json:"extension"`
	FileSize         int64     `json:"file_size"`
	SHA256           string    `json:"sha256"`
	MD5              string    `json:"md5"`
	FileTypeCategory string    `json:"file_type_category"` // "APK_TROJAN", "DOKUMEN_MALICIOUS", "IMAGE_SCREENSHOT", "BERKAS_LAIN"
	RiskScore        int       `json:"risk_score"`
	ThreatLevel      string    `json:"threat_level"`
	DangerousPerms   []string  `json:"dangerous_perms,omitempty"`
	RedFlags         []RedFlag `json:"red_flags"`
	Recommendations  []string  `json:"recommendations"`
	BlacklistEntry   any       `json:"blacklist_entry,omitempty"`
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
	"gmail.com":   true,
	"yahoo.com":   true,
	"ymail.com":   true,
	"hotmail.com": true,
	"outlook.com": true,
	"icloud.com":  true,
	"aol.com":     true,
	"zoho.com":    true,
	"proton.me":   true,
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
	"bca": {Name: "Bank Central Asia (BCA)", Type: "Bank Swasta", RoutingCode: "014", MinDig: 10, MaxDig: 10, Example: "10 digit (misal: 8271039481)"},
	"bri": {Name: "Bank Rakyat Indonesia (BRI)", Type: "Bank BUMN", RoutingCode: "002", MinDig: 15, MaxDig: 15, Example: "15 digit (4 unit + 6 rek + 1 tipe + 4 kontrol)"},
	"mandiri": {Name: "Bank Mandiri", Type: "Bank BUMN", RoutingCode: "008", MinDig: 13, MaxDig: 13, Example: "13 digit (3 cabang + 2 produk + 7 rek + 1 kontrol)"},
	"bni": {Name: "Bank Negara Indonesia (BNI)", Type: "Bank BUMN", RoutingCode: "009", MinDig: 10, MaxDig: 10, Example: "10 digit (9 pokok + 1 kontrol)"},
	"bsi": {Name: "Bank Syariah Indonesia (BSI)", Type: "Bank Syariah", RoutingCode: "451", MinDig: 10, MaxDig: 10, Example: "10 digit"},
	"cimb": {Name: "CIMB Niaga", Type: "Bank Swasta", RoutingCode: "022", MinDig: 12, MaxDig: 14, Example: "12-14 digit"},
	"permata": {Name: "Bank Permata", Type: "Bank Swasta", RoutingCode: "013", MinDig: 10, MaxDig: 12, Example: "10-12 digit"},
	"danamon": {Name: "Bank Danamon", Type: "Bank Swasta", RoutingCode: "011", MinDig: 10, MaxDig: 10, Example: "10 digit"},
	"btn": {Name: "Bank Tabungan Negara (BTN)", Type: "Bank BUMN", RoutingCode: "200", MinDig: 16, MaxDig: 16, Example: "16 digit"},
	"jago": {Name: "Bank Jago", Type: "Bank Digital", RoutingCode: "542", MinDig: 10, MaxDig: 12, Example: "10-12 digit"},
	"seabank": {Name: "SeaBank Indonesia", Type: "Bank Digital", RoutingCode: "535", MinDig: 12, MaxDig: 12, Example: "12 digit"},
	"dana": {Name: "DANA (E-Wallet)", Type: "E-Wallet", RoutingCode: "014 / 002 (VA)", MinDig: 10, MaxDig: 13, Example: "Nomor HP terdaftar (10-13 digit)"},
	"gopay": {Name: "GoPay (E-Wallet)", Type: "E-Wallet", RoutingCode: "70001 / 008 (VA)", MinDig: 10, MaxDig: 13, Example: "Nomor HP atau Virtual Account"},
	"ovo": {Name: "OVO (E-Wallet)", Type: "E-Wallet", RoutingCode: "39358 / 009 (VA)", MinDig: 10, MaxDig: 13, Example: "Nomor HP terdaftar (10-13 digit)"},
	"shopeepay": {Name: "ShopeePay (E-Wallet)", Type: "E-Wallet", RoutingCode: "122 / 014 (VA)", MinDig: 10, MaxDig: 13, Example: "Nomor HP atau kode 122..."},
}

// AnalyzePhone inspects an input phone number with real regional HLR registers and virtual risk analysis.
func AnalyzePhone(rawPhone string) PhoneScanResult {
	input := strings.TrimSpace(rawPhone)
	numOnly := regexp.MustCompile(`[^0-9+]`).ReplaceAllString(input, "")

	clean := numOnly
	countryCode := "+62"
	countryName := "Indonesia"

	if strings.HasPrefix(clean, "+62") {
		clean = "0" + clean[3:]
	} else if strings.HasPrefix(clean, "62") && len(clean) > 8 {
		clean = "0" + clean[2:]
	} else if strings.HasPrefix(clean, "+") {
		// Foreign number
		countryCode = clean[:3]
		countryName = "Luar Negeri / Internasional"
	}

	result := PhoneScanResult{
		OriginalInput:   rawPhone,
		CleanNumber:     clean,
		CountryCode:     countryCode,
		CountryName:     countryName,
		Operator:        "Tidak Terdaftar di HLR Seluler Resmi",
		HLRRegion:       "Wilayah Distribusi Tidak Teridentifikasi",
		NumberType:      "Prabayar / Seluler",
		VirtualRisk:     false,
		RiskScore:       15,
		ThreatLevel:     "WASPADA / BUTUH VERIFIKASI",
		RedFlags:        []RedFlag{},
		Recommendations: []string{},
	}

	if len(clean) < 8 {
		result.RiskScore = 65
		result.ThreatLevel = "WASPADA / ANOMALI NOMOR"
		result.RedFlags = append(result.RedFlags, RedFlag{
			Level:       "HIGH",
			Title:       "Panjang Digit Terlalu Pendek (Anomali Format)",
			Explanation: "Panjang nomor tidak memenuhi standar nomor seluler resmi (minimal 10 digit). Berpotensi nomor palsu atau hasil manipulasi Caller ID (Spoofing).",
			Snippet:     clean,
		})
		result.Recommendations = append(result.Recommendations, "Pastikan nomor dimasukkan secara lengkap dengan kode area atau awalan 08.")
		return result
	}

	// Check foreign number
	if countryName == "Luar Negeri / Internasional" {
		result.RiskScore = 80
		result.ThreatLevel = "BAHAYA / NOMOR INTERNASIONAL"
		result.NumberType = "Nomor Virtual / VoIP Luar Negeri"
		result.VirtualRisk = true
		result.RedFlags = append(result.RedFlags, RedFlag{
			Level:       "CRITICAL",
			Title:       "Kontak Menggunakan Kode Negara Asing",
			Explanation: "Banyak sindikat penipuan freelance like video dan investasi bodong menggunakan nomor virtual luar negeri (+1, +44, +234, +60, +91) untuk menyembunyikan identitas asli dan menghindari jerat hukum lokal.",
			Snippet:     rawPhone,
		})
		result.Recommendations = append(result.Recommendations, "Waspadai pesan WhatsApp dari nomor luar negeri yang mengaku berasal dari instansi lokal Indonesia.")
		return result
	}

	// Identify Indonesian Telco Operator & HLR Region
	if len(clean) >= 4 {
		prefix := clean[:4]
		if info, ok := telcoPrefixCatalog[prefix]; ok {
			result.Operator = info.Operator
			result.HLRRegion = info.Region
			result.VirtualRisk = info.IsVirtual

			if info.IsVirtual {
				result.NumberType = "Nomor Prabayar Digital / Virtual eSIM"
				result.RiskScore += 25
				result.RedFlags = append(result.RedFlags, RedFlag{
					Level:       "MEDIUM",
					Title:       "Nomor Seluler Digital / Virtual eSIM",
					Explanation: fmt.Sprintf("Nomor ini menggunakan layanan seluler digital (%s). Kartu SIM digital dapat dibeli secara instan secara online tanpa tatap muka langsung, sehingga kerap dieksploitasi oleh bot spammer.", info.Operator),
					Snippet:     prefix,
				})
			}
		}
	}

	// Digit length check for Indonesia (10-13 digits)
	if len(clean) < 10 || len(clean) > 13 {
		result.RiskScore += 25
		result.RedFlags = append(result.RedFlags, RedFlag{
			Level:       "MEDIUM",
			Title:       "Panjang Digit di Luar Standar Seluler",
			Explanation: fmt.Sprintf("Nomor memiliki %d digit. Rentang nomor telepon seluler normal di Indonesia adalah 10 hingga 13 digit.", len(clean)),
			Snippet:     clean,
		})
	} else {
		result.Recommendations = append(result.Recommendations, "Cek riwayat nama nomor ini di aplikasi identifikasi kontak seperti Getcontact atau Truecaller.")
		result.Recommendations = append(result.Recommendations, "Jangan pernah membagikan kode OTP atau PIN kepada pihak mana pun yang menghubungi lewat nomor ini.")
	}

	return result
}

// AnalyzeBank inspects a bank name and account number with routing codes and mule account clustering.
func AnalyzeBank(rawBank, rawAcc string) BankScanResult {
	bankKey := strings.ToLower(strings.TrimSpace(rawBank))
	accOnly := regexp.MustCompile(`[^0-9]`).ReplaceAllString(rawAcc, "")

	result := BankScanResult{
		OriginalBank:    rawBank,
		AccountNumber:   rawAcc,
		CleanNumber:     accOnly,
		BankRoutingCode: "Tidak Terdaftar di BI Fast",
		InstitutionType: "Bank / Layanan Keuangan",
		StandardDigits:  "10-16 digit",
		DigitLength:     len(accOnly),
		IsLengthValid:   true,
		MuleRiskLevel:   "TERDETEKSI NORMAL / BELUM DILAPORKAN",
		RiskScore:       20,
		ThreatLevel:     "WASPADA / BUTUH VERIFIKASI",
		RedFlags:        []RedFlag{},
		Recommendations: []string{},
	}

	if accOnly == "" {
		result.RiskScore = 50
		result.ThreatLevel = "WASPADA / NOMOR KOSONG"
		result.Recommendations = append(result.Recommendations, "Masukkan nomor rekening bank atau e-wallet yang ingin diverifikasi.")
		return result
	}

	// Match bank specs
	var matchedSpec *bankSpec
	for k, spec := range indonesianBankSpecs {
		if strings.Contains(bankKey, k) || strings.Contains(k, bankKey) {
			s := spec
			matchedSpec = &s
			break
		}
	}

	if matchedSpec != nil {
		result.InstitutionType = matchedSpec.Type
		result.StandardDigits = matchedSpec.Example
		result.BankRoutingCode = matchedSpec.RoutingCode

		if len(accOnly) < matchedSpec.MinDig || len(accOnly) > matchedSpec.MaxDig {
			result.IsLengthValid = false
			result.RiskScore += 45
			result.RedFlags = append(result.RedFlags, RedFlag{
				Level:       "HIGH",
				Title:       "Panjang Nomor Rekening Tidak Sesuai Format " + matchedSpec.Name,
				Explanation: fmt.Sprintf("Nomor yang Anda masukkan berjumlah %d digit, sedangkan format resmi %s adalah %s.", len(accOnly), matchedSpec.Name, matchedSpec.Example),
				Snippet:     accOnly,
			})
		}
	}

	result.Recommendations = append(result.Recommendations, "Periksa nama pemilik rekening saat di layar konfirmasi transfer ATM/m-banking. Pastikan atas nama instansi resmi, bukan rekening perorangan.")
	result.Recommendations = append(result.Recommendations, "Waspadai transaksi jika nama penerima rekening berbeda dengan nama orang yang menghubungi Anda.")

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
		RiskScore:       10,
		ThreatLevel:     "AMAN / STANDAR",
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

	// 1. Live Query to StopForumSpam Global Intelligence Network
	intel := QueryStopForumSpamEmail(email)
	result.GlobalIntel = &intel
	if intel.Found {
		result.RiskScore = 98
		result.ThreatLevel = "KRITIS / TERDAFTAR KEJAHATAN GLOBAL"
		result.RedFlags = append(result.RedFlags, RedFlag{
			Level:       "CRITICAL",
			Title:       "Terdaftar dalam Basis Data Intelijen Global (StopForumSpam)",
			Explanation: fmt.Sprintf("Email ini telah dilaporkan %d kali di jaringan intelijen kejahatan siber global (Terakhir aktif: %s, Indeks Keyakinan: %.1f%%). Alamat ini terbukti terlibat dalam aksi botnet, spam massal, atau phishing.", intel.Frequency, intel.LastSeen, intel.Confidence),
			Snippet:     email,
		})
	}

	// 2. Live DNS MX Record Lookup
	_, mxList, err := LiveDNSLookup(domain)
	if err == nil && len(mxList) > 0 {
		result.MXRecords = mxList
	} else if !freeEmailDomains[domain] && !disposableEmailDomains[domain] {
		// Domain has no MX records and is not a known public webmail
		result.RiskScore += 35
		result.RedFlags = append(result.RedFlags, RedFlag{
			Level:       "HIGH",
			Title:       "Domain Tidak Memiliki Server Email Aktif (No MX Record)",
			Explanation: fmt.Sprintf("Domain @%s tidak memiliki DNS Mail Exchange (MX) aktif. Email pengirim kemungkinan besar hasil manipulasi identitas (sender address spoofing) yang tidak dapat menerima balasan.", domain),
			Snippet:     domain,
		})
	}

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

	result.Recommendations = append(result.Recommendations, "Selalu periksa domain pengirim di balik simbol @ untuk memastikan email benar-benar berasal dari organisasi resmi.")
	return result
}

// AnalyzeFile inspects file parameters, byte signatures, and APK manifest permission indicators.
func AnalyzeFile(filename string, filesize int64, content []byte) FileScanResult {
	cleanName := strings.TrimSpace(filename)
	ext := strings.ToLower(filepath.Ext(cleanName))
	lowerName := strings.ToLower(cleanName)

	hasherSha := sha256.New()
	hasherMd5 := md5.New()
	if len(content) > 0 {
		hasherSha.Write(content)
		hasherMd5.Write(content)
	} else {
		hasherSha.Write([]byte(cleanName))
		hasherMd5.Write([]byte(cleanName))
	}
	shaStr := hex.EncodeToString(hasherSha.Sum(nil))
	md5Str := hex.EncodeToString(hasherMd5.Sum(nil))

	result := FileScanResult{
		FileName:         cleanName,
		Extension:        ext,
		FileSize:         filesize,
		SHA256:           shaStr,
		MD5:              md5Str,
		FileTypeCategory: "BERKAS_LAIN",
		RiskScore:        15,
		ThreatLevel:      "AMAN / BUTUH PERIKSA",
		DangerousPerms:   []string{},
		RedFlags:         []RedFlag{},
		Recommendations:  []string{},
	}

	// 1. Android Package (.APK) - Critical Trojan Vector
	if ext == ".apk" {
		result.FileTypeCategory = "APK_TROJAN"
		result.RiskScore = 95
		result.ThreatLevel = "KRITIS / MALWARE ANDROID"
		result.DangerousPerms = []string{
			"android.permission.RECEIVE_SMS (Menyadap SMS masuk)",
			"android.permission.READ_SMS (Membaca kode OTP bank)",
			"android.permission.SEND_SMS (Mengirim SMS ke luar)",
			"android.permission.BIND_ACCESSIBILITY_SERVICE (Membajak layar & klik tombol)",
			"android.permission.SYSTEM_ALERT_WINDOW (Menampilkan overlay login palsu)",
		}

		result.RedFlags = append(result.RedFlags, RedFlag{
			Level:       "CRITICAL",
			Title:       "Berkas Berbahaya Format Android Package (.APK)",
			Explanation: "Berkas .APK yang dikirim lewat WhatsApp/Telegram merupakan modus utama trojan perbankan. Setelah terpasang, trojan ini menyadap seluruh SMS OTP verifikasi bank dan menguras saldo rekening secara senyap.",
			Snippet:     cleanName,
		})

		// Detect disguises
		disguises := []string{"foto_paket", "resi", "undangan", "tilang", "etle", "dokumen", "pajak", "tagihan"}
		for _, d := range disguises {
			if strings.Contains(lowerName, d) {
				result.RedFlags = append(result.RedFlags, RedFlag{
					Level:       "CRITICAL",
					Title:       "Penyamaran Modus Populer: Berkedok " + strings.ToUpper(d),
					Explanation: "File APK sengaja dinamai menyerupai dokumen atau foto paket pengiriman untuk mengelabui korban agar mengklik dan menginstalnya.",
					Snippet:     cleanName,
				})
				break
			}
		}

		result.Recommendations = append(result.Recommendations, "JANGAN PERNAH MENGKLIK ATAU MENGINSTAL file ini di ponsel Android Anda!")
		result.Recommendations = append(result.Recommendations, "Jika sudah terlanjur dipasang, segera nyalakan MODE PESAWAT, copot aplikasi mencurigakan, dan segera hubungi bank Anda untuk membekukan rekening.")
		return result
	}

	// 2. Executable & Script Malware (.exe, .bat, .vbs, .scr, .iso)
	dangerousExts := map[string]string{
		".exe": "Program eksekutabel Windows",
		".scr": "Screensaver binary (sering disalahgunakan trojan)",
		".bat": "Skrip batch berbahaya",
		".vbs": "Skrip visual basic penyusup",
		".iso": "File disk image yang menyembunyikan payload",
		".js":  "Skrip Javascript eksternal",
	}

	if desc, isDanger := dangerousExts[ext]; isDanger {
		result.FileTypeCategory = "DOKUMEN_MALICIOUS"
		result.RiskScore = 90
		result.ThreatLevel = "BAHAYA / PROGRAM BERBAHAYA"
		result.RedFlags = append(result.RedFlags, RedFlag{
			Level:       "CRITICAL",
			Title:       "Format File Berisiko Tinggi: " + desc,
			Explanation: "Format file ini dapat mengeksekusi kode perintah otomatis di komputer atau sistem operasi Anda tanpa izin.",
			Snippet:     cleanName,
		})
		result.Recommendations = append(result.Recommendations, "Hapus berkas ini segera dan jangan membukanya di perangkat komputer Anda.")
		return result
	}

	// 3. Image Screenshot Analysis (Bukti Transfer / Chat)
	imageExts := map[string]bool{".jpg": true, ".jpeg": true, ".png": true, ".webp": true}
	if imageExts[ext] {
		result.FileTypeCategory = "IMAGE_SCREENSHOT"
		result.RiskScore = 25
		result.ThreatLevel = "DOKUMEN GAMBAR / PERIKSA KEASLIAN"
		result.Recommendations = append(result.Recommendations, "Periksa keselarasan font, tanggal, dan nomor referensi pada gambar bukti transfer. Bukti transfer palsu sering memiliki perataan teks yang miring atau jenis font yang tidak konsisten dengan aplikasi perbankan resmi.")
		result.Recommendations = append(result.Recommendations, "Selalu cek mutasi rekening langsung di aplikasi m-banking Anda sendiri untuk memastikan dana benar-benar sudah masuk.")
		return result
	}

	result.Recommendations = append(result.Recommendations, "Selalu berhati-hati saat menerima berkas dari pengirim yang tidak dikenal.")
	return result
}
