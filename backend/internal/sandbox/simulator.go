package sandbox

import (
	"errors"
	"fmt"
)

// SimulationTurnRequest holds input from the client making a decision.
type SimulationTurnRequest struct {
	ScenarioID string `json:"scenario_id"`
	StepID     string `json:"step_id"`
	ChoiceID   string `json:"choice_id"`
	ScoreSoFar int    `json:"score_so_far"`
}

// SimulationTurnResponse returns the result of the choice and the next dialogue step.
type SimulationTurnResponse struct {
	ScenarioID     string          `json:"scenario_id"`
	ChosenChoice   ScenarioChoice  `json:"chosen_choice"`
	NewTotalScore  int             `json:"new_total_score"`
	NextStep       *DialogueStep   `json:"next_step,omitempty"`
	IsCompleted    bool            `json:"is_completed"`
	FinalVerdict   string          `json:"final_verdict,omitempty"`
	LessonsLearned []string        `json:"lessons_learned,omitempty"`
}

// ProcessTurn advances the dialogue state based on the user's choice.
func ProcessTurn(req SimulationTurnRequest) (*SimulationTurnResponse, error) {
	scenario := GetScenarioByID(req.ScenarioID)
	if scenario == nil {
		return nil, fmt.Errorf("scenario with id '%s' not found", req.ScenarioID)
	}

	step, exists := scenario.Steps[req.StepID]
	if !exists {
		return nil, fmt.Errorf("step with id '%s' not found in scenario '%s'", req.StepID, req.ScenarioID)
	}

	var matchedChoice *ScenarioChoice
	for _, c := range step.Choices {
		if c.ID == req.ChoiceID {
			matchedChoice = &c
			break
		}
	}

	if matchedChoice == nil {
		return nil, errors.New("choice id not valid for current step")
	}

	newScore := req.ScoreSoFar + matchedChoice.ScoreDelta
	if newScore < 0 {
		newScore = 0
	}
	if newScore > 100 {
		newScore = 100
	}

	resp := &SimulationTurnResponse{
		ScenarioID:    req.ScenarioID,
		ChosenChoice:  *matchedChoice,
		NewTotalScore: newScore,
		IsCompleted:   false,
	}

	// Check if this choice leads to an ending step
	nextStep, hasNext := scenario.Steps[matchedChoice.NextStepID]
	if !hasNext || len(nextStep.Choices) == 0 {
		resp.IsCompleted = true
		if hasNext {
			resp.NextStep = &nextStep
		}

		if newScore >= 70 {
			resp.FinalVerdict = "TINGKAT OPTIMAL"
			resp.LessonsLearned = []string{
				"Menolak berkas mencurigakan dan memutus interaksi manipulatif secara tegas.",
				"Verifikasi selalu diarahkan langsung melalui kanal atau aplikasi resmi.",
			}
		} else if newScore >= 40 {
			resp.FinalVerdict = "PERLU EVALUASI"
			resp.LessonsLearned = []string{
				"Sempat mengambil respon berisiko yang membuka celah manipulasi lanjutan.",
				"Pertahankan prinsip verifikasi mandiri sebelum menanggapi desakan pelaku.",
			}
		} else {
			resp.FinalVerdict = "RENTAN PENIPUAN"
			resp.LessonsLearned = []string{
				"Mudah terpengaruh ancaman darurat palsu dan mengabaikan peringatan keamanan berkas.",
				"Jangan pernah membuka berkas aplikasi asing atau memberikan akses data lewat chat.",
			}
		}
		return resp, nil
	}

	resp.NextStep = &nextStep
	return resp, nil
}
