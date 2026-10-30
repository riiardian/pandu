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
		ChoiceID:   "loker_c1_safe",
		ScoreSoFar: 0,
	}

	res, err := ProcessTurn(req)
	if err != nil {
		t.Fatalf("ProcessTurn failed: %v", err)
	}

	if res.NewTotalScore != 25 {
		t.Fatalf("Expected score to be 25 for safe choice starting from 0, got %d", res.NewTotalScore)
	}

	if res.NextStep == nil {
		t.Fatal("Expected next step to exist")
	}
}

func TestProcessTurn_FatalChoice(t *testing.T) {
	req := SimulationTurnRequest{
		ScenarioID: "kurir-paket-apk",
		StepID:     "step_1",
		ChoiceID:   "apk_c1_fatal",
		ScoreSoFar: 0,
	}

	res, err := ProcessTurn(req)
	if err != nil {
		t.Fatalf("ProcessTurn failed: %v", err)
	}

	if res.NewTotalScore != 0 {
		t.Fatalf("Expected score to remain 0 for fatal choice, got %d", res.NewTotalScore)
	}

	if res.NextStep == nil {
		t.Fatal("Expected next step to exist for 4-turn sequence")
	}
}
