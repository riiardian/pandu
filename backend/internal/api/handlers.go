package api

import (
	"time"

	"pandu/backend/internal/dossier"
	"pandu/backend/internal/sandbox"
	"pandu/backend/internal/scanner"

	"github.com/gofiber/fiber/v2"
)

// ScanTextRequest payload
type ScanTextRequest struct {
	Text string `json:"text"`
}

// ScanURLRequest payload
type ScanURLRequest struct {
	URL             string `json:"url"`
	FollowRedirects bool   `json:"follow_redirects"`
}

// RegisterRoutes registers all API routes for Pandu Engine.
func RegisterRoutes(app *fiber.App) {
	v1 := app.Group("/api/v1")

	// System Health
	v1.Get("/health", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{
			"status":    "online",
			"service":   "PANDU — Digital Deception Navigation & Defense Engine",
			"version":   "1.0.0",
			"timestamp": time.Now().Unix(),
		})
	})

	// Pillar 1: Recognize (Scanner)
	v1.Post("/scan/text", handleScanText)
	v1.Post("/scan/url", handleScanURL)

	// Pillar 2: Learn (Sandbox Simulation)
	v1.Get("/sandbox/scenarios", handleGetScenarios)
	v1.Get("/sandbox/scenarios/:id", handleGetScenarioDetail)
	v1.Post("/sandbox/respond", handleSandboxTurn)

	// Pillar 3: Act (First-Aid & Dossier Generator)
	v1.Post("/dossier/generate", handleGenerateDossier)

	// General Stats
	v1.Get("/stats", handleGetStats)
}

func handleScanText(c *fiber.Ctx) error {
	var req ScanTextRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "Format body JSON tidak valid",
		})
	}

	result := scanner.AnalyzeText(req.Text)
	return c.JSON(fiber.Map{
		"success": true,
		"data":    result,
	})
}

func handleScanURL(c *fiber.Ctx) error {
	var req ScanURLRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "Format body JSON tidak valid",
		})
	}

	result := scanner.AnalyzeURL(req.URL, req.FollowRedirects)
	return c.JSON(fiber.Map{
		"success": true,
		"data":    result,
	})
}

func handleGetScenarios(c *fiber.Ctx) error {
	scenarios := sandbox.GetCatalog()

	// Return summary catalog without heavy step maps
	type ScenarioSummary struct {
		ID          string `json:"id"`
		Title       string `json:"title"`
		Category    string `json:"category"`
		Difficulty  string `json:"difficulty"`
		Platform    string `json:"platform"`
		Description string `json:"description"`
	}

	var summaries []ScenarioSummary
	for _, s := range scenarios {
		summaries = append(summaries, ScenarioSummary{
			ID:          s.ID,
			Title:       s.Title,
			Category:    s.Category,
			Difficulty:  s.Difficulty,
			Platform:    s.Platform,
			Description: s.Description,
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"data":    summaries,
	})
}

func handleGetScenarioDetail(c *fiber.Ctx) error {
	id := c.Params("id")
	scenario := sandbox.GetScenarioByID(id)
	if scenario == nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"success": false,
			"message": "Skenario tidak ditemukan",
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"data":    scenario,
	})
}

func handleSandboxTurn(c *fiber.Ctx) error {
	var req sandbox.SimulationTurnRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "Format body keputusan tidak valid",
		})
	}

	res, err := sandbox.ProcessTurn(req)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"data":    res,
	})
}

func handleGenerateDossier(c *fiber.Ctx) error {
	var data dossier.IncidentData
	if err := c.BodyParser(&data); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "Data insiden tidak valid",
		})
	}

	res := dossier.GenerateDossier(data)
	return c.JSON(fiber.Map{
		"success": true,
		"data":    res,
	})
}

func handleGetStats(c *fiber.Ctx) error {
	return c.JSON(fiber.Map{
		"success": true,
		"data": fiber.Map{
			"total_scenarios":       3,
			"threat_intelligence":   "Aktif (Heuristik Lokal Indonesia 2026)",
			"verified_brands_count": 13,
			"supported_channels":    []string{"WhatsApp", "Telegram", "SMS", "Web Browser"},
			"mission":               "Empowering Today's Generation Toward a Safer Cyber Ecosystem",
		},
	})
}
