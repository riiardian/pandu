package api

import (
	"strings"
	"time"

	"pandu/backend/internal/blacklist"
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

	// Pillar 3: Act (PANDU Blacklist Registry & Incident Dossier)
	v1.Get("/blacklist/check", handleCheckBlacklist)
	v1.Post("/blacklist/report", handleReportBlacklist)
	v1.Get("/blacklist/recent", handleGetRecentBlacklist)
	v1.Get("/blacklist/stats", handleGetBlacklistStats)
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

	// Cross-check text against Blacklist Registry
	reg := blacklist.GetRegistry()
	if matchedEntry, found := reg.CheckBlacklist(req.Text); found {
		result.RiskScore = 98
		result.ThreatLevel = "KRITIS / PENIPUAN"
		result.RedFlags = append([]scanner.RedFlag{
			{
				Level:       "CRITICAL",
				Title:       "Terdaftar dalam Blacklist PANDU",
				Explanation: "Entitas (" + matchedEntry.Identifier + ") telah dilaporkan " + string(rune(matchedEntry.ReportCount+'0')) + " kali oleh komunitas PANDU: " + matchedEntry.Description,
				Snippet:     matchedEntry.Identifier,
			},
		}, result.RedFlags...)
	}

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

	// Cross-check URL against Blacklist Registry
	reg := blacklist.GetRegistry()
	if matchedEntry, found := reg.CheckBlacklist(req.URL); found {
		result.RiskScore = 99
		result.ThreatLevel = "BAHAYA / PHISHING"
		result.RedFlags = append([]scanner.RedFlag{
			{
				Level:       "CRITICAL",
				Title:       "Domain Masuk Daftar Hitam PANDU",
				Explanation: "Domain/URL ini telah diverifikasi sebagai phishing: " + matchedEntry.Description,
				Snippet:     matchedEntry.Identifier,
			},
		}, result.RedFlags...)
	}

	return c.JSON(fiber.Map{
		"success": true,
		"data":    result,
	})
}

func handleCheckBlacklist(c *fiber.Ctx) error {
	q := strings.TrimSpace(c.Query("q"))
	if q == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "Parameter pencarian 'q' wajib diisi",
		})
	}

	entry, found := blacklist.GetRegistry().CheckBlacklist(q)
	if !found {
		return c.JSON(fiber.Map{
			"success": true,
			"found":   false,
			"query":   q,
			"message": "Entitas belum terdaftar dalam basis data daftar hitam PANDU",
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"found":   true,
		"query":   q,
		"data":    entry,
	})
}

func handleReportBlacklist(c *fiber.Ctx) error {
	var req blacklist.ReportRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "Data laporan tidak valid",
		})
	}

	if strings.TrimSpace(req.Identifier) == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "Nomor telepon, rekening, atau URL target wajib diisi",
		})
	}

	entry, isNew := blacklist.GetRegistry().ReportThreat(req)
	msg := "Entitas berhasil ditambahkan ke Daftar Hitam PANDU"
	if !isNew {
		msg = "Laporan berhasil dicatat. Frekuensi laporan untuk entitas ini telah ditingkatkan."
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": msg,
		"is_new":  isNew,
		"data":    entry,
	})
}

func handleGetRecentBlacklist(c *fiber.Ctx) error {
	list := blacklist.GetRegistry().GetRecentThreats(15)
	return c.JSON(fiber.Map{
		"success": true,
		"data":    list,
	})
}

func handleGetBlacklistStats(c *fiber.Ctx) error {
	stats := blacklist.GetRegistry().GetStats()
	return c.JSON(fiber.Map{
		"success": true,
		"data":    stats,
	})
}

func handleGetScenarios(c *fiber.Ctx) error {
	scenarios := sandbox.GetCatalog()

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
	blackStats := blacklist.GetRegistry().GetStats()
	return c.JSON(fiber.Map{
		"success": true,
		"data": fiber.Map{
			"total_scenarios":       3,
			"threat_intelligence":   "Aktif (Heuristik Lokal Indonesia 2026)",
			"verified_brands_count": 13,
			"blacklist_entities":    blackStats.TotalEntities,
			"total_threat_reports":  blackStats.TotalReports,
			"supported_channels":    []string{"WhatsApp", "Telegram", "SMS", "Web Browser"},
			"mission":               "Empowering Today's Generation Toward a Safer Cyber Ecosystem",
		},
	})
}
