package scanner

import (
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
	NumberType      string    `json:"number_type"` // "Prabayar / Seluler", "VoIP / Virtual Number", "Luar Negeri"
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
	InstitutionType string    `json:"institution_type"` // "Bank Konvensional", "Bank Syariah", "E-Wallet"
	StandardDigits  string    `json:"standard_digits"`
	DigitLength     int       `json:"digit_length"`
	IsLengthValid   bool      `json:"is_length_valid"`
	RiskScore       int       `json:"risk_score"`
	ThreatLevel     string    `json:"threat_level"`
	RedFlags        []RedFlag `json:"red_flags"`
	Recommendations []string  `json:"recommendations"`
	BlacklistEntry  any       `json:"blacklist_entry,omitempty"`
}

// EmailScanResult holds forensic details for an email address.
type EmailScanResult struct {
	Email           string    `json:"email"`
	Username        string    `json:"username"`
	Domain          string    `json:"domain"`
	IsDisposable    bool      `json:"is_disposable"`
	IsFreeProvider  bool      `json:"is_free_provider"`
	Impersonating   string    `json:"impersonating,omitempty"`
	RiskScore       int       `json:"risk_score"`
	ThreatLevel     string    `json:"threat_level"`
	RedFlags        []RedFlag `json:"red_flags"`
	Recommendations []string  `json:"recommendations"`
	BlacklistEntry  any       `json:"blacklist_entry,omitempty"`
}

// FileScanResult holds forensic details for an uploaded or inspected file.
type FileScanResult struct {
	FileName        string    `json:"file_name"`
	Extension       string    `json:"extension"`
	FileSize        int64     `json:"file_size"`
	SHA256          string    `json:"sha256"`
	FileTypeCategory string   `json:"file_type_category"` // "APK_TROJAN", "DOKUMEN_MALICIOUS", "IMAGE_SCREENSHOT", "BERKAS_LAIN"
	RiskScore       int       `json:"risk_score"`
	ThreatLevel     string    `json:"threat_level"`
	DangerousPerms  []string  `json:"dangerous_perms,omitempty"`
	RedFlags        []RedFlag `json:"red_flags"`
	Recommendations []string  `json:"recommendations"`
	BlacklistEntry  any       `json:"blacklist_entry,omitempty"`
}

// Indonesian mobile phone prefixes mapping
var telcoPrefixes = map[string]string{
	"0811": "Telkomsel (Halo)",
	"0812": "Telkomsel (SimPATI)",
	"0813": "Telkomsel (SimPATI)",
	"0821": "Telkomsel (SimPATI)",
	"0822": "Telkomsel (Loop)",
	"0823": "Telkomsel (Kartu As)",
	"0851": "Telkomsel (by.U / AS)",
	"0852": "Telkomsel (Kartu As)",
	"0853": "Telkomsel (Kartu As)",
	"0814": "Indosat (Broadband)",
	"0815": "Indosat (Matrix / Mentari)",
	"0816": "Indosat (Matrix)",
	"0855": "Indosat (Matrix)",
	"0856": "Indosat (IM3)",
	"0857": "Indosat (IM3)",
	"0858": "Indosat (Mentari / IM3)",
	"0817": "XL Axiata",
	"0818": "XL Axiata",
	"0819": "XL Axiata",
	"0859": "XL Axiata",
	"0877": "XL Axiata",
	"0878": "XL Axiata",
	"0831": "Axis (XL Group)",
	"0832": "Axis (XL Group)",
	"0833": "Axis (XL Group)",
	"0838": "Axis (XL Group)",
	"0895": "Tri (3 / Indosat Group)",
	"0896": "Tri (3 / Indosat Group)",
	"0897": "Tri (3 / Indosat Group)",
	"0898": "Tri (3 / Indosat Group)",
	"0899": "Tri (3 / Indosat Group)",
	"0881": "Smartfren",
	"0882": "Smartfren",
	"0883": "Smartfren",
	"0884": "Smartfren",
	"0885": "Smartfren",
	"0886": "Smartfren",
	"0887": "Smartfren",
	"0888": "Smartfren",
	"0889": "Smartfren",
}

// Temporary / disposable email domains blacklist
var disposableEmailDomains = map[string]bool{
	"10minutemail.com": true,
	"tempmail.com":     true,
	"guerrillamail.com": true,
	"mailinator.com":   true,
	"throwawaymail.com": true,
	"yopmail.com":      true,
	"dispostable.com":  true,
	"trashmail.com":    true,
	"fakemailgenerator.com": true,
	"sharklasers.com":  true,
	"getairmail.com":   true,
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
}

// Standard Indonesian Bank Digit specs
type bankSpec struct {
	Name    string
	Type    string
	MinDig  int
	MaxDig  int
	Example string
}

var indonesianBankSpecs = map[string]bankSpec{
	"bca": {Name: "Bank Central Asia (BCA)", Type: "Bank Swasta", MinDig: 10, MaxDig: 10, Example: "10 digit (misal: 8271039481)"},
	"bri": {Name: "Bank Rakyat Indonesia (BRI)", Type: "Bank BUMN", MinDig: 15, MaxDig: 15, Example: "15 digit"},
	"mandiri": {Name: "Bank Mandiri", Type: "Bank BUMN", MinDig: 13, MaxDig: 13, Example: "13 digit"},
	"bni": {Name: "Bank Negara Indonesia (BNI)", Type: "Bank BUMN", MinDig: 10, MaxDig: 10, Example: "10 digit"},
	"bsi": {Name: "Bank Syariah Indonesia (BSI)", Type: "Bank Syariah", MinDig: 10, MaxDig: 10, Example: "10 digit"},
	"cimb": {Name: "CIMB Niaga", Type: "Bank Swasta", MinDig: 12, MaxDig: 14, Example: "12-14 digit"},
	"permata": {Name: "Bank Permata", Type: "Bank Swasta", MinDig: 10, MaxDig: 12, Example: "10-12 digit"},
	"danamon": {Name: "Bank Danamon", Type: "Bank Swasta", MinDig: 10, MaxDig: 10, Example: "10 digit"},
	"btn": {Name: "Bank Tabungan Negara (BTN)", Type: "Bank BUMN", MinDig: 16, MaxDig: 16, Example: "16 digit"},
	"jago": {Name: "Bank Jago", Type: "Bank Digital", MinDig: 10, MaxDig: 12, Example: "10-12 digit"},
	"seabank": {Name: "SeaBank Indonesia", Type: "Bank Digital", MinDig: 12, MaxDig: 12, Example: "12 digit"},
	"dana": {Name: "DANA (E-Wallet)", Type: "E-Wallet", MinDig: 10, MaxDig: 13, Example: "Nomor HP terdaftar (10-13 digit)"},
	"gopay": {Name: "GoPay (E-Wallet)", Type: "E-Wallet", MinDig: 10, MaxDig: 13, Example: "Nomor HP atau Virtual Account"},
	"ovo": {Name: "OVO (E-Wallet)", Type: "E-Wallet", MinDig: 10, MaxDig: 13, Example: "Nomor HP terdaftar (10-13 digit)"},
	"shopeepay": {Name: "ShopeePay (E-Wallet)", Type: "E-Wallet", MinDig: 10, MaxDig: 13, Example: "Nomor HP atau kode 122..."},
}

// AnalyzePhone inspects an input phone number.
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
		Operator:        "Tidak Diketahui / Tidak Terdaftar",
		NumberType:      "Prabayar / Seluler",
		RiskScore:       15,
		ThreatLevel:     "WASPADA / PERIKSA ULANG",
		RedFlags:        []RedFlag{},
		Recommendations: []string{},
	}

	if len(clean) < 8 {
		result.RiskScore = 60
		result.ThreatLevel = "WASPADA / ANOMALI NOMOR"
		result.RedFlags = append(result.RedFlags, RedFlag{
			Level:       "HIGH",
			Title:       "Format Digit Terlalu Pendek",
			Explanation: "Panjang nomor tidak memenuhi standar nomor seluler resmi (minimal 10 digit). Berpotensi nomor palsu atau SMS masking.",
			Snippet:     clean,
		})
		result.Recommendations = append(result.Recommendations, "Pastikan nomor dimasukkan secara lengkap dengan kode area atau awalan 08.")
		return result
	}

	// Check foreign number
	if countryName == "Luar Negeri / Internasional" {
		result.RiskScore = 75
		result.ThreatLevel = "BAHAYA / NOMOR ASING"
		result.NumberType = "Luar Negeri (Potensi Bot / Sindikat)"
		result.RedFlags = append(result.RedFlags, RedFlag{
			Level:       "HIGH",
			Title:       "Kontak Menggunakan Kode Negara Asing",
			Explanation: "Banyak sindikat penipuan freelance like video dan komisi investasi menggunakan nomor virtual luar negeri (+1, +44, +234, +60, +91) untuk menyembunyikan identitas asli.",
			Snippet:     rawPhone,
		})
		result.Recommendations = append(result.Recommendations, "Waspadai pesan WhatsApp dari nomor luar negeri yang mengaku berasal dari instansi lokal Indonesia.")
		return result
	}

	// Identify Indonesian Telco Operator
	if len(clean) >= 4 {
		prefix := clean[:4]
		if op, ok := telcoPrefixes[prefix]; ok {
			result.Operator = op
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

// AnalyzeBank inspects a bank name and account number.
func AnalyzeBank(rawBank, rawAcc string) BankScanResult {
	bankKey := strings.ToLower(strings.TrimSpace(rawBank))
	accOnly := regexp.MustCompile(`[^0-9]`).ReplaceAllString(rawAcc, "")

	result := BankScanResult{
		OriginalBank:    rawBank,
		AccountNumber:   rawAcc,
		CleanNumber:     accOnly,
		InstitutionType: "Bank / Layanan Keuangan",
		StandardDigits:  "10-16 digit",
		DigitLength:     len(accOnly),
		IsLengthValid:   true,
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
		if len(accOnly) < matchedSpec.MinDig || len(accOnly) > matchedSpec.MaxDig {
			result.IsLengthValid = false
			result.RiskScore += 45
			result.RedFlags = append(result.RedFlags, RedFlag{
				Level:       "HIGH",
				Title:       "Panjang Nomor Rekening Tidak Sesuai Standar " + matchedSpec.Name,
				Explanation: fmt.Sprintf("Nomor yang Anda masukkan berjumlah %d digit, sedangkan format resmi %s adalah %s.", len(accOnly), matchedSpec.Name, matchedSpec.Example),
				Snippet:     accOnly,
			})
		}
	}

	// General advice for bank accounts
	result.Recommendations = append(result.Recommendations, "Periksa nama pemilik rekening saat di layar konfirmasi transfer ATM/m-banking. Pastikan atas nama instansi resmi, bukan perorangan.")
	result.Recommendations = append(result.Recommendations, "Waspadai transaksi jika nama penerima rekening berbeda dengan nama orang yang menghubungi Anda.")

	return result
}

// AnalyzeEmail inspects an email address for fraud and impersonation.
func AnalyzeEmail(rawEmail string) EmailScanResult {
	email := strings.ToLower(strings.TrimSpace(rawEmail))
	parts := strings.Split(email, "@")

	result := EmailScanResult{
		Email:           rawEmail,
		Username:        "",
		Domain:          "",
		IsDisposable:    false,
		IsFreeProvider:  false,
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
			Explanation: "Email tidak memiliki struktur username@domain yang sah.",
			Snippet:     rawEmail,
		})
		return result
	}

	username := parts[0]
	domain := parts[1]
	result.Username = username
	result.Domain = domain

	// 1. Check Disposable / Temporary Email
	if disposableEmailDomains[domain] {
		result.IsDisposable = true
		result.RiskScore = 85
		result.ThreatLevel = "BAHAYA / EMAIL SEMENTARA"
		result.RedFlags = append(result.RedFlags, RedFlag{
			Level:       "CRITICAL",
			Title:       "Domain Email Sementara / Disposable",
			Explanation: "Email ini berasal dari layanan email sekali pakai (disposable mail) yang biasa digunakan sindikat penipuan untuk membuat akun palsu tanpa verifikasi identitas.",
			Snippet:     domain,
		})
		result.Recommendations = append(result.Recommendations, "Jangan pernah merespons pesan atau mengirim dokumen penting ke alamat email sekali pakai.")
		return result
	}

	// 2. Check Free Webmail Impersonating Official Corporate / Institutions
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
				result.RiskScore = 80
				result.ThreatLevel = "BAHAYA / PENYAMARAN INSTANSI"
				result.RedFlags = append(result.RedFlags, RedFlag{
					Level:       "CRITICAL",
					Title:       "Penggunaan Email Gratisan untuk Menyamar sebagai Instansi Resmi",
					Explanation: fmt.Sprintf("Akun menggunakan domain gratisan (@%s) namun mencatut nama instansi/layanan '%s'. Instansi resmi selalu menggunakan domain perusahaan sendiri (misal: @pertamina.com, @bca.co.id).", domain, kw),
					Snippet:     rawEmail,
				})
				result.Recommendations = append(result.Recommendations, "Instansi resmi dan perbankan TIDAK PERNAH menggunakan akun @gmail.com atau @yahoo.com untuk korespondensi resmi.")
				break
			}
		}
	}

	// 3. Typosquatting Check in Domain (e.g. pertamina-rekrutmen.com, bca-finansial.site)
	if strings.Contains(domain, "-") && (strings.Contains(domain, "bca") || strings.Contains(domain, "pertamina") || strings.Contains(domain, "rekrutmen") || strings.Contains(domain, "bri")) {
		result.RiskScore = 75
		result.ThreatLevel = "BAHAYA / DOMAIN PALSU"
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

// AnalyzeFile inspects file parameters, extensions, and metadata.
func AnalyzeFile(filename string, filesize int64, content []byte) FileScanResult {
	cleanName := strings.TrimSpace(filename)
	ext := strings.ToLower(filepath.Ext(cleanName))
	lowerName := strings.ToLower(cleanName)

	hasher := sha256.New()
	if len(content) > 0 {
		hasher.Write(content)
	} else {
		hasher.Write([]byte(cleanName))
	}
	hashStr := hex.EncodeToString(hasher.Sum(nil))

	result := FileScanResult{
		FileName:         cleanName,
		Extension:        ext,
		FileSize:         filesize,
		SHA256:           hashStr,
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
