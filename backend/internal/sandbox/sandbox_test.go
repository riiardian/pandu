package sandbox

import (
	"testing"
)

func TestGetCatalog(t *testing.T) {
	catalog := GetCatalog()
	if len(catalog) < 3 {
		t.Fatalf("Expected at least 3 scenarios, got %d", len(catalog))
	}
}

func TestProcessTurn_SafeChoice(t *testing.T) {
	req := SimulationTurnRequest{
		ScenarioID: "loker-like-video",
		StepID:     "step_1",
		ChoiceID:   "c1_b", // Ask for company registration
		ScoreSoFar: 50,
	}

	res, err := ProcessTurn(req)
	if err != nil {
		t.Fatalf("ProcessTurn failed: %v", err)
	}

	if res.NewTotalScore <= 50 {
		t.Fatalf("Expected score to increase for safe choice, got %d", res.NewTotalScore)
	}

	if res.NextStep == nil {
		t.Fatal("Expected next step to exist")
	}
}

func TestProcessTurn_FatalChoice(t *testing.T) {
	req := SimulationTurnRequest{
		ScenarioID: "kurir-paket-apk",
		StepID:     "step_1",
		ChoiceID:   "apk_c1_a", // Install APK blindly
		ScoreSoFar: 50,
	}

	res, err := ProcessTurn(req)
	if err != nil {
		t.Fatalf("ProcessTurn failed: %v", err)
	}

	if res.NewTotalScore >= 50 {
		t.Fatalf("Expected score to decrease for fatal choice, got %d", res.NewTotalScore)
	}

	if !res.IsCompleted {
		t.Fatal("Expected fatal malware scenario to complete/end")
	}
}
