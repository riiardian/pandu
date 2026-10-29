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

func TestAnalyzeURL_BrandSimilarityWithoutThreatFeedStaysHeuristic(t *testing.T) {
	res := AnalyzeURL("https://autogopay.site", false)

	if res.ImpersonatedBrand != "GoPay Indonesia" {
		t.Fatalf("expected GoPay similarity context, got: %s", res.ImpersonatedBrand)
	}
	if res.RiskScore >= 70 {
		t.Fatalf("brand substring and alternative TLD without external threat-feed match must not produce a phishing verdict, got %d", res.RiskScore)
	}
	if strings.Contains(res.ThreatLevel, "PHISHING TINGGI") {
		t.Fatalf("heuristics alone must not claim high-confidence phishing: %s", res.ThreatLevel)
	}
}

func TestAnalyzeURL_OfficialDomain(t *testing.T) {
	officialURL := "https://klikbca.com"
	res := AnalyzeURL(officialURL, false)

	if res.RiskScore > 10 {
		t.Fatalf("Expected low risk score for official domain, got %d", res.RiskScore)
	}
}

func TestSecurityGradeAIsContextNotReputationEvidence(t *testing.T) {
	posture := &WebSecurityPosture{SecurityGrade: "A (Infrastruktur Terlindungi & Sangat Tangguh)"}
	if got := scoreAfterSecurityPosture(80, posture); got != 80 {
		t.Fatalf("Grade A headers must not erase structured threat evidence; got %d", got)
	}
	if got := scoreAfterSecurityPosture(30, posture); got != 30 {
		t.Fatalf("Grade A headers must not erase local heuristic context; got %d", got)
	}
}

func TestAnalyzePageContentDetectsRewardCredentialAndOTPFlow(t *testing.T) {
	html := `<!doctype html><html><head><title>Klaim Saldo Gratis</title></head><body>
		<h1>Selamat! Klaim hadiah uang Rp1.000.000 sekarang</h1>
		<button>Login dengan Google</button><button>Masuk Facebook</button>
		<form action="https://collector.example/submit">
			<input type="email" name="email"><input type="password" name="password">
			<input type="tel" name="nomor_dana"><input type="text" name="kode_otp">
		</form></body></html>`

	result := AnalyzePageContentHTML("https://promo.example/", []byte(html))
	if !result.HasRewardBait || !result.RequestsPassword || !result.RequestsOTP || !result.RequestsEWallet {
		t.Fatalf("expected reward + credential + OTP/e-wallet flow, got %+v", result)
	}
	if len(result.LoginProviders) != 2 {
		t.Fatalf("expected Google and Facebook login bait, got %v", result.LoginProviders)
	}
	if len(result.CrossOriginFormActions) != 1 {
		t.Fatalf("expected cross-origin form destination evidence, got %v", result.CrossOriginFormActions)
	}
	if result.RiskScore < 50 || result.RiskScore > 60 {
		t.Fatalf("page-content heuristic must be material but bounded at 60, got %d", result.RiskScore)
	}
	foundPromo := false
	for _, c := range result.PageCategories {
		if c == "Promosi / Hadiah" {
			foundPromo = true
			break
		}
	}
	if !foundPromo {
		t.Fatalf("expected PageCategories to include 'Promosi / Hadiah', got %v", result.PageCategories)
	}
}

func TestAnalyzePageContentNormalLoginIsNotSocialEngineering(t *testing.T) {
	tests := []struct {
		name string
		html string
	}{
		{name: "same-origin session", html: `<!doctype html><html><head><title>Portal Akun</title></head><body>
			<form action="/session"><label>Email</label><input type="email" name="email">
			<label>Password</label><input type="password" name="password"></form></body></html>`},
		{name: "external identity provider", html: `<!doctype html><html><head><title>Portal Akun</title></head><body>
			<form action="https://identity.example.net/session"><label>Email</label><input type="email" name="email">
			<label>Password</label><input type="password" name="password"></form></body></html>`},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := AnalyzePageContentHTML("https://example.com/login", []byte(tt.html))
			if result.HasRewardBait || result.RequestsOTP || result.RequestsEWallet {
				t.Fatalf("ordinary login must not be described as a social-engineering flow: %+v", result)
			}
			if result.RiskScore != 0 {
				t.Fatalf("ordinary login alone must remain neutral, got %d", result.RiskScore)
			}
			foundAuth := false
			for _, c := range result.PageCategories {
				if c == "Portal Autentikasi / Login" {
					foundAuth = true
					break
				}
			}
			if !foundAuth {
				t.Fatalf("expected PageCategories to include 'Portal Autentikasi / Login', got %v", result.PageCategories)
			}
		})
	}
}

func TestAnalyzeURL_NoRiskDoesNotClaimAbsoluteSafety(t *testing.T) {
	res := AnalyzeURL("https://example.com", false)
	level := strings.ToLower(res.ThreatLevel)
	if strings.Contains(level, "aman /") || strings.Contains(level, "tervalidasi") {
		t.Fatalf("zero indicators must not become an absolute safety claim: %q", res.ThreatLevel)
	}
}
