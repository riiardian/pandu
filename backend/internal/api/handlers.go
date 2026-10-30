package api

import (
	"context"
	"fmt"
	"io"
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

// ScanPhoneRequest payload (legacy handler kept for compatibility tests; route is intentionally not exposed)
type ScanPhoneRequest struct {
	Phone string `json:"phone"`
}

// ScanBankRequest payload (legacy handler kept for compatibility tests; route is intentionally not exposed)
type ScanBankRequest struct {
	BankName      string `json:"bank_name"`
	AccountNumber string `json:"account_number"`
}

// ScanEmailRequest payload
type ScanEmailRequest struct {
	Email string `json:"email"`
}

// ScanFileRequest payload
type ScanFileRequest struct {
	FileName string `json:"file_name"`
	FileSize int64  `json:"file_size"`
}

func registrySource(name, attributionURL string, entry *blacklist.BlacklistEntry, found bool) scanner.SourceResult {
	result := scanner.NewSourceResult("pandu_registry", name)
	result.Status = scanner.SourceQueried
	result.Outcome = scanner.OutcomeNoMatch
	result.AttributionURL = attributionURL
	result.Limitation = "Registri internal hanya memuat laporan yang sudah diverifikasi. Tidak ditemukannya catatan bukan jaminan keamanan."
	if found && entry != nil && entry.Verified {
		result.Outcome = scanner.OutcomeMatch
		result.Matches = entry.ReportCount
		result.Evidence = append(result.Evidence,
			scanner.EvidenceItem{Label: "Kategori", Value: string(entry.Category)},
			scanner.EvidenceItem{Label: "Laporan terverifikasi", Value: fmt.Sprintf("%d", entry.ReportCount), ObservedAt: entry.LastReported},
		)
	}
	return result
}

func unavailableOfficialSource(id, name, sourceURL, limitation string) scanner.SourceResult {
	result := scanner.NewSourceResult(id, name)
	result.Status = scanner.SourceUnavailable
	result.Outcome = scanner.OutcomeUnknown
	result.AttributionURL = sourceURL
	result.ErrorCategory = "no_public_api"
	result.Limitation = limitation
	return result
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

	// Pillar 1: Recognize (Scanner - Autonomous Multi-Vector Engine)
	v1.Post("/scan/text", handleScanText)
	v1.Post("/scan/url", handleScanURL)
	v1.Post("/scan/phone", handleScanPhone)
	v1.Post("/scan/bank", handleScanBank)
	v1.Post("/scan/email", handleScanEmail)
	v1.Post("/scan/file", handleScanFile)

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
	if matchedEntry, found := reg.CheckBlacklistByType(blacklist.TypeURL, req.URL); found && matchedEntry.Verified {
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

func handleScanPhone(c *fiber.Ctx) error {
	var req ScanPhoneRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "Format body JSON tidak valid",
		})
	}

	result := scanner.AnalyzePhone(req.Phone)

	reg := blacklist.GetRegistry()
	matchedEntry, found := reg.CheckBlacklistByType(blacklist.TypePhone, req.Phone)
	result.Sources = append(result.Sources, registrySource("Registri Ancaman & Rekam Laporan", "https://pandu.web.id/aksi", matchedEntry, found))

	// Live Web Footprint OSINT (Real-time public scam & fraud search)
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	webFootprint := scanner.QueryWebFootprint(ctx, "phone", req.Phone)
	cancel()
	result.Sources = append(result.Sources, webFootprint)
	result.Coverage, result.CoverageSummary = scanner.SummarizeCoverage(result.Sources)

	if found && matchedEntry.Verified {
		result.RiskScore = 98
		result.ThreatLevel = "KRITIS / NOMOR TERDAFTAR DI DAFTAR HITAM"
		result.BlacklistEntry = matchedEntry
		result.RedFlags = append([]scanner.RedFlag{
			{
				Level:       "CRITICAL",
				Title:       "Nomor Terdaftar di Basis Data Daftar Hitam PANDU",
				Explanation: fmt.Sprintf("Nomor ini telah dilaporkan %d kali oleh masyarakat terkait kasus: %s (Kategori: %s)", matchedEntry.ReportCount, matchedEntry.Description, matchedEntry.Category),
				Snippet:     matchedEntry.Identifier,
			},
		}, result.RedFlags...)
	} else if webFootprint.Outcome == scanner.OutcomeMatch && len(webFootprint.Evidence) > 0 {
		result.RiskScore = 75
		result.ThreatLevel = "WASPADA TINGGI / DITEMUKAN JEJAK ADUAN PUBLIK"
		for _, ev := range webFootprint.Evidence {
			result.RedFlags = append(result.RedFlags, scanner.RedFlag{
				Level:       "HIGH",
				Title:       ev.Label,
				Explanation: ev.Value,
				Snippet:     req.Phone,
			})
		}
	} else {
		result.RiskScore = 0
		result.ThreatLevel = "BERSIH / TIDAK DITEMUKAN CATATAN LAPORAN"
		result.Recommendations = append(result.Recommendations, "Nomor belum memiliki riwayat aduan penipuan pada basis data PANDU maupun penelusuran web terbuka.")
	}

	return c.JSON(fiber.Map{
		"success": true,
		"data":    result,
	})
}

func handleScanBank(c *fiber.Ctx) error {
	var req ScanBankRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "Format body JSON tidak valid",
		})
	}

	result := scanner.AnalyzeBank(req.BankName, req.AccountNumber)

	reg := blacklist.GetRegistry()
	checkKey := req.AccountNumber
	matchedEntry, found := reg.CheckBlacklistByType(blacklist.TypeBank, checkKey)
	result.Sources = append(result.Sources, registrySource("Registri Ancaman & Rekam Laporan", "https://pandu.web.id/aksi", matchedEntry, found))

	// Live Web Footprint OSINT (Real-time public complaint lookup for account)
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	webFootprint := scanner.QueryWebFootprint(ctx, "bank", req.BankName+" "+req.AccountNumber)
	cancel()
	result.Sources = append(result.Sources, webFootprint)
	result.Coverage, result.CoverageSummary = scanner.SummarizeCoverage(result.Sources)

	if found && matchedEntry.Verified {
		result.RiskScore = 99
		result.ThreatLevel = "KRITIS / REKENING PENAMPUNG TERDAFTAR"
		result.ReportStatus = fmt.Sprintf("Terdaftar %d Laporan Kejahatan", matchedEntry.ReportCount)
		result.TotalReports = matchedEntry.ReportCount
		result.AccountHolder = matchedEntry.AccountHolder
		result.BlacklistEntry = matchedEntry
		result.RedFlags = append([]scanner.RedFlag{
			{
				Level:       "CRITICAL",
				Title:       "Rekening Masuk Daftar Hitam Laporan Penipuan",
				Explanation: fmt.Sprintf("Rekening terdaftar atas nama '%s' (%s) telah dilaporkan %d kali oleh korban tindak pidana: %s", matchedEntry.AccountHolder, matchedEntry.ReportedBank, matchedEntry.ReportCount, matchedEntry.Description),
				Snippet:     matchedEntry.Identifier,
			},
		}, result.RedFlags...)
	} else if webFootprint.Outcome == scanner.OutcomeMatch && len(webFootprint.Evidence) > 0 {
		result.RiskScore = 80
		result.ThreatLevel = "WASPADA / REKENING DILAPORKAN DI WEB TERBUKA"
		result.ReportStatus = fmt.Sprintf("Ditemukan %d Catatan Jejak Aduan Publik di Web", webFootprint.Matches)
		for _, ev := range webFootprint.Evidence {
			result.RedFlags = append(result.RedFlags, scanner.RedFlag{
				Level:       "HIGH",
				Title:       ev.Label,
				Explanation: ev.Value,
				Snippet:     req.AccountNumber,
			})
		}
	} else {
		result.ReportStatus = "Belum Ada Catatan Laporan Kejahatan"
		result.TotalReports = 0
		result.RiskScore = 0
		result.ThreatLevel = "BERSIH / TIDAK DITEMUKAN CATATAN LAPORAN"
	}

	return c.JSON(fiber.Map{
		"success": true,
		"data":    result,
	})
}

func handleScanEmail(c *fiber.Ctx) error {
	var req ScanEmailRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "Format body JSON tidak valid",
		})
	}

	result := scanner.AnalyzeEmail(req.Email)

	// Cross-check against PostgreSQL Blacklist Registry
	reg := blacklist.GetRegistry()
	matchedEntry, found := reg.CheckBlacklistByType(blacklist.TypeEmail, req.Email)
	result.Sources = append(result.Sources, registrySource("Registri Ancaman & Rekam Laporan", "https://pandu.web.id/aksi", matchedEntry, found))

	// Live Web Footprint OSINT for email address
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	webFootprint := scanner.QueryWebFootprint(ctx, "email", req.Email)
	cancel()
	result.Sources = append(result.Sources, webFootprint)
	result.Coverage, result.CoverageSummary = scanner.SummarizeCoverage(result.Sources)

	if found && matchedEntry.Verified {
		result.RiskScore = 98
		result.ThreatLevel = "KRITIS / EMAIL SPAM TERDAFTAR"
		result.BlacklistEntry = matchedEntry
		result.RedFlags = append([]scanner.RedFlag{
			{
				Level:       "CRITICAL",
				Title:       "Email Terdaftar dalam Basis Data Ancaman PANDU",
				Explanation: fmt.Sprintf("Alamat email ini dilaporkan %d kali terlibat dalam aksi: %s", matchedEntry.ReportCount, matchedEntry.Description),
				Snippet:     matchedEntry.Identifier,
			},
		}, result.RedFlags...)
	} else if webFootprint.Outcome == scanner.OutcomeMatch && len(webFootprint.Evidence) > 0 {
		if result.RiskScore < 70 {
			result.RiskScore = 70
			result.ThreatLevel = "WASPADA / EMAIL DILAPORKAN DI WEB TERBUKA"
		}
		for _, ev := range webFootprint.Evidence {
			result.RedFlags = append(result.RedFlags, scanner.RedFlag{
				Level:       "HIGH",
				Title:       ev.Label,
				Explanation: ev.Value,
				Snippet:     req.Email,
			})
		}
	} else if len(result.RedFlags) == 0 && result.RiskScore < 30 {
		result.RiskScore = 0
		result.ThreatLevel = "BERSIH / TIDAK DITEMUKAN CATATAN LAPORAN"
	}

	return c.JSON(fiber.Map{
		"success": true,
		"data":    result,
	})
}

func handleScanFile(c *fiber.Ctx) error {
	if !strings.HasPrefix(strings.ToLower(c.Get("Content-Type")), "multipart/form-data") {
		return c.Status(fiber.StatusUnsupportedMediaType).JSON(fiber.Map{
			"success": false,
			"message": "Unggah byte berkas asli menggunakan multipart/form-data.",
		})
	}
	fileHeader, err := c.FormFile("file")
	if err != nil || fileHeader == nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"success": false, "message": "Berkas wajib dipilih."})
	}
	const maxFileBytes = 5 * 1024 * 1024
	if fileHeader.Size <= 0 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"success": false, "message": "Berkas kosong tidak dapat dianalisis."})
	}
	if fileHeader.Size > maxFileBytes {
		return c.Status(fiber.StatusRequestEntityTooLarge).JSON(fiber.Map{"success": false, "message": "Ukuran berkas maksimal 5 MB."})
	}
	file, err := fileHeader.Open()
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"success": false, "message": "Berkas tidak dapat dibuka."})
	}
	defer file.Close()
	content, err := io.ReadAll(io.LimitReader(file, maxFileBytes+1))
	if err != nil || len(content) == 0 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"success": false, "message": "Byte berkas tidak dapat dibaca."})
	}
	if len(content) > maxFileBytes {
		return c.Status(fiber.StatusRequestEntityTooLarge).JSON(fiber.Map{"success": false, "message": "Ukuran berkas maksimal 5 MB."})
	}

	result := scanner.AnalyzeFile(fileHeader.Filename, int64(len(content)), content)
	reg := blacklist.GetRegistry()
	if matchedEntry, found := reg.CheckBlacklistByType(blacklist.TypeAPKHash, result.SHA256); found && matchedEntry.Verified {
		result.RiskScore = 99
		result.ThreatLevel = "HASH TERCATAT PADA REGISTRI TERVERIFIKASI"
		result.BlacklistEntry = matchedEntry
		result.RedFlags = append([]scanner.RedFlag{{Level: "CRITICAL", Title: "Hash berkas cocok dengan registri PANDU", Explanation: matchedEntry.Description, Snippet: result.SHA256}}, result.RedFlags...)
	}

	return c.JSON(fiber.Map{"success": true, "data": result})
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
