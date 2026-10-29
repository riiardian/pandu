package scanner

import (
	"regexp"
	"strings"
	"unicode"
)

// CognitiveBias represents a psychological manipulation vector exploited by scammers.
type CognitiveBias struct {
	Category     string   `json:"category"`      // e.g. "URGENCY", "AUTHORITY", "GREED", "SCARCITY", "FEAR"
	Label        string   `json:"label"`         // Indonesian human-readable label
	Description  string   `json:"description"`   // Explanation of how the victim is manipulated
	TriggerWords []string `json:"trigger_words"` // Matched keywords
	Weight       int      `json:"weight"`        // Risk score impact
}

// RedFlag represents an identified indicator of deception with explainable reasoning.
type RedFlag struct {
	Level       string `json:"level"`       // "CRITICAL", "HIGH", "MEDIUM", "INFO"
	Title       string `json:"title"`       // Short title
	Explanation string `json:"explanation"` // Plain language explanation (Why this is dangerous)
	Snippet     string `json:"snippet"`     // Offending text snippet
}

// TextScanResult holds the complete diagnostic result for a message text.
type TextScanResult struct {
	RiskScore        int             `json:"risk_score"`
	ThreatLevel      string          `json:"threat_level"`
	DetectedCategory string          `json:"detected_category"`
	Coverage         string          `json:"coverage"`
	CoverageSummary  string          `json:"coverage_summary"`
	Sources          []SourceResult  `json:"sources"`
	CognitiveBiases  []CognitiveBias `json:"cognitive_biases"`
	RedFlags         []RedFlag       `json:"red_flags"`
	Recommendations  []string        `json:"recommendations"`
	ExtractedURLs    []string        `json:"extracted_urls"`
	ExtractedPhones  []string        `json:"extracted_phones"`
	ExtractedFiles   []string        `json:"extracted_files"`
}

// AnalyzeText performs deep explainable inspection on message text.
func AnalyzeText(rawText string) TextScanResult {
	text := strings.TrimSpace(rawText)
	lower := strings.ToLower(text)

	result := TextScanResult{
		RiskScore:       15,
		Coverage:        CoverageUnavailable,
		CoverageSummary: "Analisis pesan menggunakan indikator lokal. URL dan nomor yang diekstrak diperiksa pada sumber terkait bila tersedia.",
		Sources:         []SourceResult{},
		CognitiveBiases: []CognitiveBias{},
		RedFlags:        []RedFlag{},
		Recommendations: []string{},
		ExtractedURLs:   extractURLs(text),
		ExtractedPhones: extractPhones(text),
		ExtractedFiles:  extractDangerousFiles(lower),
	}

	if text == "" {
		result.ThreatLevel = "INPUT KOSONG / TIDAK DAPAT DIANALISIS"
		result.Recommendations = append(result.Recommendations, "Tidak ada teks yang dianalisis.")
		return result
	}

	score := 0

	// 1. Check Cognitive Biases (Psychological Manipulation)
	biases := evaluateBiases(lower)
	for _, b := range biases {
		result.CognitiveBiases = append(result.CognitiveBiases, b)
		score += b.Weight
	}

	// 2. Specific Scam Modus Pattern Matching (Indonesian Local Context)

	// A. Modus File Berbahaya (.APK, .EXE, Undangan/Surat Tilang)
	if len(result.ExtractedFiles) > 0 {
		score += 75
		result.DetectedCategory = "Penyebaran Malware / Sniffer APK"
		result.RedFlags = append(result.RedFlags, RedFlag{
			Level:       "CRITICAL",
			Title:       "Terdeteksi Lampiran File Aplikasi Berbahaya (.APK)",
			Explanation: "Penipu sering mengirim file berformat .APK (seperti Surat Tilang, Undangan Pernikahan, atau Resi Paket). Jika diinstal, aplikasi ini dapat menyadap SMS OTP m-banking dan menguras saldo rekening secara otomatis.",
			Snippet:     strings.Join(result.ExtractedFiles, ", "),
		})
		result.Recommendations = append(result.Recommendations, "JANGAN PERNAH MENGKLIK ATAU MENGINSTAL file .APK yang dikirim lewat WhatsApp/Telegram!")
	}

	// B. Modus Loker Freelance / Misi Like Video & Follow Toko
	lokerKeywords := []string{"like video", "follow toko", "komisi harian", "gaji paruh waktu", "kerja paruh waktu", "freelance tugas", "misi telegram", "penghasilan tambahan", "screenshot bukti tugas"}
	matchedLoker := matchAny(lower, lokerKeywords)
	if len(matchedLoker) >= 2 || (strings.Contains(lower, "like") && strings.Contains(lower, "komisi")) {
		score += 65
		if result.DetectedCategory == "" {
			result.DetectedCategory = "Loker Freelance Palsu / Scam Misi Berbayar"
		}
		result.RedFlags = append(result.RedFlags, RedFlag{
			Level:       "CRITICAL",
			Title:       "Modus Tugas Like & Follow Berbayar (Task Scam)",
			Explanation: "Sindikat penipuan memancing korban dengan komisi kecil (Rp 10.000 - Rp 50.000) di misi awal. Setelah korban percaya, penipu akan mewajibkan deposit modal jutaan rupiah untuk membuka komisi lebih besar yang tidak akan pernah bisa ditarik.",
			Snippet:     strings.Join(matchedLoker, ", "),
		})
		result.Recommendations = append(result.Recommendations, "Waspadai tawaran kerja yang meminta Anda menyetor uang/deposit dengan dalih 'uang jaminan' atau 'tugas VIP'. Perusahaan resmi tidak pernah memungut biaya dari calon pekerja.")
	}

	// C. Modus Pinjaman Online Ilegal / Pencairan Dana Instan Tanpa Syarat
	pinjolKeywords := []string{"tanpa jaminan", "langsung cair", "tanpa bi checking", "bunga 0%", "dana kilat", "cair 5 menit", "modal ktp"}
	matchedPinjol := matchAny(lower, pinjolKeywords)
	if len(matchedPinjol) >= 2 {
		score += 30
		if result.DetectedCategory == "" {
			result.DetectedCategory = "Tawaran Pinjaman / Investasi Menyesatkan"
		}
		result.RedFlags = append(result.RedFlags, RedFlag{
			Level:       "HIGH",
			Title:       "Klaim Pinjaman Instan Tanpa Verifikasi Resmi",
			Explanation: "Layanan keuangan resmi yang berizin OJK wajib melakukan verifikasi identitas dan penilaian kelayakan kredit. Tawaran yang menjanjikan dana langsung cair tanpa BI checking di chat pribadi sering kali merupakan pinjol ilegal atau penipuan biaya admin di awal.",
			Snippet:     strings.Join(matchedPinjol, ", "),
		})
	}

	// D. Modus Bantuan Pemerintah / Bansos / Kuota Gratis
	bansosKeywords := []string{"bansos", "bantuan pemerintah", "kuota gratis", "subsidi bpjs", "prakerja gelombang", "hadiah dari bri", "undian berhadiah dana"}
	matchedBansos := matchAny(lower, bansosKeywords)
	if len(matchedBansos) >= 1 && len(result.ExtractedURLs) > 0 {
		score += 35
		if result.DetectedCategory == "" {
			result.DetectedCategory = "Phishing Bantuan / Giveaway Palsu"
		}
		result.RedFlags = append(result.RedFlags, RedFlag{
			Level:       "HIGH",
			Title:       "Pencatutan Bantuan / Giveaway Resmi Melalui Tautan Tak Dikenal",
			Explanation: "Instansi pemerintah dan bank BUMN resmi tidak pernah membagikan tautan bantuan melalui pesan broadcast WhatsApp pribadi menggunakan domain gratisan atau shortlink.",
			Snippet:     strings.Join(matchedBansos, ", "),
		})
	}

	// E. Modus Teman / Kerabat Pinjam Uang (Impersonasi)
	impersonasiKeywords := []string{"ganti nomor", "nomor baru", "lagi di jalan", "atm ketelen", "pinjam dulu", "urgent butuh", "besok diganti", "tolong transferin dulu"}
	matchedImp := matchAny(lower, impersonasiKeywords)
	if len(matchedImp) >= 2 {
		score += 30
		if result.DetectedCategory == "" {
			result.DetectedCategory = "Impersonasi Teman / Kerabat Darurat"
		}
		result.RedFlags = append(result.RedFlags, RedFlag{
			Level:       "HIGH",
			Title:       "Indikasi Pembajakan Akun / Impersonasi Kerabat",
			Explanation: "Penipu menyamar sebagai orang terdekat yang mendadak berganti nomor HP dan meminta transfer uang cepat karena situasi darurat tanpa ingin menerima panggilan telepon.",
			Snippet:     strings.Join(matchedImp, ", "),
		})
		result.Recommendations = append(result.Recommendations, "Lakukan verifikasi dua arah: Telepon suara atau video call nomor lama kerabat Anda untuk memastikan kebenaran sebelum mengirim uang.")
	}

	// F. Deteksi Tautan / Link Mencurigakan di dalam teks
	if len(result.ExtractedURLs) > 0 {
		score += 15
		for _, u := range result.ExtractedURLs {
			uLower := strings.ToLower(u)
			if strings.Contains(uLower, "bit.ly") || strings.Contains(uLower, "s.id") || strings.Contains(uLower, "tinyurl") || strings.Contains(uLower, "linktr.ee") {
				score += 15
				result.RedFlags = append(result.RedFlags, RedFlag{
					Level:       "MEDIUM",
					Title:       "Tautan Pendek / URL Redirection",
					Explanation: "Tautan pendek digunakan untuk menyembunyikan alamat domain tujuan asli. Penipu sengaja membungkus situs phishing dengan shortlink agar tidak langsung dicurigai pengguna.",
					Snippet:     u,
				})
			}
			if strings.Contains(uLower, ".apk") || strings.Contains(uLower, "download") {
				score += 25
			}
		}
	}

	// Normalisasi Skor (Cap 100)
	if score > 100 {
		score = 100
	}
	result.RiskScore = score

	// Tetapkan Label Tingkat Bahaya
	switch {
	case score >= 70:
		result.ThreatLevel = "KRITIS / INDIKASI PENIPUAN TINGGI"
		result.Recommendations = append(result.Recommendations, "Hentikan seluruh komunikasi dengan pengirim pesan ini segera.", "Jangan kirimkan uang, data diri (KTP/Foto selfie), atau kode OTP apapun.")
	case score >= 45:
		result.ThreatLevel = "BAHAYA / WASPADA TINGGI"
		result.Recommendations = append(result.Recommendations, "Lakukan konfirmasi manual melalui saluran resmi instansi/perusahaan terkait.", "Jangan terburu-buru mengambil keputusan atas desakan pesan ini.")
	case score >= 20:
		result.ThreatLevel = "WASPADA / PERLU PERHATIAN"
		result.Recommendations = append(result.Recommendations, "Periksa kembali identitas pengirim dan verifikasi tautan yang disertakan.")
	default:
		result.ThreatLevel = "TIDAK DITEMUKAN POLA MANIPULASI KUAT"
		result.Recommendations = append(result.Recommendations, "Tidak ditemukan pola manipulasi kuat pada pemeriksaan lokal. Hasil ini bukan jaminan bahwa pengirim atau isi pesan aman.")
	}

	if result.DetectedCategory == "" {
		if score >= 40 {
			result.DetectedCategory = "Pesan Manipulatif Berisiko"
		} else {
			result.DetectedCategory = "Komunikasi Standar / Informasi Umum"
		}
	}

	return result
}

func evaluateBiases(text string) []CognitiveBias {
	var biases []CognitiveBias

	// 1. Urgency (Manipulasi Ketergesa-gesaan)
	urgencyWords := []string{"segera", "hari ini juga", "sebelum terlambat", "hanya 10 menit", "blokir permanen", "dalam 24 jam", "kesempatan terakhir", "sekarang juga", "batas akhir"}
	matchedUrgency := matchAny(text, urgencyWords)
	if len(matchedUrgency) > 0 {
		biases = append(biases, CognitiveBias{
			Category:     "URGENCY",
			Label:        "Manipulasi Kepanikan / Desakan Waktu (Urgency Exploit)",
			Description:  "Penipu sengaja membatasi waktu berpikir Anda agar Anda bertindak impulsif sebelum sempat memverifikasi kebenaran informasi.",
			TriggerWords: matchedUrgency,
			Weight:       15,
		})
	}

	// 2. Authority (Mencatut Otoritas / Pejabat / Perusahaan Besar)
	authorityWords := []string{"polri", "kepolisian", "bca", "bri", "mandiri", "kominfo", "pajak", "kurir j&t", "kurir jne", "admin pusat", "customer service pusat", "pihak bank", "kejaksaan", "bumn"}
	matchedAuthority := matchAny(text, authorityWords)
	if len(matchedAuthority) > 0 {
		biases = append(biases, CognitiveBias{
			Category:     "AUTHORITY",
			Label:        "Pencatutan Otoritas Resmi (Authority Bias)",
			Description:  "Menggunakan nama instansi negara, bank, atau aparat penegak hukum untuk memunculkan rasa takut dan kepatuhan instan korban.",
			TriggerWords: matchedAuthority,
			Weight:       15,
		})
	}

	// 3. Greed / False Reward (Iming-iming Keuntungan Instan)
	greedWords := []string{"gratis", "bonus saldo", "pemenang undian", "dapat uang", "profit 100%", "tanpa modal", "uang mudah", "gaji harian jutaan", "hadiah tunai"}
	matchedGreed := matchAny(text, greedWords)
	if len(matchedGreed) > 0 {
		biases = append(biases, CognitiveBias{
			Category:     "GREED",
			Label:        "Eksploitasi Keinginan Untung Cepat (Reward / Greed Exploit)",
			Description:  "Memancing korban dengan imbalan fantastis yang tidak masuk akal untuk menutupi risiko penipuan di baliknya.",
			TriggerWords: matchedGreed,
			Weight:       15,
		})
	}

	// 4. Scarcity (Kelangkaan Buatan)
	scarcityWords := []string{"hanya untuk 5 orang", "slot terbatas", "sisa kuota", "kuota hampir habis", "khusus member terpilih", "hanya hari ini"}
	matchedScarcity := matchAny(text, scarcityWords)
	if len(matchedScarcity) > 0 {
		biases = append(biases, CognitiveBias{
			Category:     "SCARCITY",
			Label:        "Eksploitasi Rasa Takut Kehabisan / FOMO (Scarcity Exploit)",
			Description:  "Membuat kesan bahwa kesempatan sangat langka agar korban segera mendaftar atau menyetor uang tanpa berpikir panjang.",
			TriggerWords: matchedScarcity,
			Weight:       10,
		})
	}

	return biases
}

func matchAny(text string, words []string) []string {
	var found []string
	for _, w := range words {
		if strings.Contains(text, w) {
			found = append(found, w)
		}
	}
	return found
}

func extractURLs(text string) []string {
	re := regexp.MustCompile(`https?://[^\s/$.?#].[^\s]*|www\.[^\s/$.?#].[^\s]*|[a-zA-Z0-9-]+\.(?:com|id|net|org|xyz|site|top|cc|me|live|link|fun|online|info|app)[^\s]*`)
	matches := re.FindAllString(text, -1)
	var cleaned []string
	for _, m := range matches {
		m = strings.TrimRight(m, ".,!?;:)")
		cleaned = append(cleaned, m)
	}
	return cleaned
}

func extractPhones(text string) []string {
	re := regexp.MustCompile(`(?:\+62|62|08)[0-9]{8,13}`)
	return re.FindAllString(text, -1)
}

func extractDangerousFiles(text string) []string {
	re := regexp.MustCompile(`[a-zA-Z0-9_\-\.]+\.(?:apk|exe|scr|vbs|bat|msi|cmd|jar)`)
	matches := re.FindAllString(text, -1)
	return matches
}

// CleanString cleans non-printable characters
func CleanString(str string) string {
	return strings.Map(func(r rune) rune {
		if unicode.IsPrint(r) {
			return r
		}
		return -1
	}, str)
}
