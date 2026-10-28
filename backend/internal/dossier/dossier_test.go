package dossier

import (
	"strings"
	"testing"
)

func TestGenerateDossier_APK(t *testing.T) {
	data := IncidentData{
		Category:       "APK_SNIFFER",
		SuspectPhone:   "08123456789",
		SuspectAccount: "BCA 1234567890 a.n Hacker",
		SuspectURL:     "http://kurir-paket.xyz",
		LossAmount:     5000000,
		Chronology:     "Menerima kiriman file APK surat tilang lalu terinstal",
		VictimPlatform: "WhatsApp",
	}

	res := GenerateDossier(data)

	if !strings.HasPrefix(res.DossierID, "PANDU-") {
		t.Fatalf("Expected Dossier ID with PANDU prefix, got %s", res.DossierID)
	}

	if len(res.FirstAidChecklist) == 0 {
		t.Fatal("Expected first aid checklist to be populated")
	}

	if len(res.OfficialDrafts) < 2 {
		t.Fatalf("Expected at least 2 official report drafts, got %d", len(res.OfficialDrafts))
	}

	if !strings.Contains(res.FamilyAlertCardText, "PERINGATAN MODUS PENIPUAN") {
		t.Fatal("Expected family alert text to contain warning header")
	}
}
