package scanner

import (
	"strings"
	"testing"
)

func TestAnalyzeText_LokerScam(t *testing.T) {
	sample := `Halo kak, kami dari agensi media digital membuka lowongan kerja paruh waktu. Tugasnya cuma like video YouTube dan follow toko Shopee, komisi harian 200rb - 500rb langsung cair. Hubungi admin telegram kami untuk klaim misi tugas pertama.`
	res := AnalyzeText(sample)

	if res.RiskScore < 50 {
		t.Fatalf("Expected high risk score for loker like video scam, got %d", res.RiskScore)
	}

	if len(res.RedFlags) == 0 {
		t.Fatal("Expected red flags to be detected")
	}

	if res.DetectedCategory != "Loker Freelance Palsu / Scam Misi Berbayar" {
		t.Fatalf("Expected category Loker Freelance, got: %s", res.DetectedCategory)
	}
}

func TestAnalyzeText_APKMalware(t *testing.T) {
	sample := `Selamat siang bapak/ibu, paket Anda tertahan di gudang J&T karena alamat kurang lengkap. Silakan cek foto paket dan resi pada lampiran: Resi_Paket_JNT_Express.apk`
	res := AnalyzeText(sample)

	if res.RiskScore < 60 {
		t.Fatalf("Expected critical risk score for APK scam, got %d", res.RiskScore)
	}

	if len(res.ExtractedFiles) == 0 {
		t.Fatal("Expected .apk file to be extracted")
	}
}

func TestAnalyzeText_AccidentEmergencyScam(t *testing.T) {
	sample := `keluarga bapak kecelakaan kini sudah kami bawa kerumah sakit, untuk proses administrasi terkena biaya 2juta rupiah, jika tidak segera di proses putri bapak tidak akan tertolong transfer ke rekening saya xxx`
	res := AnalyzeText(sample)

	if res.RiskScore < 85 {
		t.Fatalf("Expected critical risk score for hospital emergency scam, got %d", res.RiskScore)
	}

	if res.ThreatLevel != "KRITIS / INDIKASI PENIPUAN TINGGI" {
		t.Fatalf("Expected threat level KRITIS, got: %s", res.ThreatLevel)
	}

	if res.DetectedCategory != "Darurat Medis / Pemerasan Kecelakaan Keluarga Palsu" {
		t.Fatalf("Expected category Darurat Medis, got: %s", res.DetectedCategory)
	}

	hasTriadFlag := false
	for _, rf := range res.RedFlags {
		if strings.Contains(rf.Title, "Triad") || strings.Contains(rf.Title, "Kepanikan Kecelakaan") {
			hasTriadFlag = true
			break
		}
	}
	if !hasTriadFlag {
		t.Fatal("Expected Triad or Accident Emergency RedFlag to be present")
	}
}

func TestAnalyzeText_PoliceExtortion(t *testing.T) {
	sample := `Selamat siang, kami dari Unit Narkoba Bareskrim Polri mengamankan putra bapak terkait kasus narkoba. Jika ingin diselesaikan secara damai dan tidak masuk sel tahanan, segera kirim uang damai 10 juta ke rekening penyidik sebelum jam 2 siang.`
	res := AnalyzeText(sample)

	if res.RiskScore < 85 {
		t.Fatalf("Expected critical risk score for police extortion, got %d", res.RiskScore)
	}

	if res.DetectedCategory != "Pemerasan Berkedok Aparat Penegak Hukum" {
		t.Fatalf("Expected category Pemerasan Berkedok Aparat, got: %s", res.DetectedCategory)
	}
}

func TestAnalyzeText_NormalConversation(t *testing.T) {
	sample := `Halo Rio, besok pagi kita kumpul di perpus jam 9 buat ngerjain tugas kelompok ya, jangan lupa bawa laptop.`
	res := AnalyzeText(sample)

	if res.RiskScore > 15 {
		t.Fatalf("Expected low risk score for normal conversation, got %d", res.RiskScore)
	}

	if res.ThreatLevel != "TIDAK DITEMUKAN POLA MANIPULASI" {
		t.Fatalf("Expected threat level TIDAK DITEMUKAN POLA MANIPULASI, got: %s", res.ThreatLevel)
	}
}

func TestAnalyzeURL_BrandPhishing(t *testing.T) {
	phishingURL := "https://bca-promo-gebyar-hadiah.xyz/login"
	res := AnalyzeURL(phishingURL, false)

	if res.RiskScore < 70 {
		t.Fatalf("Expected critical risk score for BCA typosquatting on .xyz, got %d", res.RiskScore)
	}

	if res.ImpersonatedBrand != "Bank Central Asia (BCA)" {
		t.Fatalf("Expected BCA to be detected as impersonated brand, got: %s", res.ImpersonatedBrand)
	}
}

func TestAnalyzeURL_OfficialDomain(t *testing.T) {
	officialURL := "https://klikbca.com"
	res := AnalyzeURL(officialURL, false)

	if res.RiskScore > 10 {
		t.Fatalf("Expected low risk score for official domain, got %d", res.RiskScore)
	}
}

func TestAnalyzeURL_NoRiskDoesNotClaimAbsoluteSafety(t *testing.T) {
	res := AnalyzeURL("https://example.com", false)
	level := strings.ToLower(res.ThreatLevel)
	if strings.Contains(level, "aman /") || strings.Contains(level, "tervalidasi") {
		t.Fatalf("zero indicators must not become an absolute safety claim: %q", res.ThreatLevel)
	}
}
