package scanner

import (
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
