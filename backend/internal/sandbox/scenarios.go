package sandbox

// ScenarioChoice represents an action option a user can take during the simulation.
type ScenarioChoice struct {
	ID             string `json:"id"`
	Text           string `json:"text"`            // The user's reply or action
	SafetyRating   string `json:"safety_rating"`   // "SAFE", "RISKY", "FATAL"
	Feedback       string `json:"feedback"`        // Tactical explanation of why this choice is good or bad
	ScoreDelta     int    `json:"score_delta"`     // Score awarded or deducted
	NextStepID     string `json:"next_step_id"`    // Pointer to next dialogue step, or "END"
	PsychologyNote string `json:"psychology_note"` // What psychological pressure was addressed
}

// DialogueStep represents a single interaction turn in the scenario.
type DialogueStep struct {
	StepID          string           `json:"step_id"`
	SenderName      string           `json:"sender_name"`
	SenderAvatar    string           `json:"sender_avatar"`
	SenderRole      string           `json:"sender_role"`
	Message         string           `json:"message"`
	AttachmentType  string           `json:"attachment_type,omitempty"` // "NONE", "FILE_APK", "IMAGE", "LINK"
	AttachmentData  string           `json:"attachment_data,omitempty"`
	DeceptionTactic string           `json:"deception_tactic"`          // e.g. "Artificial Urgency", "Sunk Cost Trap"
	Choices         []ScenarioChoice `json:"choices"`
}

// Scenario represents a complete interactive training case.
type Scenario struct {
	ID          string                  `json:"id"`
	Title       string                  `json:"title"`
	Category    string                  `json:"category"`
	Difficulty  string                  `json:"difficulty"` // "Mudah", "Sedang", "Tantangan"
	Platform    string                  `json:"platform"`   // "WhatsApp", "Telegram", "Instagram DM"
	Description string                  `json:"description"`
	InitialStep string                  `json:"initial_step"`
	Steps       map[string]DialogueStep `json:"steps"`
}

// GetCatalog returns all available training scenarios.
func GetCatalog() []Scenario {
	return []Scenario{
		getLokerTaskScamScenario(),
		getKurirMalwareApkScenario(),
		getTemanImpersonasiPinjolScenario(),
	}
}

// GetScenarioByID fetches a specific scenario by ID.
func GetScenarioByID(id string) *Scenario {
	for _, s := range GetCatalog() {
		if s.ID == id {
			return &s
		}
	}
	return nil
}

func getLokerTaskScamScenario() Scenario {
	steps := make(map[string]DialogueStep)

	steps["step_1"] = DialogueStep{
		StepID:          "step_1",
		SenderName:      "Cindy - HR Talent Media Promosi",
		SenderAvatar:    "https://api.dicebear.com/7.x/personas/svg?seed=Cindy",
		SenderRole:      "Nomor Asing (+62 858-9921-0041)",
		Message:         "Halo kak! Maaf mengganggu waktunya sebentar. Kami dari Agensi Mitra Kreatif sedang membuka lowongan kerja sampingan online untuk mahasiswa. Tugasnya gampang banget, cukup Like video YouTube dan Follow akun toko. Komisi 30.000 - 50.000 per tugas langsung ditransfer ke e-wallet kakak hari ini. Apakah kakak tertarik untuk mencoba tugas pertama gratis?",
		AttachmentType:  "NONE",
		DeceptionTactic: "Free Baiting & Low Effort Trap (Memancing dengan imbalan mudah tanpa modal awal)",
		Choices: []ScenarioChoice{
			{
				ID:             "c1_a",
				Text:           "Wah menarik kak! Boleh, bagaimana cara mulainya?",
				SafetyRating:   "RISKY",
				Feedback:       "Anda langsung menerima tawaran dari nomor pribadi tanpa memverifikasi perusahaan. Penipu memang sengaja memberikan uang Rp 30.000 di awal agar Anda percaya dan mau menyetor uang lebih besar di tugas berikutnya.",
				ScoreDelta:     -10,
				NextStepID:     "step_2_bait_taken",
				PsychologyNote: "Mudah tergiur uang instan (Greed Exploit).",
			},
			{
				ID:             "c1_b",
				Text:           "Bisa minta website resmi perusahaan dan info kantornya dulu kak?",
				SafetyRating:   "SAFE",
				Feedback:       "Langkah tepat! Meminta identitas legalitas perusahaan dan alamat resmi adalah respons kritis pertama yang membuat penipu bingung.",
				ScoreDelta:     20,
				NextStepID:     "step_2_verify",
				PsychologyNote: "Skeptisisme sehat & Verifikasi Otoritas.",
			},
			{
				ID:             "c1_c",
				Text:           "Maaf saya tidak berminat. Tolong jangan hubungi nomor saya lagi. (Langsung Blokir)",
				SafetyRating:   "SAFE",
				Feedback:       "Pilihan paling aman dan hemat energi. Menolak dan memutus interaksi seketika menutup peluang manipulasi psikologis penipu.",
				ScoreDelta:     25,
				NextStepID:     "step_end_blocked",
				PsychologyNote: "Menegakkan batas privasi digital.",
			},
		},
	}

	steps["step_2_bait_taken"] = DialogueStep{
		StepID:          "step_2_bait_taken",
		SenderName:      "Cindy - HR Talent Media Promosi",
		SenderAvatar:    "https://api.dicebear.com/7.x/personas/svg?seed=Cindy",
		SenderRole:      "Nomor Asing (+62 858-9921-0041)",
		Message:         "Hebat kak! Komisi tugas pertama Rp 30.000 sudah kami transfer ya. Nah sekarang ada Tugas VIP Eksklusif! Kalau kakak deposit modal Rp 500.000 ke rekening bendahara kami, dalam 15 menit saldo kembali jadi Rp 750.000 (+ untung 50%). Tapi buruan ya kak, sisa 2 slot dan berlaku hanya 10 menit lagi!",
		AttachmentType:  "IMAGE",
		AttachmentData:  "Bukti Transfer Palsu & Surat Penugasan VIP",
		DeceptionTactic: "Artificial Urgency + Sunk Cost Fallacy (Desakan waktu palsu & jebakan setor uang)",
		Choices: []ScenarioChoice{
			{
				ID:             "c2_a",
				Text:           "Oke kak saya langsung transfer Rp 500.000 ke rekeningnya ya.",
				SafetyRating:   "FATAL",
				Feedback:       "JEBAKAN FATAL! Ini adalah titik di mana uang Anda lenyap. Setelah transfer 500rb, penipu akan berdalih 'sistem error' dan meminta transfer lagi 2 juta rupiah untuk mencairkan saldo, sampai tabungan Anda habis.",
				ScoreDelta:     -40,
				NextStepID:     "step_end_scammed",
				PsychologyNote: "Terjebak manipulasi kelangkaan (Scarcity) dan kepanikan (Urgency).",
			},
			{
				ID:             "c2_b",
				Text:           "Loh, katanya lowongan kerja tapi kenapa saya yang harus bayar deposit modal?",
				SafetyRating:   "SAFE",
				Feedback:       "Argumen telak! Perusahaan resmi manapun tidak pernah meminta uang jaminan atau deposit untuk bekerja. Pertanyaan ini memecahkan skenario manipulasi penipu.",
				ScoreDelta:     30,
				NextStepID:     "step_2_confront",
				PsychologyNote: "Logika kritis mematahkan skenario manipulasi.",
			},
		},
	}

	steps["step_2_verify"] = DialogueStep{
		StepID:          "step_2_verify",
		SenderName:      "Cindy - HR Talent Media Promosi",
		SenderAvatar:    "https://api.dicebear.com/7.x/personas/svg?seed=Cindy",
		SenderRole:      "Nomor Asing (+62 858-9921-0041)",
		Message:         "Kami perusahaan resmi kak, ini link sertifikat legalitas kami: http://mitra-kreatif-indonesia.xyz/legalitas. Kakak bisa cek sendiri, kami sudah bermitra dengan YouTube dan Shopee kok.",
		AttachmentType:  "LINK",
		AttachmentData:  "http://mitra-kreatif-indonesia.xyz/legalitas",
		DeceptionTactic: "Authority Impersonation + Suspicious Cheap TLD (.xyz)",
		Choices: []ScenarioChoice{
			{
				ID:             "c2_v1",
				Text:           "Langsung klik link tersebut untuk membaca dokumennya.",
				SafetyRating:   "RISKY",
				Feedback:       "Hati-hati! Domain tersebut menggunakan ekstensi .xyz murah dan bukan domain korporat resmi (.co.id atau .com). Mengklik sembarangan berisiko terkena sniffing data atau malware drive-by download.",
				ScoreDelta:     -15,
				NextStepID:     "step_end_scammed",
				PsychologyNote: "Kurang teliti memeriksa ekstensi domain palsu.",
			},
			{
				ID:             "c2_v2",
				Text:           "Periksa domain: Domain .xyz murah bukan tanda perusahaan resmi. Saya tolak dan laporkan.",
				SafetyRating:   "SAFE",
				Feedback:       "Analisis tajam! Anda mengenali indikator teknis bahwa perusahaan resmi tidak menggunakan domain gratisan/murahan untuk dokumen legalitas.",
				ScoreDelta:     30,
				NextStepID:     "step_end_saved",
				PsychologyNote: "OSINT Domain Awareness & Tindakan Tegas.",
			},
		},
	}

	steps["step_end_blocked"] = DialogueStep{
		StepID:          "step_end_blocked",
		SenderName:      "Sistem Keamanan PANDU",
		SenderAvatar:    "https://api.dicebear.com/7.x/bottts/svg?seed=PanduShield",
		SenderRole:      "Evaluasi Hasil",
		Message:         "Sempurna! Anda berhasil memutus jebakan sejak awal. 80% korban terperangkap karena membalas ramah dan tergiur komisi tugas awal.",
		DeceptionTactic: "Selesai",
		Choices:         []ScenarioChoice{},
	}

	steps["step_end_saved"] = DialogueStep{
		StepID:          "step_end_saved",
		SenderName:      "Sistem Keamanan PANDU",
		SenderAvatar:    "https://api.dicebear.com/7.x/bottts/svg?seed=PanduShield",
		SenderRole:      "Evaluasi Hasil",
		Message:         "Luar biasa! Anda berhasil membongkar kedok penipuan menggunakan verifikasi domain dan logika kritis. Uang dan data Anda aman 100%.",
		DeceptionTactic: "Selesai",
		Choices:         []ScenarioChoice{},
	}

	steps["step_end_scammed"] = DialogueStep{
		StepID:          "step_end_scammed",
		SenderName:      "Sistem Keamanan PANDU",
		SenderAvatar:    "https://api.dicebear.com/7.x/bottts/svg?seed=PanduAlert",
		SenderRole:      "Peringatan Evaluasi",
		Message:         "Peringatan! Pada skenario nyata, Anda baru saja kehilangan Rp 500.000 atau data kredensial Anda tercuri. Ingat: pekerjaan asli memberi gaji, bukan meminta deposit uang!",
		DeceptionTactic: "Selesai",
		Choices:         []ScenarioChoice{},
	}

	return Scenario{
		ID:          "loker-like-video",
		Title:       "Lowongan Kerja Paruh Waktu Like Video YouTube",
		Category:    "Task Scam / Loker Bodong",
		Difficulty:  "Sedang",
		Platform:    "WhatsApp / Telegram",
		Description: "Uji insting Anda menghadapi penipu yang menawarkan penghasilan harian mudah lewat misi like video dan follow toko online.",
		InitialStep: "step_1",
		Steps:       steps,
	}
}

func getKurirMalwareApkScenario() Scenario {
	steps := make(map[string]DialogueStep)

	steps["step_1"] = DialogueStep{
		StepID:          "step_1",
		SenderName:      "Kurir Ekspedisi J&T Express",
		SenderAvatar:    "https://api.dicebear.com/7.x/personas/svg?seed=KurirJNT",
		SenderRole:      "Nomor Tak Dikenal (+62 821-4402-1922)",
		Message:         "Selamat siang kak, ini kurir J&T. Paket kakak dengan resi JNT8821 tertahan di gudang drop point karena alamat nomor rumah tidak jelas. Tolong cek foto paket dan resinya di aplikasi berikut ya kak biar segera kami kirim:",
		AttachmentType:  "FILE_APK",
		AttachmentData:  "Lihat_Foto_Paket_JNT.apk (Ukuran 4.8 MB)",
		DeceptionTactic: "Malware Trojan Sniffer via APK disguised as document",
		Choices: []ScenarioChoice{
			{
				ID:             "apk_c1_a",
				Text:           "Langsung unduh dan install file .apk tersebut agar paket segera sampai.",
				SafetyRating:   "FATAL",
				Feedback:       "SERANGAN MALWARE BERHASIL! File tersebut bukan foto atau dokumen resi, melainkan aplikasi penyadap SMS (SMS Forwarder Trojan). Begitu diinstal, penipu bisa membaca SMS OTP m-banking Anda dan menguras rekening tanpa Anda sadari.",
				ScoreDelta:     -50,
				NextStepID:     "step_end_malware",
				PsychologyNote: "Rasa cemas paket hilang dimanfaatkan penipu.",
			},
			{
				ID:             "apk_c1_b",
				Text:           "Kenapa file resi formatnya .APK? Tolong kirimkan dalam format foto biasa (JPG/PNG).",
				SafetyRating:   "SAFE",
				Feedback:       "Pilihan cerdas! Anda jeli melihat ekstensi file. Foto paket selalu berformat .JPG atau .PNG, tidak pernah berformat aplikasi (.APK).",
				ScoreDelta:     25,
				NextStepID:     "step_2_pushback",
				PsychologyNote: "Kejelian format berkas digital.",
			},
			{
				ID:             "apk_c1_c",
				Text:           "Saya tidak sedang memesan paket apapun. Saya cek langsung di aplikasi resmi J&T saja.",
				SafetyRating:   "SAFE",
				Feedback:       "Langkah emas! Selalu verifikasi resi langsung melalui aplikasi resmi ekspedisi atau website resmi, bukan dari file kiriman chat.",
				ScoreDelta:     30,
				NextStepID:     "step_end_safe",
				PsychologyNote: "Verifikasi saluran resmi independen.",
			},
		},
	}

	steps["step_2_pushback"] = DialogueStep{
		StepID:          "step_2_pushback",
		SenderName:      "Kurir Ekspedisi J&T Express",
		SenderAvatar:    "https://api.dicebear.com/7.x/personas/svg?seed=KurirJNT",
		SenderRole:      "Nomor Tak Dikenal (+62 821-4402-1922)",
		Message:         "Itu memang format sistem aplikasi kurir kami kak untuk tracking foto lokasi. Kalau kakak tidak buka dalam 1 jam, paket kakak kami anggap hilang dan hangus ya!",
		AttachmentType:  "NONE",
		DeceptionTactic: "Threatening Urgency & False Authority (Mengancam paket hangus agar korban terpaksa klik)",
		Choices: []ScenarioChoice{
			{
				ID:             "apk_c2_a",
				Text:           "Panik paket hangus, akhirnya menginstal file .APK tersebut.",
				SafetyRating:   "FATAL",
				Feedback:       "Anda menyerah pada intimidasi waktu penipu. Kurir resmi tidak berhak menghanguskan paket sepihak, dan tidak pernah mewajibkan install aplikasi asing.",
				ScoreDelta:     -40,
				NextStepID:     "step_end_malware",
				PsychologyNote: "Kalah terhadap ancaman kepanikan semu.",
			},
			{
				ID:             "apk_c2_b",
				Text:           "Silakan simpan di kantor cabang terdekat, saya akan ambil sendiri ke kantor resmi.",
				SafetyRating:   "SAFE",
				Feedback:       "Skakmat! Penipu tidak akan berani menyuruh Anda datang ke kantor fisik asli. Anda 100% selamat dari jeratan malware APK.",
				ScoreDelta:     30,
				NextStepID:     "step_end_safe",
				PsychologyNote: "Menghadapi intimidasi dengan solusi fisik yang aman.",
			},
		},
	}

	steps["step_end_malware"] = DialogueStep{
		StepID:          "step_end_malware",
		SenderName:      "Sistem Keamanan PANDU",
		SenderAvatar:    "https://api.dicebear.com/7.x/bottts/svg?seed=PanduAlert",
		SenderRole:      "Evaluasi Bahaya",
		Message:         "Peringatan Fatal! File .APK dari chat adalah senjata utama pencurian saldo bank di Indonesia. Ingat: Foto paket TIDAK PERNAH memiliki akhiran .APK!",
		DeceptionTactic: "Selesai",
		Choices:         []ScenarioChoice{},
	}

	steps["step_end_safe"] = DialogueStep{
		StepID:          "step_end_safe",
		SenderName:      "Sistem Keamanan PANDU",
		SenderAvatar:    "https://api.dicebear.com/7.x/bottts/svg?seed=PanduShield",
		SenderRole:      "Evaluasi Hasil",
		Message:         "Hebat! Anda berhasil melindungi smartphone Anda dari infeksi sniffer OTP. Rekening Anda tetap aman terlindungi.",
		DeceptionTactic: "Selesai",
		Choices:         []ScenarioChoice{},
	}

	return Scenario{
		ID:          "kurir-paket-apk",
		Title:       "Modus Resi Paket Kurir / Surat Tilang File .APK",
		Category:    "Malware & Sniffer APK",
		Difficulty:  "Tantangan",
		Platform:    "WhatsApp",
		Description: "Pelajari cara mendeteksi jebakan file berbahaya .APK yang menyamar sebagai dokumen foto resi atau undangan pernikahan.",
		InitialStep: "step_1",
		Steps:       steps,
	}
}

func getTemanImpersonasiPinjolScenario() Scenario {
	steps := make(map[string]DialogueStep)

	steps["step_1"] = DialogueStep{
		StepID:          "step_1",
		SenderName:      "Dimas (Akun Baru)",
		SenderAvatar:    "https://api.dicebear.com/7.x/personas/svg?seed=DimasTeman",
		SenderRole:      "Kontak Baru (+62 813-8820-1190)",
		Message:         "Bro, ini gw Dimas. Nomor lama gw ilang kesita. Gw lagi di pom bensin luar kota mau balik kampus, kartu ATM gw ketelen di mesin. Boleh minta tolong banget transferin dulu 250rb buat isi bensin? Ntar malem nyampe kos langsung gw transfer balik bro, urgent banget ini.",
		AttachmentType:  "NONE",
		DeceptionTactic: "Friend Impersonation + Emergency Assistance Trap (Menyalahgunakan empati pertemanan)",
		Choices: []ScenarioChoice{
			{
				ID:             "imp_c1_a",
				Text:           "Waduh kasian bro. Minta nomor rekeningnya, langsung gw transfer sekarang.",
				SafetyRating:   "FATAL",
				Feedback:       "JEBAKAN EMPATI! Penipu sering memakai foto profil teman Anda yang diambil dari medsos lalu mengaku ganti nomor. Uang Anda langsung hilang ke rekening penampung penipu.",
				ScoreDelta:     -35,
				NextStepID:     "step_end_tricked",
				PsychologyNote: "Rasa sungkan & empati buta tanpa verifikasi.",
			},
			{
				ID:             "imp_c1_b",
				Text:           "Bentar Dim, gw telepon suara atau video call dulu ya biar pasti.",
				SafetyRating:   "SAFE",
				Feedback:       "Langkah penyelamat! Penipu suara atau penyamar chat teks tidak akan berani mengangkat panggilan video call langsung dari Anda.",
				ScoreDelta:     30,
				NextStepID:     "step_2_call_reject",
				PsychologyNote: "Verifikasi identitas biometrik / real-time.",
			},
		},
	}

	steps["step_2_call_reject"] = DialogueStep{
		StepID:          "step_2_call_reject",
		SenderName:      "Dimas (Akun Baru)",
		SenderAvatar:    "https://api.dicebear.com/7.x/personas/svg?seed=DimasTeman",
		SenderRole:      "Kontak Baru (+62 813-8820-1190)",
		Message:         "(Panggilan ditolak oleh Dimas)\nSinyal di pom bensin jelek banget bro ga bisa angkat telepon, putus-putus. Ayolah bro masa sama temen sendiri ga percaya, butuh banget ini buat jalan.",
		AttachmentType:  "NONE",
		DeceptionTactic: "Guilt Tripping (Membuat korban merasa bersalah karena tidak percaya)",
		Choices: []ScenarioChoice{
			{
				ID:             "imp_c2_a",
				Text:           "Tes pertanyaan rahasia: 'Siapa nama dosen pembimbing kita pas matkul Logika Matematika kemarin?'",
				SafetyRating:   "SAFE",
				Feedback:       "Pertahanan jenius! Mengajukan pertanyaan fakta masa lalu yang hanya diketahui oleh teman asli Anda akan langsung mematikan penipu.",
				ScoreDelta:     35,
				NextStepID:     "step_end_verified_win",
				PsychologyNote: "Knowledge-Based Authentication (KBA) personal.",
			},
			{
				ID:             "imp_c2_b",
				Text:           "Karena merasa ga enak dibilang ga percaya teman, akhirnya mentransfer uangnya.",
				SafetyRating:   "FATAL",
				Feedback:       "Anda termanipulasi rasa sungkan (Guilt Trip). Keamanan finansial tidak boleh dikalahkan oleh rasa tidak enakan.",
				ScoreDelta:     -30,
				NextStepID:     "step_end_tricked",
				PsychologyNote: "Manipulasi emosi rasa bersalah.",
			},
		},
	}

	steps["step_end_verified_win"] = DialogueStep{
		StepID:          "step_end_verified_win",
		SenderName:      "Sistem Keamanan PANDU",
		SenderAvatar:    "https://api.dicebear.com/7.x/bottts/svg?seed=PanduShield",
		SenderRole:      "Evaluasi Kemenangan",
		Message:         "Kemenangan Sempurna! Anda berhasil menangkis teknik manipulasi pertemanan paling umum di Indonesia. Penipu langsung bungkam saat diberi pertanyaan verifikasi rahasia.",
		DeceptionTactic: "Selesai",
		Choices:         []ScenarioChoice{},
	}

	steps["step_end_tricked"] = DialogueStep{
		StepID:          "step_end_tricked",
		SenderName:      "Sistem Keamanan PANDU",
		SenderAvatar:    "https://api.dicebear.com/7.x/bottts/svg?seed=PanduAlert",
		SenderRole:      "Evaluasi Kerugian",
		Message:         "Kerugian Finansial Terjadi. Jangan pernah mengirim uang ke nomor baru sebelum mendengar suara asli atau bertemu langsung dengan teman Anda!",
		DeceptionTactic: "Selesai",
		Choices:         []ScenarioChoice{},
	}

	return Scenario{
		ID:          "teman-pinjam-uang",
		Title:       "Akun Teman Mendadak Ganti Nomor Minta Uang Darurat",
		Category:    "Social Engineering & Impersonasi",
		Difficulty:  "Mudah",
		Platform:    "WhatsApp",
		Description: "Latih ketahanan psikologis Anda terhadap rasa sungkan dan empati saat ada teman yang mengaku tertimpa musibah mendadak.",
		InitialStep: "step_1",
		Steps:       steps,
	}
}
