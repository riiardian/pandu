package sandbox

import (
	"math/rand"
)

// ScenarioChoice represents an action option a user can take during the simulation.
type ScenarioChoice struct {
	ID             string `json:"id"`
	Text           string `json:"text"`            // The user's reply or action
	SafetyRating   string `json:"safety_rating"`   // "SAFE", "RISKY", "FATAL"
	Feedback       string `json:"feedback"`        // Tactical explanation of why this choice is good or bad
	ScoreDelta     int    `json:"score_delta"`     // Score awarded: 25 for safe, 15 for risky, 0 for fatal
	NextStepID     string `json:"next_step_id"`    // Pointer to next dialogue step, or "step_end"
	PsychologyNote string `json:"psychology_note"` // Psychological pressure addressed
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
	DeceptionTactic string           `json:"deception_tactic"`
	Choices         []ScenarioChoice `json:"choices"`
}

// Scenario represents a complete interactive training case.
type Scenario struct {
	ID          string                  `json:"id"`
	Title       string                  `json:"title"`
	Category    string                  `json:"category"`
	Difficulty  string                  `json:"difficulty"`
	Platform    string                  `json:"platform"`
	Description string                  `json:"description"`
	InitialStep string                  `json:"initial_step"`
	Steps       map[string]DialogueStep `json:"steps"`
}

// GetCatalog returns all available training scenarios.
func GetCatalog() []Scenario {
	return []Scenario{
		getKurirMalwareApkScenario(),
		getBankKenaikanTarifScenario(),
		getLokerTaskScamScenario(),
		getCSPalsuOTPScenario(),
		getTemanImpersonasiPinjolScenario(),
	}
}

// GetScenarioByID fetches a specific scenario by ID with randomized choice order.
func GetScenarioByID(id string) *Scenario {
	for _, s := range GetCatalog() {
		if s.ID == id {
			// Clone scenario steps and randomize choices order for each step
			clonedSteps := make(map[string]DialogueStep, len(s.Steps))
			for stepKey, step := range s.Steps {
				if len(step.Choices) > 1 {
					shuffledChoices := make([]ScenarioChoice, len(step.Choices))
					copy(shuffledChoices, step.Choices)
					rand.Shuffle(len(shuffledChoices), func(i, j int) {
						shuffledChoices[i], shuffledChoices[j] = shuffledChoices[j], shuffledChoices[i]
					})
					step.Choices = shuffledChoices
				}
				clonedSteps[stepKey] = step
			}
			scCopy := s
			scCopy.Steps = clonedSteps
			return &scCopy
		}
	}
	return nil
}

// 1. Modus Resi Paket Kurir / Surat Tilang File .APK
func getKurirMalwareApkScenario() Scenario {
	steps := make(map[string]DialogueStep)

	// Step 1: Inbound fake APK attachment
	steps["step_1"] = DialogueStep{
		StepID:          "step_1",
		SenderName:      "Kurir Ekspedisi J&T Express",
		SenderAvatar:    "https://api.dicebear.com/7.x/personas/svg?seed=KurirJNT",
		SenderRole:      "Nomor Tak Dikenal",
		Message:         "Selamat siang kak, ini kurir J&T. Paket kakak dengan resi JNT8821 tertahan di gudang drop point karena alamat nomor rumah tidak jelas. Tolong cek foto paket dan resinya di aplikasi berikut ya kak biar segera kami kirim:",
		AttachmentType:  "FILE_APK",
		AttachmentData:  "Lihat_Foto_Paket_JNT.apk",
		DeceptionTactic: "Malware Trojan Sniffer via APK disguised as document",
		Choices: []ScenarioChoice{
			{
				ID:             "apk_c1_safe",
				Text:           "Tolak file .APK. Foto paket selalu berformat gambar (JPG/PNG), bukan file aplikasi.",
				SafetyRating:   "SAFE",
				Feedback:       "Pilihan tepat! Anda sangat jeli melihat ekstensi file. Foto bukti paket tidak pernah berakhiran .APK.",
				ScoreDelta:     25,
				NextStepID:     "step_2",
				PsychologyNote: "Kejelian ekstensi berkas digital.",
			},
			{
				ID:             "apk_c1_risky",
				Text:           "Minta nomor resinya saja lewat teks chat, saya tidak mau install aplikasi apapun dari chat.",
				SafetyRating:   "RISKY",
				Feedback:       "Cukup waspada, namun meminta resi lewat chat masih membuka celah obrolan manipulasi penipu berikutnya.",
				ScoreDelta:     15,
				NextStepID:     "step_2",
				PsychologyNote: "Menolak instalasi tetapi masih merespons.",
			},
			{
				ID:             "apk_c1_fatal",
				Text:           "Langsung unduh dan pasang berkas .APK tersebut di smartphone agar paket segera diantar.",
				SafetyRating:   "FATAL",
				Feedback:       "Keputusan fatal! Berkas tersebut adalah Malware Sniffer pencuri SMS OTP perbankan. Jangan pernah install file .APK dari chat!",
				ScoreDelta:     0,
				NextStepID:     "step_2",
				PsychologyNote: "Rasa cemas paket hilang dimanfaatkan penipu.",
			},
		},
	}

	// Step 2: False Urgency & Cancellation Penalty
	steps["step_2"] = DialogueStep{
		StepID:          "step_2",
		SenderName:      "Kurir Ekspedisi J&T Express",
		SenderAvatar:    "https://api.dicebear.com/7.x/personas/svg?seed=KurirJNT",
		SenderRole:      "Nomor Tak Dikenal",
		Message:         "Itu format sistem tracking terbaru kami kak. Kalau dalam 30 menit kakak tidak buka aplikasinya, paket kakak otomatis kami anggap hangus dan kakak dikenakan denda retur barang!",
		AttachmentType:  "NONE",
		DeceptionTactic: "Threatening Urgency & False Penalty (Ancaman denda agar korban panik)",
		Choices: []ScenarioChoice{
			{
				ID:             "apk_c2_safe",
				Text:           "Silakan tahan di kantor cabang ekspedisi terdekat, saya akan ambil fisik sendiri ke kantor resmi.",
				SafetyRating:   "SAFE",
				Feedback:       "Skakmat! Penipu tidak akan berani menyuruh Anda datang ke kantor ekspedisi fisik resmi.",
				ScoreDelta:     25,
				NextStepID:     "step_3",
				PsychologyNote: "Menghadapi intimidasi dengan solusi fisik yang aman.",
			},
			{
				ID:             "apk_c2_risky",
				Text:           "Minta nomor kontak atasan atau supervisor gudang cabang Anda untuk klarifikasi.",
				SafetyRating:   "RISKY",
				Feedback:       "Kurang efektif, penipu profesional biasanya sudah menyiapkan nomor telepon palsu lain untuk bersekongkol.",
				ScoreDelta:     15,
				NextStepID:     "step_3",
				PsychologyNote: "Mencari otorisasi di lingkungan yang tidak terpercaya.",
			},
			{
				ID:             "apk_c2_fatal",
				Text:           "Panik paket hangus dan didenda, akhirnya menuruti instruksi membuka aplikasi tersebut.",
				SafetyRating:   "FATAL",
				Feedback:       "Terjebak intimidasi semu! Kurir resmi tidak berhak mendenda atau menghanguskan paket sepihak.",
				ScoreDelta:     0,
				NextStepID:     "step_3",
				PsychologyNote: "Kalah terhadap ancaman denda fiktif.",
			},
		},
	}

	// Step 3: Alternate Exploit: OTP Interception
	steps["step_3"] = DialogueStep{
		StepID:          "step_3",
		SenderName:      "Kurir Ekspedisi J&T Express",
		SenderAvatar:    "https://api.dicebear.com/7.x/personas/svg?seed=KurirJNT",
		SenderRole:      "Nomor Tak Dikenal",
		Message:         "Baik kak, kalau keberatan install aplikasi, sistem kami barusan mengirimkan 6 digit kode pembatalan retur ke SMS kakak. Tolong sebutkan 6 digit kodenya sekarang ya kak biar saya batalkan dendanya!",
		AttachmentType:  "NONE",
		DeceptionTactic: "OTP Phishing Pivot (Beralih meminta kode OTP SMS langsung)",
		Choices: []ScenarioChoice{
			{
				ID:             "apk_c3_safe",
				Text:           "Kode SMS adalah OTP rahasia! Kurir resmi tidak punya hak meminta kode verifikasi SMS pelanggan.",
				SafetyRating:   "SAFE",
				Feedback:       "Pertahanan mutlak! OTP bersifat rahasia dan tidak boleh dibagikan kepada siapapun tanpa pengecualian.",
				ScoreDelta:     25,
				NextStepID:     "step_4",
				PsychologyNote: "Disiplin proteksi kredensial Zero-Trust.",
			},
			{
				ID:             "apk_c3_risky",
				Text:           "Kenapa ada SMS OTP masuk dari perbankan/e-wallet saya? Ini mencurigakan, saya tidak akan sebutkan.",
				SafetyRating:   "RISKY",
				Feedback:       "Analisis tepat bahwa SMS tersebut mencurigakan, namun sebaiknya langsung hentikan percakapan seketika.",
				ScoreDelta:     15,
				NextStepID:     "step_4",
				PsychologyNote: "Kewaspadaan anomali SMS perbankan.",
			},
			{
				ID:             "apk_c3_fatal",
				Text:           "Menyebutkan 6 digit kode SMS OTP kepada kurir agar masalah verifikasi paket cepat selesai.",
				SafetyRating:   "FATAL",
				Feedback:       "Pencurian OTP berhasil! Kode tersebut adalah akses otorisasi akun Anda yang disalahgunakan pelaku.",
				ScoreDelta:     0,
				NextStepID:     "step_4",
				PsychologyNote: "Menyerahkan OTP karena percaya janji pembatalan.",
			},
		},
	}

	// Step 4: Final Fee Extortion
	steps["step_4"] = DialogueStep{
		StepID:          "step_4",
		SenderName:      "Kurir Ekspedisi J&T Express",
		SenderAvatar:    "https://api.dicebear.com/7.x/personas/svg?seed=KurirJNT",
		SenderRole:      "Nomor Tak Dikenal",
		Message:         "Kakak jangan persulit kurir ya. Sekarang transfer biaya admin penahanan paket Rp 15.000 ke rekening bendahara kami agar paket tidak diserahkan ke pihak kepolisian sebagai barang terlantar.",
		AttachmentType:  "NONE",
		DeceptionTactic: "Fee Extortion + Legal Coercion (Pemerasan uang admin dengan ancaman polisi)",
		Choices: []ScenarioChoice{
			{
				ID:             "apk_c4_safe",
				Text:           "Kurir resmi tidak memungut transfer rekening pribadi. Percakapan ini saya laporkan ke polisi dan nomor Anda saya blokir!",
				SafetyRating:   "SAFE",
				Feedback:       "Tindakan sempurna! Menutup seluruh jalur komunikasi dan melaporkan indikasi pemerasan adalah langkah paling bijak.",
				ScoreDelta:     25,
				NextStepID:     "step_end",
				PsychologyNote: "Menegakkan batas tegas dan pelaporan ancaman.",
			},
			{
				ID:             "apk_c4_risky",
				Text:           "Saya tolak transfer. Saya akan telusuri nomor rekening ini ke portal PANDU dan cek laporan penipuan.",
				SafetyRating:   "RISKY",
				Feedback:       "Bagus memeriksa rekening ke PANDU, namun berdebat dengan pelaku pemerasan tidak diperlukan.",
				ScoreDelta:     15,
				NextStepID:     "step_end",
				PsychologyNote: "Verifikasi database intelijen pihak ketiga.",
			},
			{
				ID:             "apk_c4_fatal",
				Text:           "Mentransfer uang 15 ribu ke rekening bendahara tersebut agar tidak berurusan dengan polisi.",
				SafetyRating:   "FATAL",
				Feedback:       "Tertipu pemerasan! Uang Anda masuk ke rekening penampung penipu dan data rekening Anda dicatat sebagai korban yang mudah ditakut-takuti.",
				ScoreDelta:     0,
				NextStepID:     "step_end",
				PsychologyNote: "Takut ancaman hukum fiktif.",
			},
		},
	}

	// Step End: Evaluation
	steps["step_end"] = DialogueStep{
		StepID:          "step_end",
		SenderName:      "Sistem Keamanan PANDU",
		SenderAvatar:    "https://api.dicebear.com/7.x/bottts/svg?seed=PanduShield",
		SenderRole:      "Evaluasi Hasil",
		Message:         "Simulasi selesai! Anda telah menyelesaikan 4 tahapan evaluasi serangan rekayasa sosial kurir APK.",
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

// 2. Surat Edaran Kenaikan Tarif Bank Rp 150.000
func getBankKenaikanTarifScenario() Scenario {
	steps := make(map[string]DialogueStep)

	// Step 1: Phishing Announcement
	steps["step_1"] = DialogueStep{
		StepID:          "step_1",
		SenderName:      "Customer Service Bank BCA",
		SenderAvatar:    "https://api.dicebear.com/7.x/bottts/svg?seed=BankCareBCA",
		SenderRole:      "Akun Bisnis Tiruan",
		Message:         "PENGUMUMAN RESMI PERBANKAN: Mulai malam ini pukul 00.00 WIB, tarif transaksi antarbank bulanan rekening Anda disesuaikan menjadi Rp 150.000/bulan (auto-debet). Jika TIDAK SETUJU dan ingin tetap tarif normal Rp 6.500, Anda WAJIB konfirmasi pembatalan dalam 30 menit di link resmi: https://bca-tarif-pembatalan.site/konfirmasi",
		AttachmentType:  "LINK",
		AttachmentData:  "https://bca-tarif-pembatalan.site/konfirmasi",
		DeceptionTactic: "Fear of Financial Loss + Phishing Link (Ancaman auto-debet biaya bulanan mahal)",
		Choices: []ScenarioChoice{
			{
				ID:             "bank_c1_safe",
				Text:           "Periksa domain: Link berakhiran domain .site palsu, bukan website resmi bank (bca.co.id). Ini jelas phishing.",
				SafetyRating:   "SAFE",
				Feedback:       "Analisis forensik luar biasa! Anda sangat jeli mengamati TLD domain (.site). Bank resmi selalu menggunakan domain resmi .co.id.",
				ScoreDelta:     25,
				NextStepID:     "step_2",
				PsychologyNote: "OSINT Domain Forensics & Imunitas Phishing.",
			},
			{
				ID:             "bank_c1_risky",
				Text:           "Buka link untuk membaca surat pengumumannya, tapi berhati-hati tidak memasukkan data apapun.",
				SafetyRating:   "RISKY",
				Feedback:       "Membuka link phishing berisiko mengunduh script pelacak atau drive-by download. Hindari mengklik URL tidak resmi.",
				ScoreDelta:     15,
				NextStepID:     "step_2",
				PsychologyNote: "Rasa penasaran mengalahkan isolasi bahaya.",
			},
			{
				ID:             "bank_c1_fatal",
				Text:           "Langsung klik link pembatalan dan masukkan 16 digit nomor kartu ATM serta PIN agar saldo tidak terpotong.",
				SafetyRating:   "FATAL",
				Feedback:       "Jebakan phishing fatal! Bank tidak pernah meminta pembatalan tarif via link eksternal. Kredensial kartu Anda langsung dicuri.",
				ScoreDelta:     0,
				NextStepID:     "step_2",
				PsychologyNote: "Kepanikan finansial mengalahkan kewaspadaan.",
			},
		},
	}

	// Step 2: Deadline Escalation
	steps["step_2"] = DialogueStep{
		StepID:          "step_2",
		SenderName:      "Customer Service Bank BCA",
		SenderAvatar:    "https://api.dicebear.com/7.x/bottts/svg?seed=BankCareBCA",
		SenderRole:      "Akun Bisnis Tiruan",
		Message:         "Bapak/Ibu sisa waktu tinggal 10 menit! Jika pembatalan tidak selesai, sistem server otomatis memotong saldo tabungan Anda setiap tanggal 1 sebesar Rp 150.000 tanpa bisa dikembalikan!",
		AttachmentType:  "NONE",
		DeceptionTactic: "Artificial Time Pressure (Mendesak korban agar tidak sempat berpikir jernih)",
		Choices: []ScenarioChoice{
			{
				ID:             "bank_c2_safe",
				Text:           "Bank tidak pernah mengubah tarif sepihak via chat. Saya akan hubungi Halo BCA resmi di 1500888.",
				SafetyRating:   "SAFE",
				Feedback:       "Langkah standar emas perbankan! Mengonfirmasi ke nomor resmi Halo BCA memutus seluruh upaya manipulasi.",
				ScoreDelta:     25,
				NextStepID:     "step_3",
				PsychologyNote: "Verifikasi saluran resmi otoritatif.",
			},
			{
				ID:             "bank_c2_risky",
				Text:           "Minta surat keputusan direksi bertanda tangan resmi dan berstempel OJK sebelum saya percaya.",
				SafetyRating:   "RISKY",
				Feedback:       "Penipu dapat dengan mudah membuat surat palsu berpindai logo OJK dalam hitungan menit.",
				ScoreDelta:     15,
				NextStepID:     "step_3",
				PsychologyNote: "Menguji dokumen visual yang mudah direkayasa.",
			},
			{
				ID:             "bank_c2_fatal",
				Text:           "Karena takut saldo dipotong 150 ribu tiap bulan, akhirnya mengisi formulir data di link tersebut.",
				SafetyRating:   "FATAL",
				Feedback:       "Kalah terhadap intimidasi waktu! Seluruh data rekening yang Anda masukkan terekam di server penjahat siber.",
				ScoreDelta:     0,
				NextStepID:     "step_3",
				PsychologyNote: "Rasa cemas kehilangan uang memicu kecerobohan.",
			},
		},
	}

	// Step 3: OTP Token Request
	steps["step_3"] = DialogueStep{
		StepID:          "step_3",
		SenderName:      "Customer Service Bank BCA",
		SenderAvatar:    "https://api.dicebear.com/7.x/bottts/svg?seed=BankCareBCA",
		SenderRole:      "Akun Bisnis Tiruan",
		Message:         "Data pengajuan Anda sedang diverifikasi. Untuk otorisasi bebas biaya administrasi, sistem baru saja mengirimkan 6 digit kode token ke SMS Anda. Mohon ketikkan 6 digit kodenya di chat ini sekarang!",
		AttachmentType:  "NONE",
		DeceptionTactic: "SMS Token Harvesting (Meminta kode OTP transaksi untuk membobol m-banking)",
		Choices: []ScenarioChoice{
			{
				ID:             "bank_c3_safe",
				Text:           "Kode SMS tersebut adalah kode otorisasi transaksi finansial (OTP/3DS)! Petugas bank resmi tidak pernah meminta kode ini.",
				SafetyRating:   "SAFE",
				Feedback:       "Kecerdasan digital tingkat tinggi! Kode OTP adalah kunci brankas digital Anda yang tidak boleh dibagikan ke siapapun.",
				ScoreDelta:     25,
				NextStepID:     "step_4",
				PsychologyNote: "Kesadaran mutlak fungsi kode OTP perbankan.",
			},
			{
				ID:             "bank_c3_b",
				Text:           "Di SMS ada tulisan 'JANGAN BERIKAN KE SIAPAPUN'. Kenapa Anda sebagai petugas minta kode ini?",
				SafetyRating:   "RISKY",
				Feedback:       "Bagus mengamati peringatan SMS, namun mendebat penipu hanya memberi mereka waktu menyusun dalih teknis palsu.",
				ScoreDelta:     15,
				NextStepID:     "step_4",
				PsychologyNote: "Membaca peringatan sistem namun masih menanti jawaban pelaku.",
			},
			{
				ID:             "bank_c3_c",
				Text:           "Mengetikkan 6 digit kode SMS OTP ke dalam chat agar pembatalan tarif segera disetujui.",
				SafetyRating:   "FATAL",
				Feedback:       "Pembobolan berhasil! Kode OTP yang Anda kirimkan dipakai penipu untuk menguras saldo tabungan seketika.",
				ScoreDelta:     0,
				NextStepID:     "step_4",
				PsychologyNote: "Menyerahkan otorisasi transaksi pada penipu.",
			},
		},
	}

	// Step 4: Legal Freeze Threat
	steps["step_4"] = DialogueStep{
		StepID:          "step_4",
		SenderName:      "Customer Service Bank BCA",
		SenderAvatar:    "https://api.dicebear.com/7.x/bottts/svg?seed=BankCareBCA",
		SenderRole:      "Akun Bisnis Tiruan",
		Message:         "Nasabah yang menolak verifikasi kode dalam 5 menit akan kami laporkan ke bagian kepatuhan hukum dan rekening Anda akan dibekukan sementara selama 3 bulan!",
		AttachmentType:  "NONE",
		DeceptionTactic: "Legal Coercion Threat (Ancaman pemblokiran rekening agar korban tunduk)",
		Choices: []ScenarioChoice{
			{
				ID:             "bank_c4_safe",
				Text:           "Ancaman pembekuan via WhatsApp adalah ciri penipuan. Nomor dan link phishing ini resmi saya laporkan ke PANDU dan Halo BCA!",
				SafetyRating:   "SAFE",
				Feedback:       "Respon terbaik! Bank resmi memproses pembekuan lewat prosedur kantor fisik dan surat resmi, bukan ancaman chat.",
				ScoreDelta:     25,
				NextStepID:     "step_end",
				PsychologyNote: "Ketahanan terhadap manipulasi ancaman hukum.",
			},
			{
				ID:             "bank_c4_risky",
				Text:           "Besok pagi saya akan datang langsung ke kantor cabang bank terdekat untuk memastikan status rekening saya.",
				SafetyRating:   "RISKY",
				Feedback:       "Langkah fisik yang baik, namun pastikan nomor penipu langsung diblokir agar Anda tidak terus diteror.",
				ScoreDelta:     15,
				NextStepID:     "step_end",
				PsychologyNote: "Memilih penyelesaian tatap muka.",
			},
			{
				ID:             "bank_c4_fatal",
				Text:           "Panik rekening dibekukan 3 bulan, akhirnya menyerahkan kode SMS dan kredensial akun.",
				SafetyRating:   "FATAL",
				Feedback:       "Kalah di detik terakhir! Rasa takut kehilangan akses rekening membuat Anda menyerahkan kunci keamanan perbankan Anda.",
				ScoreDelta:     0,
				NextStepID:     "step_end",
				PsychologyNote: "Tunduk pada ancaman pembekuan sepihak.",
			},
		},
	}

	// Step End
	steps["step_end"] = DialogueStep{
		StepID:          "step_end",
		SenderName:      "Sistem Keamanan PANDU",
		SenderAvatar:    "https://api.dicebear.com/7.x/bottts/svg?seed=PanduShield",
		SenderRole:      "Evaluasi Hasil",
		Message:         "Simulasi selesai! Anda telah menyelesaikan 4 tahapan evaluasi serangan rekayasa sosial phishing perbankan.",
		DeceptionTactic: "Selesai",
		Choices:         []ScenarioChoice{},
	}

	return Scenario{
		ID:          "bank-kenaikan-tarif",
		Title:       "Surat Edaran Kenaikan Tarif Bank Rp 150.000",
		Category:    "Phishing & Impersonasi Bank",
		Difficulty:  "Tantangan",
		Platform:    "WhatsApp / Instagram",
		Description: "Hadapi modus surat resmi pengumuman kenaikan biaya admin bank yang menekan korban mengisi form pembatalan di link palsu.",
		InitialStep: "step_1",
		Steps:       steps,
	}
}

// 3. Lowongan Kerja Paruh Waktu Like Video YouTube
func getLokerTaskScamScenario() Scenario {
	steps := make(map[string]DialogueStep)

	// Step 1: Free Baiting
	steps["step_1"] = DialogueStep{
		StepID:          "step_1",
		SenderName:      "Cindy - HR Talent Media Promosi",
		SenderAvatar:    "https://api.dicebear.com/7.x/personas/svg?seed=Cindy",
		SenderRole:      "Nomor Asing",
		Message:         "Halo kak! Maaf mengganggu waktunya sebentar. Kami dari Agensi Mitra Kreatif sedang membuka lowongan kerja sampingan online untuk mahasiswa. Tugasnya gampang banget, cukup Like video YouTube dan Follow akun toko. Komisi 30.000 - 50.000 per tugas langsung ditransfer ke e-wallet kakak hari ini. Apakah kakak tertarik untuk mencoba tugas pertama gratis?",
		AttachmentType:  "NONE",
		DeceptionTactic: "Free Baiting & Low Effort Trap (Memancing dengan imbalan mudah tanpa modal awal)",
		Choices: []ScenarioChoice{
			{
				ID:             "loker_c1_safe",
				Text:           "Perusahaan resmi tidak merekrut via chat nomor pribadi dengan iming-iming instan. Saya tolak tawaran ini.",
				SafetyRating:   "SAFE",
				Feedback:       "Langkah tepat! Merekrut via chat nomor asing dengan tugas mudah adalah indikator mutlak sindikat Task Scam.",
				ScoreDelta:     25,
				NextStepID:     "step_2",
				PsychologyNote: "Skeptisisme terhadap tawaran kerja instan.",
			},
			{
				ID:             "loker_c1_risky",
				Text:           "Bisa jelaskan nama PT agensi dan alamat kantor resminya dulu sebelum saya memutuskan?",
				SafetyRating:   "RISKY",
				Feedback:       "Bagus meminta identitas perusahaan, namun sindikat penipuan biasanya sudah menyiapkan nama PT fiktif tiruan.",
				ScoreDelta:     15,
				NextStepID:     "step_2",
				PsychologyNote: "Meminta verifikasi legalitas.",
			},
			{
				ID:             "loker_c1_fatal",
				Text:           "Tertarik karena kerjanya mudah dan tanpa modal, langsung setuju mencoba tugas pertama gratis.",
				SafetyRating:   "FATAL",
				Feedback:       "Umpan termakan! Penipu sengaja memberi uang gratis di awal agar Anda percaya untuk menyetor modal besar nantinya.",
				ScoreDelta:     0,
				NextStepID:     "step_2",
				PsychologyNote: "Tergiur penghasilan mudah (Greed Exploit).",
			},
		},
	}

	// Step 2: Paid Bait -> VIP Deposit Trap
	steps["step_2"] = DialogueStep{
		StepID:          "step_2",
		SenderName:      "Cindy - HR Talent Media Promosi",
		SenderAvatar:    "https://api.dicebear.com/7.x/personas/svg?seed=Cindy",
		SenderRole:      "Nomor Asing",
		Message:         "Hebat kak! Komisi tugas pertama Rp 30.000 sudah kami transfer ya. Nah sekarang ada Tugas VIP Eksklusif! Kalau kakak deposit modal Rp 500.000 ke rekening bendahara kami, dalam 15 menit saldo kembali jadi Rp 750.000 (+ untung 50%). Sisa 1 slot lagi dan berlaku 10 menit!",
		AttachmentType:  "IMAGE",
		AttachmentData:  "Bukti Transfer Palsu & Tugas VIP",
		DeceptionTactic: "Artificial Urgency + Sunk Cost Fallacy (Desakan waktu palsu & jebakan setor modal)",
		Choices: []ScenarioChoice{
			{
				ID:             "loker_c2_safe",
				Text:           "Pekerjaan resmi tidak pernah meminta deposit uang dari pelamar. Ini skema penipuan Task Scam / Ponzi!",
				SafetyRating:   "SAFE",
				Feedback:       "Argumen telak! Prinsip nomor satu dunia kerja: Anda bekerja untuk dibayar, bukan membayar untuk bekerja.",
				ScoreDelta:     25,
				NextStepID:     "step_3",
				PsychologyNote: "Logika kritis mematahkan skenario manipulasi.",
			},
			{
				ID:             "loker_c2_risky",
				Text:           "Kenapa ada sistem setor modal dulu? Kalau dipotong dari komisi keuntungan saja bisa tidak?",
				SafetyRating:   "RISKY",
				Feedback:       "Anda mencurigai setoran modal, namun tetap menunjukkan minat yang dimanfaatkan penipu untuk terus membujuk.",
				ScoreDelta:     15,
				NextStepID:     "step_3",
				PsychologyNote: "Tawar-menawar dalam skenario penipuan.",
			},
			{
				ID:             "loker_c2_fatal",
				Text:           "Karena tugas pertama terbukti cair, saya langsung transfer deposit 500 ribu ke rekening bendahara.",
				SafetyRating:   "FATAL",
				Feedback:       "Titik kerugian finansial pertama! Uang 500 ribu Anda masuk ke kantong sindikat dan tidak akan pernah kembali.",
				ScoreDelta:     0,
				NextStepID:     "step_3",
				PsychologyNote: "Terperangkap efek umpan komisi awal.",
			},
		},
	}

	// Step 3: Sunk Cost Trap (Dana Tertahan)
	steps["step_3"] = DialogueStep{
		StepID:          "step_3",
		SenderName:      "Cindy - HR Talent Media Promosi",
		SenderAvatar:    "https://api.dicebear.com/7.x/personas/svg?seed=Cindy",
		SenderRole:      "Nomor Asing",
		Message:         "Waduh kak, sistem mendeteksi ada kesalahan input kode penugasan dari kakak! Saldo 750 ribu kakak tertahan di sistem. Kakak WAJIB transfer 'Tugas Pemulihan' Rp 1.500.000 sekarang agar seluruh dana 2.250.000 bisa ditarik utuh!",
		AttachmentType:  "NONE",
		DeceptionTactic: "Sunk Cost Escalation (Memeras korban lebih dalam dengan dalih dana tertahan)",
		Choices: []ScenarioChoice{
			{
				ID:             "loker_c3_safe",
				Text:           "Ini taktik klasik Sunk Cost Trap untuk memeras korban lebih dalam. Saya stop sekarang dan tidak akan transfer lagi!",
				SafetyRating:   "SAFE",
				Feedback:       "Kecerdasan emosional tinggi! Berani memutus kerugian (Cut Loss) adalah satu-satunya cara selamat dari sindikat Task Scam.",
				ScoreDelta:     25,
				NextStepID:     "step_4",
				PsychologyNote: "Menghentikan jebakan Sunk Cost Fallacy.",
			},
			{
				ID:             "loker_c3_risky",
				Text:           "Kembalikan dulu modal 500 ribu saya, saya tidak mau ikut tugas pemulihan 1,5 juta.",
				SafetyRating:   "RISKY",
				Feedback:       "Meminta uang kembali pada sindikat kriminal adalah hal sia-sia dan membuang energi berharga.",
				ScoreDelta:     15,
				NextStepID:     "step_4",
				PsychologyNote: "Berharap itikad baik dari pelaku kejahatan.",
			},
			{
				ID:             "loker_c3_fatal",
				Text:           "Takut modal 500 ribu hangus, akhirnya pinjam uang teman dan transfer 1,5 juta untuk tugas pemulihan.",
				SafetyRating:   "FATAL",
				Feedback:       "Kerugian berlipat ganda! Setelah 1,5 juta, penipu akan meminta 5 juta, 10 juta, hingga seluruh uang Anda habis terkuras.",
				ScoreDelta:     0,
				NextStepID:     "step_4",
				PsychologyNote: "Terjerat lingkaran setan Sunk Cost.",
			},
		},
	}

	// Step 4: OJK Blacklist Threat
	steps["step_4"] = DialogueStep{
		StepID:          "step_4",
		SenderName:      "Cindy - HR Talent Media Promosi",
		SenderAvatar:    "https://api.dicebear.com/7.x/personas/svg?seed=Cindy",
		SenderRole:      "Nomor Asing",
		Message:         "Kak kalau tidak transfer tugas pemulihan sekarang, data KTP dan nomor rekening kakak akan kami laporkan ke OJK dan di-blacklist dari seluruh perbankan nasional!",
		AttachmentType:  "NONE",
		DeceptionTactic: "Authority Impersonation + Blacklist Coercion (Intimidasi pemblokiran perbankan)",
		Choices: []ScenarioChoice{
			{
				ID:             "loker_c4_safe",
				Text:           "Penipu sindikat tidak memiliki kewenangan OJK. Seluruh bukti chat dan nomor rekening ini saya laporkan ke Patroli Siber Polri!",
				SafetyRating:   "SAFE",
				Feedback:       "Langkah paling tepat! Membuka kedok sindikat dan melaporkan ke instrumen hukum adalah penutup yang sempurna.",
				ScoreDelta:     25,
				NextStepID:     "step_end",
				PsychologyNote: "Tidak mempan ditakut-takuti otoritas palsu.",
			},
			{
				ID:             "loker_c4_risky",
				Text:           "Saya akan konsultasi ke pihak berwajib dan keluarga sebelum mengambil tindakan apapun.",
				SafetyRating:   "RISKY",
				Feedback:       "Mencari second opinion bagus, tapi pastikan kontak penipu segera diblokir permanen.",
				ScoreDelta:     15,
				NextStepID:     "step_end",
				PsychologyNote: "Mencari perlindungan sosial.",
			},
			{
				ID:             "loker_c4_fatal",
				Text:           "Panik diancam blacklist OJK, akhirnya mentransfer tabungan terakhir demi akun bersih.",
				SafetyRating:   "FATAL",
				Feedback:       "Tertipu ancaman kosong! OJK adalah lembaga pengawas keuangan resmi, bukan penagih tugas freelance abal-abal.",
				ScoreDelta:     0,
				NextStepID:     "step_end",
				PsychologyNote: "Tunduk pada ancaman nama baik fiktif.",
			},
		},
	}

	// Step End
	steps["step_end"] = DialogueStep{
		StepID:          "step_end",
		SenderName:      "Sistem Keamanan PANDU",
		SenderAvatar:    "https://api.dicebear.com/7.x/bottts/svg?seed=PanduShield",
		SenderRole:      "Evaluasi Hasil",
		Message:         "Simulasi selesai! Anda telah menyelesaikan 4 tahapan evaluasi serangan rekayasa sosial lowongan kerja bodong (Task Scam).",
		DeceptionTactic: "Selesai",
		Choices:         []ScenarioChoice{},
	}

	return Scenario{
		ID:          "loker-like-video",
		Title:       "Lowongan Kerja Paruh Waktu Like Video YouTube",
		Category:    "Task Scam & Sunk Cost Trap",
		Difficulty:  "Sedang",
		Platform:    "WhatsApp / Telegram",
		Description: "Uji insting Anda terhadap tawaran pekerjaan paruh waktu mudah berujung pemerasan deposit modal berantai.",
		InitialStep: "step_1",
		Steps:       steps,
	}
}

// 4. Call Center Gadungan Pembatalan Transaksi E-Wallet
func getCSPalsuOTPScenario() Scenario {
	steps := make(map[string]DialogueStep)

	// Step 1: Fake Transaction Alarm
	steps["step_1"] = DialogueStep{
		StepID:          "step_1",
		SenderName:      "Helpdesk Pusat Layanan E-Wallet",
		SenderAvatar:    "https://api.dicebear.com/7.x/personas/svg?seed=OfficerHelpdesk",
		SenderRole:      "Panggilan Call Center",
		Message:         "Halo selamat siang bapak/ibu. Sistem monitoring fraud kami mendeteksi transaksi penarikan saldo mencurigakan Rp 2.500.000 dari akun e-wallet Anda dari luar kota. Untuk membatalkan transaksi tersebut, sistem baru saja mengirimkan 6 digit kode pembatalan darurat ke SMS Anda. Mohon sebutkan kodenya sekarang!",
		AttachmentType:  "NONE",
		DeceptionTactic: "Vishing + False Hero Relief (Menyaru jadi penyelamat dana untuk memancing OTP)",
		Choices: []ScenarioChoice{
			{
				ID:             "cs_c1_safe",
				Text:           "Pihak aplikasi resmi TIDAK PERNAH meminta kode OTP via telepon atau chat untuk alasan apapun!",
				SafetyRating:   "SAFE",
				Feedback:       "Refleks keamanan tingkat tinggi! Anda mengingat hukum mutlak keamanan digital: OTP dan PIN bersifat rahasia.",
				ScoreDelta:     25,
				NextStepID:     "step_2",
				PsychologyNote: "Disiplin proteksi kredensial Zero-Trust.",
			},
			{
				ID:             "cs_c1_risky",
				Text:           "Tunggu dulu, saya cek sendiri saldo dan riwayat mutasi di aplikasi dompet digital saya.",
				SafetyRating:   "RISKY",
				Feedback:       "Bagus memeriksa aplikasi mandiri, namun jangan biarkan penelpon tetap tersambung di telepon.",
				ScoreDelta:     15,
				NextStepID:     "step_2",
				PsychologyNote: "Audit mandiri tanpa memutus panggilan.",
			},
			{
				ID:             "cs_c1_fatal",
				Text:           "Panik saldo 2,5 juta hilang, langsung membacakan 6 digit kode SMS tersebut ke petugas.",
				SafetyRating:   "FATAL",
				Feedback:       "Akun Anda dibobol! 'Kode pembatalan' yang diminta sebenarnya adalah kode OTP login akun Anda.",
				ScoreDelta:     0,
				NextStepID:     "step_2",
				PsychologyNote: "Termakan manipulasi figur penyelamat palsu.",
			},
		},
	}

	// Step 2: 60-Second Pressure
	steps["step_2"] = DialogueStep{
		StepID:          "step_2",
		SenderName:      "Helpdesk Pusat Layanan E-Wallet",
		SenderAvatar:    "https://api.dicebear.com/7.x/personas/svg?seed=OfficerHelpdesk",
		SenderRole:      "Panggilan Call Center",
		Message:         "Bapak/Ibu jika kode tidak diverifikasi dalam 60 detik, sistem otomatis mencairkan dana ke rekening pencuri dan akun Anda akan diblokir permanen karena dianggap lalai!",
		AttachmentType:  "NONE",
		DeceptionTactic: "Countdown Panic Induction (Menciptakan kepanikan batas waktu 60 detik)",
		Choices: []ScenarioChoice{
			{
				ID:             "cs_c2_safe",
				Text:           "Saya tutup panggilan ini dan verifikasi langsung ke call center resmi aplikasi di website resminya.",
				SafetyRating:   "SAFE",
				Feedback:       "Tindakan paling tepat! Menutup telepon sepihak mematahkan seluruh skenario rekayasa sosial pelaku.",
				ScoreDelta:     25,
				NextStepID:     "step_3",
				PsychologyNote: "Pemutusan kontak manipulatif & verifikasi mandiri.",
			},
			{
				ID:             "cs_c2_risky",
				Text:           "Sebutkan nomor ID pegawai Anda dan kantor operasional cabang mana yang sedang menangani tiket saya?",
				SafetyRating:   "RISKY",
				Feedback:       "Penipu dapat mengarang nomor ID pegawai palsu dengan lancar untuk meyakinkan Anda.",
				ScoreDelta:     15,
				NextStepID:     "step_3",
				PsychologyNote: "Mencoba menguji identitas penelpon.",
			},
			{
				ID:             "cs_c2_fatal",
				Text:           "Karena panik hitungan 60 detik berjalan, akhirnya membacakan kode OTP SMS ke penelpon.",
				SafetyRating:   "FATAL",
				Feedback:       "Kalah oleh kepanikan waktu semu! Transaksi 2,5 juta fiktif tersebut kini berubah menjadi kerugian saldo riil.",
				ScoreDelta:     0,
				NextStepID:     "step_3",
				PsychologyNote: "Kalah terhadap desakan waktu palsu.",
			},
		},
	}

	// Step 3: Fake ID Card + PIN Request
	steps["step_3"] = DialogueStep{
		StepID:          "step_3",
		SenderName:      "Helpdesk Pusat Layanan E-Wallet",
		SenderAvatar:    "https://api.dicebear.com/7.x/personas/svg?seed=OfficerHelpdesk",
		SenderRole:      "Panggilan Call Center",
		Message:         "Kami kirim foto kartu identitas petugas resmi di chat ini. Sekarang sistem membutuhkan 6 digit PIN akun Anda untuk membuka proteksi enkripsi saldo Anda.",
		AttachmentType:  "IMAGE",
		AttachmentData:  "Kartu Pegawai Divisi Keamanan Siber",
		DeceptionTactic: "Visual Authority Forgery + PIN Theft (Memalsukan ID card untuk meminta PIN)",
		Choices: []ScenarioChoice{
			{
				ID:             "cs_c3_safe",
				Text:           "ID card sangat mudah dipalsukan. Meminta PIN adalah bukti mutlak kejahatan perbankan. Jangan hubungi saya lagi!",
				SafetyRating:   "SAFE",
				Feedback:       "Tangkisan sempurna! Tidak ada staf teknis aplikasi yang butuh mengetahui PIN rahasia pengguna.",
				ScoreDelta:     25,
				NextStepID:     "step_4",
				PsychologyNote: "Memahami batas wewenang teknis perbankan.",
			},
			{
				ID:             "cs_c3_risky",
				Text:           "Petugas resmi sistemnya di backend tidak butuh tahu PIN pengguna. Saya tolak sebutkan PIN.",
				SafetyRating:   "RISKY",
				Feedback:       "Bagus menolak menyebutkan PIN, namun sebaiknya langsung blokir kontak pelaku seketika.",
				ScoreDelta:     15,
				NextStepID:     "step_4",
				PsychologyNote: "Penolakan parsial tanpa pemutusan koneksi.",
			},
			{
				ID:             "cs_c3_fatal",
				Text:           "Melihat foto ID card tampak meyakinkan, akhirnya mengetikkan PIN 6 digit ke chat pelaku.",
				SafetyRating:   "FATAL",
				Feedback:       "PIN akun berhasil dicuri! Penipu kini memegang kendali penuh atas akun dan dompet digital Anda.",
				ScoreDelta:     0,
				NextStepID:     "step_4",
				PsychologyNote: "Percaya pada bukti identitas visual palsu.",
			},
		},
	}

	// Step 4: Biometric Phishing Reset Link
	steps["step_4"] = DialogueStep{
		StepID:          "step_4",
		SenderName:      "Helpdesk Pusat Layanan E-Wallet",
		SenderAvatar:    "https://api.dicebear.com/7.x/personas/svg?seed=OfficerHelpdesk",
		SenderRole:      "Panggilan Call Center",
		Message:         "Untuk langkah pemulihan terakhir, silakan klik link pemulihan biometrik berikut: https://ewallet-security-reset.site/login lalu masukkan nomor HP dan kata sandi akun Anda.",
		AttachmentType:  "LINK",
		AttachmentData:  "https://ewallet-security-reset.site/login",
		DeceptionTactic: "Phishing Credential Harvest (Tautan tiruan untuk mencuri password)",
		Choices: []ScenarioChoice{
			{
				ID:             "cs_c4_safe",
				Text:           "Tautan .site tersebut adalah halaman phishing pencurian kredensial. Nomor Anda saya laporkan ke PANDU dan akun saya amankan mandiri!",
				SafetyRating:   "SAFE",
				Feedback:       "Penyelesaian luar biasa! Anda berhasil mempertahankan seluruh lapisan pertahanan akun digital Anda.",
				ScoreDelta:     25,
				NextStepID:     "step_end",
				PsychologyNote: "Identifikasi link phishing di tahap akhir.",
			},
			{
				ID:             "cs_c4_risky",
				Text:           "Saya tidak akan klik tautan asing. Besok saya akan datang langsung ke gerai resmi e-wallet.",
				SafetyRating:   "RISKY",
				Feedback:       "Langkah fisik yang aman, namun pastikan nomor penipu langsung dilaporkan agar tidak memakan korban lain.",
				ScoreDelta:     15,
				NextStepID:     "step_end",
				PsychologyNote: "Menolak tautan phishing.",
			},
			{
				ID:             "cs_c4_fatal",
				Text:           "Membuka link tersebut dan mengisikan nomor HP serta kata sandi akun ke web phishing.",
				SafetyRating:   "FATAL",
				Feedback:       "Kredensial login tercuri di babak akhir! Akun dompet digital Anda berhasil diambil alih sepenuhnya.",
				ScoreDelta:     0,
				NextStepID:     "step_end",
				PsychologyNote: "Tertipu tautan reset palsu.",
			},
		},
	}

	// Step End
	steps["step_end"] = DialogueStep{
		StepID:          "step_end",
		SenderName:      "Sistem Keamanan PANDU",
		SenderAvatar:    "https://api.dicebear.com/7.x/bottts/svg?seed=PanduShield",
		SenderRole:      "Evaluasi Hasil",
		Message:         "Simulasi selesai! Anda telah menyelesaikan 4 tahapan evaluasi serangan rekayasa sosial Voice Phishing (Vishing).",
		DeceptionTactic: "Selesai",
		Choices:         []ScenarioChoice{},
	}

	return Scenario{
		ID:          "cs-palsu-otp",
		Title:       "Call Center Gadungan Pembatalan Transaksi E-Wallet",
		Category:    "Vishing & Pencurian OTP",
		Difficulty:  "Sedang",
		Platform:    "Panggilan Suara & WhatsApp",
		Description: "Latih ketahanan menghadapi penipu yang menyamar sebagai petugas call center resmi dan mendesak Anda memberikan kode OTP.",
		InitialStep: "step_1",
		Steps:       steps,
	}
}

// 5. Akun Teman Mendadak Ganti Nomor Minta Uang Darurat
func getTemanImpersonasiPinjolScenario() Scenario {
	steps := make(map[string]DialogueStep)

	// Step 1: Emergency Fuel Money Lure
	steps["step_1"] = DialogueStep{
		StepID:          "step_1",
		SenderName:      "Dimas (Akun Baru)",
		SenderAvatar:    "https://api.dicebear.com/7.x/personas/svg?seed=DimasTeman",
		SenderRole:      "Kontak Baru",
		Message:         "Bro, ini gw Dimas. Nomor lama gw ilang kesita. Gw lagi di pom bensin luar kota mau balik kampus, kartu ATM gw ketelen di mesin. Boleh minta tolong banget transferin dulu 250rb buat isi bensin? Ntar malem nyampe kos langsung gw transfer balik bro, urgent banget ini.",
		AttachmentType:  "NONE",
		DeceptionTactic: "Friend Impersonation + Emergency Assistance Trap (Menyalahgunakan empati pertemanan)",
		Choices: []ScenarioChoice{
			{
				ID:             "imp_c1_safe",
				Text:           "Bentar Dim, gw video call nomor ini dulu atau gw telepon nomor lama lu untuk verifikasi.",
				SafetyRating:   "SAFE",
				Feedback:       "Langkah penyelamat! Penipu suara atau penyamar chat teks tidak akan berani mengangkat panggilan video call langsung.",
				ScoreDelta:     25,
				NextStepID:     "step_2",
				PsychologyNote: "Verifikasi identitas biometrik / real-time.",
			},
			{
				ID:             "imp_c1_risky",
				Text:           "Kok tumben pinjam uang pakai nomor baru? Lu lagi di pom bensin daerah mana emangnya?",
				SafetyRating:   "RISKY",
				Feedback:       "Bagus menanyakan lokasi, namun penipu terlatih biasanya sudah menyiapkan nama kota acak yang terdengar meyakinkan.",
				ScoreDelta:     15,
				NextStepID:     "step_2",
				PsychologyNote: "Mencari konfirmasi kontekstual.",
			},
			{
				ID:             "imp_c1_fatal",
				Text:           "Kasian bro. Minta nomor rekeningnya, langsung gw transfer sekarang lewat m-banking.",
				SafetyRating:   "FATAL",
				Feedback:       "Jebakan empati berhasil! Foto profil teman Anda diambil dari medsos. Uang Anda langsung lenyap ke rekening pelaku.",
				ScoreDelta:     0,
				NextStepID:     "step_2",
				PsychologyNote: "Rasa sungkan & empati buta tanpa verifikasi.",
			},
		},
	}

	// Step 2: Call Rejection & Guilt Tripping
	steps["step_2"] = DialogueStep{
		StepID:          "step_2",
		SenderName:      "Dimas (Akun Baru)",
		SenderAvatar:    "https://api.dicebear.com/7.x/personas/svg?seed=DimasTeman",
		SenderRole:      "Kontak Baru",
		Message:         "(Panggilan ditolak oleh Dimas)\nSinyal di pom bensin jelek banget bro ga bisa angkat telepon, putus-putus. Ayolah bro masa sama temen sendiri ga percaya, butuh banget ini buat jalan.",
		AttachmentType:  "NONE",
		DeceptionTactic: "Guilt Tripping (Membuat korban merasa bersalah karena tidak percaya)",
		Choices: []ScenarioChoice{
			{
				ID:             "imp_c2_safe",
				Text:           "Tes pertanyaan rahasia: 'Siapa nama dosen pembimbing skripsi kita atau nama warung makan langganan kita pas semester 1?'",
				SafetyRating:   "SAFE",
				Feedback:       "Pertahanan jenius! Mengajukan pertanyaan fakta masa lalu yang hanya diketahui oleh teman asli Anda akan langsung mematikan penipu.",
				ScoreDelta:     25,
				NextStepID:     "step_3",
				PsychologyNote: "Knowledge-Based Authentication (KBA) personal.",
			},
			{
				ID:             "imp_c2_risky",
				Text:           "Kirimkan foto selfie lu di depan plang pom bensin sekarang juga kalau beneran lu.",
				SafetyRating:   "RISKY",
				Feedback:       "Menuntut bukti visual bagus, namun penipu kerap menggunakan foto comotan internet yang diedit kilat.",
				ScoreDelta:     15,
				NextStepID:     "step_3",
				PsychologyNote: "Meminta bukti visual.",
			},
			{
				ID:             "imp_c2_fatal",
				Text:           "Karena ga enak dituduh ga percaya teman, akhirnya bersiap mentransfer uang yang diminta.",
				SafetyRating:   "FATAL",
				Feedback:       "Termakan manipulasi rasa bersalah! Keamanan finansial tidak boleh dikalahkan oleh rasa sungkan pertemanan.",
				ScoreDelta:     0,
				NextStepID:     "step_3",
				PsychologyNote: "Manipulasi emosi rasa bersalah (Guilt Trip).",
			},
		},
	}

	// Step 3: Different Account Name Hook
	steps["step_3"] = DialogueStep{
		StepID:          "step_3",
		SenderName:      "Dimas (Akun Baru)",
		SenderAvatar:    "https://api.dicebear.com/7.x/personas/svg?seed=DimasTeman",
		SenderRole:      "Kontak Baru",
		Message:         "Nih transfer ke rekening temen gw yang punya pom bensin: Bank Mandiri 13200918231 a.n RAHMAT HIDAYAT. Gw nebeng rekening dia soalnya ATM gw kan ketelen.",
		AttachmentType:  "NONE",
		DeceptionTactic: "Mule Account Redirection (Rekening penampung atas nama pihak ketiga)",
		Choices: []ScenarioChoice{
			{
				ID:             "imp_c3_safe",
				Text:           "Nama rekeningnya orang lain dan beda jauh dari nama lu. Gw ga akan transfer sebelum bisa bicara langsung lewat telepon suara!",
				SafetyRating:   "SAFE",
				Feedback:       "Aturan emas perbankan! Jangan pernah mentransfer uang pinjaman darurat ke rekening pihak ketiga yang tidak Anda kenal.",
				ScoreDelta:     25,
				NextStepID:     "step_4",
				PsychologyNote: "Kewaspadaan rekening penampung (Money Mule).",
			},
			{
				ID:             "imp_c3_risky",
				Text:           "Gw cek nomor rekening ini dulu di database PANDU / CekRekening apakah ada rekam jejak aduan penipuan.",
				SafetyRating:   "RISKY",
				Feedback:       "Langkah intelijen yang bagus, namun rekening baru seringkali belum sempat terindeks aduan publik.",
				ScoreDelta:     15,
				NextStepID:     "step_4",
				PsychologyNote: "Pengecekan database daftar hitam.",
			},
			{
				ID:             "imp_c3_fatal",
				Text:           "Langsung transfer ke rekening Rahmat Hidayat tanpa mencurigai nama pemilik rekening yang berbeda.",
				SafetyRating:   "FATAL",
				Feedback:       "Uang meluncur ke rekening penampung! Ini adalah tanda paling jelas kejahatan rekayasa sosial impersonasi.",
				ScoreDelta:     0,
				NextStepID:     "step_4",
				PsychologyNote: "Mengabaikan anomali nama rekening bank.",
			},
		},
	}

	// Step 4: Emotional Blackmail
	steps["step_4"] = DialogueStep{
		StepID:          "step_4",
		SenderName:      "Dimas (Akun Baru)",
		SenderAvatar:    "https://api.dicebear.com/7.x/personas/svg?seed=DimasTeman",
		SenderRole:      "Kontak Baru",
		Message:         "Bro masa tega biarin gw terlantar di jalan malam-malam gini cuma gara-gara 250 ribu? Temen macam apa lu bro, parah banget ga punya hati!",
		AttachmentType:  "NONE",
		DeceptionTactic: "Emotional Blackmail & Relationship Pressure (Tekanan emosional pemutusan pertemanan)",
		Choices: []ScenarioChoice{
			{
				ID:             "imp_c4_safe",
				Text:           "Manipulasi rasa bersalah adalah ciri khas penipu. Gw hubungi keluarga atau teman kosan lu langsung untuk cek keberadaan lu yang asli!",
				SafetyRating:   "SAFE",
				Feedback:       "Penutupan terbaik! Menghubungi lingkaran pertemanan asli atau keluarga seketika membongkar sandiwara pelaku.",
				ScoreDelta:     25,
				NextStepID:     "step_end",
				PsychologyNote: "Verifikasi silang melalui jaringan sosial terpercaya.",
			},
			{
				ID:             "imp_c4_risky",
				Text:           "Gw transfer pulsa darurat 25rb saja biar lu bisa telepon orang tua lu, tapi gw tidak transfer uang ke rekening asing.",
				SafetyRating:   "RISKY",
				Feedback:       "Meminimalisir kerugian materiil, namun tetap memberikan insentif pulsa kepada penipu online.",
				ScoreDelta:     15,
				NextStepID:     "step_end",
				PsychologyNote: "Kompromi bantuan non-tunai.",
			},
			{
				ID:             "imp_c4_fatal",
				Text:           "Merasa sangat bersalah dan cemas merusak pertemanan, akhirnya mentransfer 250 ribu ke rekening penipu.",
				SafetyRating:   "FATAL",
				Feedback:       "Kalah oleh intimidasi pertemanan palsu! Begitu uang terkirim, nomor Anda langsung diblokir pelaku.",
				ScoreDelta:     0,
				NextStepID:     "step_end",
				PsychologyNote: "Tunduk pada pemerasan emosional.",
			},
		},
	}

	// Step End
	steps["step_end"] = DialogueStep{
		StepID:          "step_end",
		SenderName:      "Sistem Keamanan PANDU",
		SenderAvatar:    "https://api.dicebear.com/7.x/bottts/svg?seed=PanduShield",
		SenderRole:      "Evaluasi Hasil",
		Message:         "Simulasi selesai! Anda telah menyelesaikan 4 tahapan evaluasi serangan rekayasa sosial impersonasi kerabat.",
		DeceptionTactic: "Selesai",
		Choices:         []ScenarioChoice{},
	}

	return Scenario{
		ID:          "teman-pinjam-uang",
		Title:       "Akun Teman Mendadak Ganti Nomor Minta Uang Darurat",
		Category:    "Impersonasi & Rekayasa Sosial",
		Difficulty:  "Mudah",
		Platform:    "WhatsApp",
		Description: "Latih imunitas kognitif Anda dari jebakan manipulasi empati ketika ada akun teman mengaku ganti nomor.",
		InitialStep: "step_1",
		Steps:       steps,
	}
}
