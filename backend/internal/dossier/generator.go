package dossier

import (
	"crypto/rand"
	"encoding/hex"
	"fmt"
	"strings"
	"time"
)

// IncidentData represents details submitted by user or auto-populated from scanner.
type IncidentData struct {
	Category       string `json:"category"` // "APK_SNIFFER", "LOKER_FREELANCE", "TRANSFER_PINJOL", "PHISHING_URL", "LAINNYA"
	SuspectPhone   string `json:"suspect_phone"`
	SuspectAccount string `json:"suspect_account"` // e.g. "BCA 1234567890 a.n John Doe"
	SuspectURL     string `json:"suspect_url"`
	LossAmount     int64  `json:"loss_amount"` // In IDR (0 if prevented)
	Chronology     string `json:"chronology"`
	VictimPlatform string `json:"victim_platform"` // "WhatsApp", "Telegram", "Instagram", "SMS"
}

// ActionChecklist represents a prioritised emergency task for the user.
type ActionChecklist struct {
	Priority    string `json:"priority"` // "DARURAT (1-10 Menit)", "PENTING (Hari Ini)", "PENCEGAHAN (Lanjutan)"
	ActionTitle string `json:"action_title"`
	Description string `json:"description"`
}

// ReportDraft holds pre-formatted official complaint text.
type ReportDraft struct {
	ChannelName string `json:"channel_name"` // e.g. "Portal CekRekening.id (Kemenkominfo/OJK)"
	TargetURL   string `json:"target_url"`
	DraftText   string `json:"draft_text"`
}

// ForensicDossier is the generated actionable incident package.
type ForensicDossier struct {
	DossierID          string            `json:"dossier_id"`
	CreatedAt          string            `json:"created_at"`
	IncidentSummary    string            `json:"incident_summary"`
	FirstAidChecklist  []ActionChecklist `json:"first_aid_checklist"`
	OfficialDrafts     []ReportDraft     `json:"official_drafts"`
	FamilyAlertCardText string           `json:"family_alert_card_text"`
}

// GenerateDossier compiles actionable first-aid and regulatory complaint packages.
func GenerateDossier(data IncidentData) ForensicDossier {
	refCode := generateRefCode()
	now := time.Now().Format("02 January 2006, 15:04 WIB")

	categoryName := resolveCategoryName(data.Category)

	dossier := ForensicDossier{
		DossierID:       refCode,
		CreatedAt:       now,
		IncidentSummary: fmt.Sprintf("Insiden: %s | Platform: %s | Nilai Kerugian: Rp %s", categoryName, data.VictimPlatform, formatRupiah(data.LossAmount)),
		FirstAidChecklist: generateChecklist(data),
		OfficialDrafts:    generateOfficialDrafts(data, refCode),
		FamilyAlertCardText: generateFamilyAlert(data),
	}

	return dossier
}

func generateChecklist(data IncidentData) []ActionChecklist {
	var list []ActionChecklist

	switch data.Category {
	case "APK_SNIFFER":
		list = append(list,
			ActionChecklist{
				Priority:    "DARURAT (1-5 Menit)",
				ActionTitle: "Aktifkan Mode Pesawat (Airplane Mode) Segera!",
				Description: "Putus koneksi internet (Wi-Fi dan Data Seluler) seketika untuk menghentikan sniffer APK mengirimkan SMS OTP Anda ke server penipu.",
			},
			ActionChecklist{
				Priority:    "DARURAT (1-10 Menit)",
				ActionTitle: "Hubungi Call Center Bank untuk Blokir m-Banking",
				Description: "Gunakan HP kerabat lain untuk menelpon Call Center resmi bank Anda. Minta pemblokiran sementara akses m-banking dan kartu debit Anda.",
			},
			ActionChecklist{
				Priority:    "PENTING (Hari Ini)",
				ActionTitle: "Copot Pemasangan (Uninstall) Aplikasi Berbahaya & Scan",
				Description: "Buka Pengaturan HP > Aplikasi > Cari nama file yang baru dipasang > Hapus Instalasi. Lakukan scan malware menggunakan Google Play Protect.",
			},
		)
	case "TRANSFER_PINJOL", "LOKER_FREELANCE":
		list = append(list,
			ActionChecklist{
				Priority:    "DARURAT (1-10 Menit)",
				ActionTitle: "Hubungi Bank Pengirim untuk Hold / Laporan Penipuan",
				Description: "Telepon customer service bank Anda segera, laporkan transaksi penipuan dengan menyertakan Nomor Referensi Transfer. Bank dapat membekukan rekening penampung penipu jika dilaporkan cepat.",
			},
			ActionChecklist{
				Priority:    "PENTING (Hari Ini)",
				ActionTitle: "Simpan Semua Bukti Chat & Screenshot Nomor Rekening",
				Description: "Screenshot seluruh percakapan, nomor kontak penipu, dan bukti transfer. Jangan hapus chat sebagai bukti sah kepolisian.",
			},
		)
	default:
		list = append(list,
			ActionChecklist{
				Priority:    "DARURAT (1-10 Menit)",
				ActionTitle: "Ganti Kata Sandi & Keluar dari Semua Perangkat (Revoke Sessions)",
				Description: "Jika Anda terlanjur memasukkan data akun di link mencurigakan, segera ganti password akun utama Anda dan aktifkan verifikasi 2 langkah (2FA).",
			},
			ActionChecklist{
				Priority:    "PENTING (Hari Ini)",
				ActionTitle: "Blokir dan Laporkan Kontak / Link ke Platform Terkait",
				Description: "Gunakan fitur 'Laporkan dan Blokir' di WhatsApp/Telegram/Browser untuk menurunkan reputasi nomor penipu.",
			},
		)
	}

	list = append(list, ActionChecklist{
		Priority:    "PENCEGAHAN (Lanjutan)",
		ActionTitle: "Laporkan Nomor dan Rekening ke Portal Pemerintah",
		Description: "Daftarkan rekening penipu ke CekRekening.id dan nomor telepon penipu ke AduanNomor.id (Komdigi) agar diblokir permanen.",
	})

	return list
}

func generateOfficialDrafts(data IncidentData, refCode string) []ReportDraft {
	var drafts []ReportDraft

	// 1. Template AduanKonten.id (Komdigi)
	komdigiText := fmt.Sprintf(`Halo Tim Komdigi / AduanKonten.id,
Saya ingin melaporkan indikasi kejahatan siber penipuan digital dengan rincian sebagai berikut:
- Kategori Modus: %s
- Platform Kejahatan: %s
- Tautan / Domain Pelaku: %s
- Kontak Pelaku: %s
- Kronologi Singkat: %s
- Kerugian: Rp %s
- Kode Berkas Laporan: %s

Mohon dapat segera dilakukan pemblokiran domain/konten serta tindakan takedown demi melindungi masyarakat luas. Terima kasih.`,
		resolveCategoryName(data.Category), data.VictimPlatform, safeVal(data.SuspectURL), safeVal(data.SuspectPhone), safeVal(data.Chronology), formatRupiah(data.LossAmount), refCode)

	drafts = append(drafts, ReportDraft{
		ChannelName: "AduanKonten.id (Kementerian Komunikasi dan Digital)",
		TargetURL:   "https://aduankonten.id",
		DraftText:   komdigiText,
	})

	// 2. Template CekRekening.id (Khusus Penipuan Transaksi / Rekening Penampung)
	if data.SuspectAccount != "" || data.LossAmount > 0 {
		cekrekText := fmt.Sprintf(`Kepada Yth. Tim CekRekening.id & Asosiasi Perbankan,
Saya melaporkan rekening bank / e-wallet penampung hasil penipuan online:
- Rekening / E-Wallet Terlapor: %s
- Kontak WhatsApp/Telegram Pelaku: %s
- Modus Penipuan: %s
- Total Kerugian: Rp %s
- Ringkasan Kejadian: %s

Mohon rekening di atas dapat segera ditandai merah (Blacklist) dan dibekukan oleh bank penerbit. Bukti transfer lengkap terlampir.`,
			safeVal(data.SuspectAccount), safeVal(data.SuspectPhone), resolveCategoryName(data.Category), formatRupiah(data.LossAmount), safeVal(data.Chronology))

		drafts = append(drafts, ReportDraft{
			ChannelName: "CekRekening.id & AduanNomor.id (Kemenkominfo)",
			TargetURL:   "https://cekrekening.id",
			DraftText:   cekrekText,
		})
	}

	// 3. Template Laporan Kepolisian (Patroli Siber Polri)
	polriText := fmt.Sprintf(`LAPORAN PENGADUAN TINDAK PIDANA SIBER
Kepada: Direktorat Tindak Pidana Siber Bareskrim Polri / Polda Setempat

1. Kategori Kejahatan: %s
2. Sarana Media: %s
3. Identitas Pelaku Terlacak:
   - Nomor Telepon/WA: %s
   - Rekening Penampung: %s
   - URL/Situs Phishing: %s
4. Total Kerugian Materil: Rp %s
5. Uraian Kejadian:
   %s
6. Kode Registrasi Laporan Mandiri: %s

Demikian laporan ini dibuat untuk ditindaklanjuti secara hukum sesuai UU ITE yang berlaku.`,
		resolveCategoryName(data.Category), data.VictimPlatform, safeVal(data.SuspectPhone), safeVal(data.SuspectAccount), safeVal(data.SuspectURL), formatRupiah(data.LossAmount), safeVal(data.Chronology), refCode)

	drafts = append(drafts, ReportDraft{
		ChannelName: "Patroli Siber Polri (Dittipidsiber Bareskrim)",
		TargetURL:   "https://patrolisiber.id",
		DraftText:   polriText,
	})

	return drafts
}

func generateFamilyAlert(data IncidentData) string {
	return fmt.Sprintf(`⚠️ PERINGATAN MODUS PENIPUAN BARU DI GRUP KELUARGA ⚠️

Bapak/Ibu/Saudara sekalian, mohon berhati-hati jika menerima pesan mencurigakan:
- Jenis Modus: %s
- Modus Pelaku: %s
- Nomor Kontak Terduga Penipu: %s
- Tautan Palsu Terduga: %s

Pesan Keamanan Penting:
1. JANGAN PERNAH klik link sembarangan atau mengunduh file berakhiran .APK di WhatsApp!
2. Jika ada tawaran pekerjaan sampingan yang meminta transfer uang deposit, itu 100%% PENIPUAN.
3. Selalu telepon langsung kerabat sebelum transfer jika ada yang mengaku ganti nomor HP.

Sebarkan pesan ini agar keluarga kita tetap aman dari penipuan digital!`,
		resolveCategoryName(data.Category), safeVal(data.Chronology), safeVal(data.SuspectPhone), safeVal(data.SuspectURL))
}

func resolveCategoryName(cat string) string {
	switch cat {
	case "APK_SNIFFER":
		return "Penyebaran Malware / Sniffer APK (Resi/Surat Tilang/Undangan)"
	case "LOKER_FREELANCE":
		return "Lowongan Kerja Freelance Palsu (Misi Like Video / Deposit Berbayar)"
	case "TRANSFER_PINJOL":
		return "Penipuan Pinjaman Online Ilegal / Investasi Bodong"
	case "PHISHING_URL":
		return "Situs Web Phishing / Undian Palsu / Pencurian Akun"
	default:
		return "Tipuan Digital / Social Engineering"
	}
}

func safeVal(v string) string {
	if strings.TrimSpace(v) == "" {
		return "-"
	}
	return strings.TrimSpace(v)
}

func formatRupiah(amount int64) string {
	if amount <= 0 {
		return "0 (Tidak ada kerugian finansial / Berhasil digagalkan)"
	}
	// Simple thousand separator
	str := fmt.Sprintf("%d", amount)
	n := len(str)
	if n <= 3 {
		return str
	}
	var res []string
	for i := n; i > 0; i -= 3 {
		start := i - 3
		if start < 0 {
			start = 0
		}
		res = append([]string{str[start:i]}, res...)
	}
	return strings.Join(res, ".")
}

func generateRefCode() string {
	b := make([]byte, 4)
	_, _ = rand.Read(b)
	return fmt.Sprintf("PANDU-%s-%s", time.Now().Format("20060102"), strings.ToUpper(hex.EncodeToString(b)))
}
