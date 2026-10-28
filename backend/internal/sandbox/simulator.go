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
			resp.FinalVerdict = "IMUNITAS TINGGI / CYBER GUARDIAN PRO"
			resp.LessonsLearned = []string{
				"Anda berhasil menahan manipulasi psikologis dan mengedepankan verifikasi saluran resmi.",
				"Sikap skeptis yang sehat adalah pertahanan nomor satu di era kejahatan siber.",
			}
		} else if newScore >= 40 {
			resp.FinalVerdict = "WASPADA / BUTUH LATIHAN TAMBAHAN"
			resp.LessonsLearned = []string{
				"Anda sempat ragu atau mengambil keputusan berisiko, namun masih memiliki insting dasar.",
				"Perbanyak latihan memperhatikan ekstensi file (.apk) dan domain web murah.",
			}
		} else {
			resp.FinalVerdict = "RENTAN JEBAKAN / RAWAN MANIPULASI"
			resp.LessonsLearned = []string{
				"Anda sangat mudah tergiur iming-iming instan atau terintimidasi desakan waktu palsu.",
				"Ingat prinsip emas: Perusahaan resmi TIDAK PERNAH meminta deposit, dan kurir TIDAK PERNAH mengirim file .APK!",
			}
		}
		return resp, nil
	}

	resp.NextStep = &nextStep
	return resp, nil
}
