package scanner

import (
	"regexp"
	"strings"
	"unicode"
)

// CognitiveBias represents a psychological manipulation vector exploited by scammers.
type CognitiveBias struct {
	Category     string   `json:"category"`      // e.g. "URGENCY", "AUTHORITY", "GREED", "SCARCITY", "FEAR", "COERCION", "CREDENTIAL"
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
		RiskScore:       0,
		Coverage:        CoverageComplete,
		CoverageSummary: "Analisis heuristik rekayasa sosial multi-vektor dan taksonomi penipuan digital selesai.",
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
	hasFear := false
	hasUrgency := false
	hasCoercion := false
	hasCredential := false

	// 1. Evaluate Cognitive Biases (Psychological Manipulation)
	biases := evaluateBiases(lower)
	for _, b := range biases {
		result.CognitiveBiases = append(result.CognitiveBiases, b)
		score += b.Weight
		switch b.Category {
		case "FEAR":
			hasFear = true
		case "URGENCY":
			hasUrgency = true
		case "COERCION":
			hasCoercion = true
		case "CREDENTIAL":
			hasCredential = true
		}
	}

	// 2. Specific Digital Scam Modus Pattern Matching (Comprehensive Indonesian Taxonomy)

	// A. Modus Darurat Medis / Kecelakaan Keluarga Palsu (Emergency Medical Extortion Scam)
	emergencyWords := []string{
		"kecelakaan", "tertabrak", "kritis", "ugd", "igd", "rumah sakit", "rsud", "operasi",
		"kantong darah", "butuh darah", "tidak tertolong", "tertusuk", "masuk ugd", "masuk igd",
		"ruang icu", "dokter jaga", "kondisi darurat", "pasien kritis", "ambulans",
	}
	familyWords := []string{
		"keluarga", "anak", "putri", "putra", "ibu", "bapak", "istri", "suami", "adik", "kakak", "saudara",
	}
	paymentWords := []string{
		"transfer", "biaya", "administrasi", "rekening", "uang", "juta", "rupiah", "bayar", "dp", "uang muka", "tebus",
	}

	matchedEmergency := matchAny(lower, emergencyWords)
	matchedFamily := matchAny(lower, familyWords)
	matchedPayment := matchAny(lower, paymentWords)

	if len(matchedEmergency) >= 1 && len(matchedPayment) >= 1 && (len(matchedFamily) >= 1 || strings.Contains(lower, "tertulung") || strings.Contains(lower, "tertolong") || strings.Contains(lower, "segera") || strings.Contains(lower, "kini")) {
		score += 80
		result.DetectedCategory = "Darurat Medis / Pemerasan Kecelakaan Keluarga Palsu"
		result.RedFlags = append(result.RedFlags, RedFlag{
			Level:       "CRITICAL",
			Title:       "Modus Rekayasa Sosial Kepanikan Kecelakaan Keluarga (Medical Emergency Scam)",
			Explanation: "Skenario klasik rekayasa sosial tingkat tinggi: pelaku sengaja memicu rasa panik orang tua/keluarga dengan mengabarkan anggota keluarga mengalami kecelakaan fatal di rumah sakit dan menuntut transfer uang biaya operasi/administrasi ke nomor rekening pribadi. Fakta penting: Rumah sakit resmi memiliki SOP penanganan darurat tanpa menahan tindakan medis karena biaya, dan TIDAK PERNAH menuntut transfer uang darurat ke rekening pribadi pihak ketiga melalui pesan chat.",
			Snippet:     strings.Join(append(matchedEmergency, matchedPayment...), ", "),
		})
		result.Recommendations = append(result.Recommendations,
			"JANGAN PERNAH mentransfer uang ke rekening perorangan yang diberikan pengirim.",
			"Tetap tenang dan segera hubungi langsung nomor telepon anggota keluarga yang bersangkutan atau kerabat terdekat.",
			"Hubungi saluran resmi Rumah Sakit / IGD terkait secara mandiri untuk memverifikasi data pasien.",
		)
	}

	// B. Modus Pemerasan Aparat Penegak Hukum / Kasus Narkoba / Tilang (Law Enforcement Extortion)
	policeWords := []string{"polisi", "polres", "polda", "bareskrim", "penyidik", "narkoba", "narkotika", "ditangkap", "surat penangkapan", "tahanan", "razia", "kasus pidana", "bea cukai", "tppu", "pencucian uang"}
	extortWords := []string{"uang damai", "dana jaminan", "selesai secara damai", "tidak masuk sel", "sebelum diserahkan", "bantu selesaikan", "jangan beritahu", "uang tebusan"}
	matchedPolice := matchAny(lower, policeWords)
	matchedExtort := matchAny(lower, extortWords)

	if (len(matchedPolice) >= 1 && len(matchedExtort) >= 1) || (len(matchedPolice) >= 2 && strings.Contains(lower, "transfer")) {
		score += 75
		if result.DetectedCategory == "" {
			result.DetectedCategory = "Pemerasan Berkedok Aparat Penegak Hukum"
		}
		result.RedFlags = append(result.RedFlags, RedFlag{
			Level:       "CRITICAL",
			Title:       "Indikasi Pemerasan Berkedok Aparat Penegak Hukum Gadungan",
			Explanation: "Pelaku menakut-nakuti korban dengan tuduhan penangkapan kasus pidana (narkoba/razia/bea cukai) dan menawarkan opsi 'damai' dengan syarat transfer sejumlah uang. Aparat penegak hukum resmi TIDAK PERNAH meminta uang damai atau transfer jaminan ke rekening perorangan melalui telepon/chat.",
			Snippet:     strings.Join(append(matchedPolice, matchedExtort...), ", "),
		})
		result.Recommendations = append(result.Recommendations,
			"Tolak segala bentuk tawaran damai atau transfer uang jaminan.",
			"Datangi langsung kantor kepolisian / polsek setempat untuk verifikasi kebenaran laporan.",
		)
	}

	// C. Modus Phishing Perbankan / Perubahan Tarif Transaksi / Pemblokiran Akun
	bankTariffWords := []string{"tarif transaksi", "perubahan tarif", "auto debet", "kenaikan biaya", "tarif transfer", "bca mobile", "brimo", "livin", "kartu atm", "kartu kredit", "rekening diblokir", "kartu tertelan", "blokir akun", "pembatalan tarif"}
	matchedBankTariff := matchAny(lower, bankTariffWords)
	if len(matchedBankTariff) >= 2 || (len(matchedBankTariff) >= 1 && (len(result.ExtractedURLs) > 0 || strings.Contains(lower, "link") || strings.Contains(lower, "batal"))) {
		score += 70
		if result.DetectedCategory == "" {
			result.DetectedCategory = "Phishing Perbankan / Kenaikan Tarif Palsu"
		}
		result.RedFlags = append(result.RedFlags, RedFlag{
			Level:       "CRITICAL",
			Title:       "Modus Phishing Perubahan Tarif Bank & Pembajakan Akun (Bank Impersonation)",
			Explanation: "Pesan menyebarkan kepanikan palsu bahwa tarif transfer bank naik drastis (misal Rp 150.000/bulan) dan mengarahkan korban ke link phishing untuk 'membatalkan'. Tautan tersebut dibuat untuk mencuri nomor kartu, CVV, dan kode OTP m-banking korban.",
			Snippet:     strings.Join(matchedBankTariff, ", "),
		})
		result.Recommendations = append(result.Recommendations,
			"Jangan klik tautan pembatalan tarif apapun. Bank resmi tidak pernah meminta konfirmasi pembatalan tarif lewat link chat pribadi.",
			"Hubungi kontak resmi HaloBCA (1500888), Contact BRI (1500017), atau bank terkait.",
		)
	}

	// D. Modus Teror Pinjol / Ancaman Sebar Data Pribadi & Foto KTP (Doxing & Harassment)
	terrorWords := []string{"sebar data", "bayar hutang", "bawa kabur uang", "kontak darurat", "foto ktp anda", "permalukan", "surat somasi", "debt collector", "teror", "hukum pidana penipuan", "maling uang"}
	matchedTerror := matchAny(lower, terrorWords)
	if len(matchedTerror) >= 2 {
		score += 65
		if result.DetectedCategory == "" {
			result.DetectedCategory = "Teror Pinjol Ilegal / Pemerasan Sebar Data Pribadi"
		}
		result.RedFlags = append(result.RedFlags, RedFlag{
			Level:       "CRITICAL",
			Title:       "Indikasi Intimidasi Penagihan Liar / Pemerasan Sebar Data (Doxing)",
			Explanation: "Pola pesan intimidasi yang mengancam menyebarkan foto KTP atau mempermalukan ke kontak darurat. Layanan keuangan resmi berizin OJK terikat regulasi ketat dan dilarang keras menyebarkan data pribadi atau melakukan intimidasi di luar koridor hukum.",
			Snippet:     strings.Join(matchedTerror, ", "),
		})
		result.Recommendations = append(result.Recommendations,
			"Amankan bukti tangkapan layar (screenshot) dan jangan tertekan untuk mentransfer dana secara sembarangan.",
			"Laporkan nomor peneror ke portal aduannomor.id dan Satgas Pasti OJK.",
		)
	}

	// E. Modus File Berbahaya (.APK, .EXE, Undangan/Surat Tilang/Kurir)
	if len(result.ExtractedFiles) > 0 {
		score += 80
		if result.DetectedCategory == "" {
			result.DetectedCategory = "Penyebaran Malware / Sniffer APK"
		}
		result.RedFlags = append(result.RedFlags, RedFlag{
			Level:       "CRITICAL",
			Title:       "Terdeteksi Lampiran File Aplikasi Berbahaya (.APK)",
			Explanation: "Penipu sering mengirim file berformat .APK (seperti Surat Tilang ETLE, Undangan Pernikahan, atau Resi Paket). Jika diinstal, aplikasi ini dapat menyadap SMS OTP m-banking dan menguras saldo rekening secara otomatis.",
			Snippet:     strings.Join(result.ExtractedFiles, ", "),
		})
		result.Recommendations = append(result.Recommendations, "JANGAN PERNAH MENGKLIK ATAU MENGINSTAL file .APK yang dikirim lewat WhatsApp/Telegram!")
	}

	// F. Modus Loker Freelance / Misi Like Video & Follow Toko (Task Scam)
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

	// G. Modus Pinjaman Online Ilegal / Pencairan Dana Instan Tanpa Syarat
	pinjolKeywords := []string{"tanpa jaminan", "langsung cair", "tanpa bi checking", "bunga 0%", "dana kilat", "cair 5 menit", "modal ktp"}
	matchedPinjol := matchAny(lower, pinjolKeywords)
	if len(matchedPinjol) >= 2 {
		score += 35
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

	// H. Modus Hadiah / Undian Berbayar (Advance-Fee Fraud)
	hadiahKeywords := []string{"menang undian", "selamat anda", "pemenang hadiah", "klaim hadiah", "hadiah tunai", "bonus saldo"}
	tebusKeywords := []string{"transfer deposit", "uang deposit", "setor modal", "biaya admin", "pajak pemenang", "biaya tebus"}
	matchedHadiah := matchAny(lower, hadiahKeywords)
	matchedTebus := matchAny(lower, tebusKeywords)
	if len(matchedHadiah) >= 1 && (len(matchedTebus) >= 1 || strings.Contains(lower, "deposit") || strings.Contains(lower, "transfer")) {
		score += 65
		if result.DetectedCategory == "" {
			result.DetectedCategory = "Penipuan Hadiah / Undian Palsu (Advance-Fee)"
		}
		result.RedFlags = append(result.RedFlags, RedFlag{
			Level:       "CRITICAL",
			Title:       "Indikasi Modus Hadiah / Undian Berbayar (Advance-Fee Fraud)",
			Explanation: "Pesan mengabarkan kemenangan undian atau hadiah uang, namun menuntut Anda mentransfer uang (deposit atau biaya admin). Undian resmi berizin Kemensos/instansi resmi tidak pernah memungut biaya tebusan di muka dari pemenang.",
			Snippet:     strings.Join(append(matchedHadiah, matchedTebus...), ", "),
		})
		result.Recommendations = append(result.Recommendations, "Jangan pernah mentransfer uang, biaya administrasi, atau deposit untuk mencairkan hadiah apapun.")
	}

	// I. Modus Teman / Kerabat Pinjam Uang (Impersonasi)
	impersonasiKeywords := []string{"ganti nomor", "nomor baru", "lagi di jalan", "atm ketelen", "pinjam dulu", "urgent butuh", "besok diganti", "tolong transferin dulu", "hp saya rusak"}
	matchedImp := matchAny(lower, impersonasiKeywords)
	if len(matchedImp) >= 2 {
		score += 45
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

	// J. Modus Bantuan Pemerintah / Bansos / Kuota Gratis Phishing
	bansosKeywords := []string{"bansos", "bantuan pemerintah", "kuota gratis", "subsidi bpjs", "prakerja gelombang", "hadiah dari bri", "undian berhadiah dana"}
	matchedBansos := matchAny(lower, bansosKeywords)
	if len(matchedBansos) >= 1 && len(result.ExtractedURLs) > 0 {
		score += 40
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

	// K. Modus Pencurian Kredensial Rahasia (OTP / PIN / CVV / Password)
	if hasCredential && (strings.Contains(lower, "kirim") || strings.Contains(lower, "berikan") || strings.Contains(lower, "sebutkan") || strings.Contains(lower, "verifikasi") || strings.Contains(lower, "link")) {
		score += 70
		if result.DetectedCategory == "" {
			result.DetectedCategory = "Pencurian Kredensial Rahasia (Credential Harvesting)"
		}
		result.RedFlags = append(result.RedFlags, RedFlag{
			Level:       "CRITICAL",
			Title:       "Permintaan Kode Rahasia / OTP / PIN Transaksi",
			Explanation: "Pihak bank, dompet digital, maupun instansi resmi TIDAK PERNAH meminta kode OTP, PIN, password, atau nomor CVV kartu debit/kredit Anda untuk alasan apapun.",
		})
		result.Recommendations = append(result.Recommendations, "JANGAN PERNAH membagikan kode OTP atau PIN kepada siapapun, termasuk pihak yang mengaku petugas resmi.")
	}

	// L. Deteksi Tautan / Link Mencurigakan di dalam teks
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

	// 3. Social Engineering Triad Multiplier (FEAR + URGENCY + COERCION)
	if hasFear && hasUrgency && hasCoercion {
		if score < 90 {
			score = 94
		}
		result.RedFlags = append([]RedFlag{
			{
				Level:       "CRITICAL",
				Title:       "Kombinasi Pola Manipulasi Tingkat Tinggi (Triad Rekayasa Sosial)",
				Explanation: "Pesan ini memadukan tiga senjata rekayasa sosial paling berbahaya sekaligus: Memanipulasi Rasa Takut Ekstrem (Fear), Membatasi Waktu Berpikir (Urgency), dan Menuntut Pengalihan Finansial Segera (Coercion). Skenario seperti ini hampir pasti merupakan tindak kejahatan manipulasi sosial.",
			},
		}, result.RedFlags...)
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
		result.Recommendations = append([]string{
			"Hentikan seluruh komunikasi dengan pengirim pesan ini segera.",
			"JANGAN kirimkan uang, data diri (KTP/Foto selfie), atau kode OTP apapun.",
		}, result.Recommendations...)
	case score >= 45:
		result.ThreatLevel = "BAHAYA / WASPADA TINGGI"
		result.Recommendations = append([]string{
			"Lakukan konfirmasi manual melalui saluran resmi instansi/perusahaan terkait.",
			"Jangan terburu-buru mengambil keputusan atas desakan pesan ini.",
		}, result.Recommendations...)
	case score >= 20:
		result.ThreatLevel = "WASPADA / PERLU PERHATIAN"
		result.Recommendations = append([]string{
			"Periksa kembali identitas pengirim dan verifikasi tautan yang disertakan.",
		}, result.Recommendations...)
	default:
		result.ThreatLevel = "TIDAK DITEMUKAN POLA MANIPULASI"
		result.Recommendations = append(result.Recommendations, "Pesan tidak menunjukkan ciri-ciri manipulasi psikologis, desakan waktu, atau iming-iming mencurigakan.")
	}

	if result.DetectedCategory == "" {
		if score >= 40 {
			result.DetectedCategory = "Pesan Mengandung Indikasi Manipulatif"
		} else {
			result.DetectedCategory = "Komunikasi Wajar / Pesan Standar"
		}
	}

	return result
}

func evaluateBiases(text string) []CognitiveBias {
	var biases []CognitiveBias

	// 1. Fear / Panic / Extortion (Manipulasi Kepanikan / Rasa Takut Ekstrem)
	fearWords := []string{
		"kecelakaan", "tidak tertolong", "kritis", "darurat", "nyawa", "operasi",
		"masuk ugd", "masuk igd", "kantong darah", "butuh darah", "ditangkap", "masuk sel",
		"masuk tahanan", "polisi", "narkoba", "sebar data", "hukum", "somasi", "pidana",
		"tersangka", "kasus hukum", "ancaman penjara", "tertahan di bea cukai", "tertabrak",
	}
	matchedFear := matchAny(text, fearWords)
	if len(matchedFear) > 0 {
		biases = append(biases, CognitiveBias{
			Category:     "FEAR",
			Label:        "Manipulasi Kepanikan & Rasa Takut Ekstrem (Fear / Panic Exploit)",
			Description:  "Penipu memanfaatkan rasa takut dan kekhawatiran mendalam korban (kabar kecelakaan anak, ancaman pidana polisi, atau penyebaran data) agar logika kritis padam.",
			TriggerWords: matchedFear,
			Weight:       25,
		})
	}

	// 2. Coercion / Financial Pressure (Desakan Finansial & Instruksi Transfer)
	coercionWords := []string{
		"transfer ke rekening", "transfer ke", "biaya administrasi", "biaya admin",
		"uang muka", "deposit", "setor modal", "tebus", "biaya obat", "uang damai",
		"dana jaminan", "bayar hutang", "uang jaminan", "transfer uang", "kirim uang", "rekening saya",
	}
	matchedCoercion := matchAny(text, coercionWords)
	if len(matchedCoercion) > 0 {
		biases = append(biases, CognitiveBias{
			Category:     "COERCION",
			Label:        "Desakan Transaksi Finansial (Financial Coercion)",
			Description:  "Mengarahkan korban untuk segera melakukan transfer dana ke rekening perorangan sebagai prasyarat keluar dari situasi darurat.",
			TriggerWords: matchedCoercion,
			Weight:       20,
		})
	}

	// 3. Credential Harvesting (Eksploitasi Kredensial & Data Rahasia)
	credentialWords := []string{
		"kode otp", "kode verifikasi", "nomor cvv", "nomor cvc", "pin atm",
		"password", "kata sandi", "foto ktp", "selfie ktp", "6 digit",
	}
	matchedCredential := matchAny(text, credentialWords)
	if len(matchedCredential) > 0 {
		biases = append(biases, CognitiveBias{
			Category:     "CREDENTIAL",
			Label:        "Eksploitasi Kredensial & Data Rahasia (Credential Harvesting)",
			Description:  "Upaya memancing korban menyerahkan kode rahasia satu kali pakai (OTP), PIN, atau nomor kartu untuk pengambilalihan akun perbankan.",
			TriggerWords: matchedCredential,
			Weight:       25,
		})
	}

	// 4. Urgency (Manipulasi Ketergesa-gesaan)
	urgencyWords := []string{
		"segera", "hari ini juga", "sebelum terlambat", "hanya 10 menit", "blokir permanen",
		"dalam 24 jam", "kesempatan terakhir", "sekarang juga", "batas akhir", "sebelum hangus",
		"menit lagi", "tidak akan tertolong", "dalam waktu 1 jam",
	}
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

	// 5. Authority (Mencatut Otoritas / Pejabat / Perusahaan Besar)
	authorityWords := []string{
		"polri", "kepolisian", "polres", "polda", "kejaksaan", "bca", "bri", "mandiri", "bni",
		"bsi", "kominfo", "pajak", "kurir j&t", "kurir jne", "admin pusat", "customer service pusat",
		"pihak bank", "rumah sakit", "rsud", "dokter", "pihak medis", "bea cukai", "kpk", "ojk", "bumn",
	}
	matchedAuthority := matchAny(text, authorityWords)
	if len(matchedAuthority) > 0 {
		biases = append(biases, CognitiveBias{
			Category:     "AUTHORITY",
			Label:        "Pencatutan Otoritas Resmi (Authority Bias)",
			Description:  "Menggunakan nama instansi negara, bank, rumah sakit, atau aparat penegak hukum untuk memunculkan kepatuhan dan rasa segan instan korban.",
			TriggerWords: matchedAuthority,
			Weight:       15,
		})
	}

	// 6. Greed / False Reward (Iming-iming Keuntungan Instan)
	greedWords := []string{
		"gratis", "bonus saldo", "pemenang undian", "menang undian", "dapat uang",
		"profit 100%", "tanpa modal", "uang mudah", "gaji harian jutaan", "hadiah tunai", "klaim hadiah",
	}
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

	// 7. Scarcity (Kelangkaan Buatan)
	scarcityWords := []string{
		"hanya untuk 5 orang", "slot terbatas", "sisa kuota", "kuota hampir habis",
		"khusus member terpilih", "hanya hari ini",
	}
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
