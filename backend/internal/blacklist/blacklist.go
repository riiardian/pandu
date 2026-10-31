package blacklist

import (
	"database/sql"
	"fmt"
	"log"
	"os"
	"strings"
	"sync"
	"time"

	"github.com/lib/pq"
)

// ThreatType defines the type of blacklisted entity
type ThreatType string

const (
	TypePhone   ThreatType = "phone"
	TypeBank    ThreatType = "bank_account"
	TypeURL     ThreatType = "url"
	TypeEmail   ThreatType = "email"
	TypeAPKHash ThreatType = "apk_hash"
)

// ThreatCategory defines the scam modality
type ThreatCategory string

const (
	CatLokerFreelance  ThreatCategory = "loker_freelance"
	CatKurirAPK        ThreatCategory = "kurir_apk"
	CatPhishingBank    ThreatCategory = "phishing_bank"
	CatImpersonasi     ThreatCategory = "impersonasi"
	CatPinjolIlegal    ThreatCategory = "pinjol_ilegal"
	CatInvestasiBodong ThreatCategory = "investasi_bodong"
	CatMasalahLain     ThreatCategory = "masalah_lain"
)

// BlacklistEntry represents a tracked malicious entity
type BlacklistEntry struct {
	ID             string         `json:"id"`
	Type           ThreatType     `json:"type"`
	Identifier     string         `json:"identifier"`
	CleanKey       string         `json:"clean_key"`
	Category       ThreatCategory `json:"category"`
	RiskLevel      string         `json:"risk_level"`
	ReportCount    int            `json:"report_count"`
	Description    string         `json:"description"`
	ReportedBank   string         `json:"reported_bank,omitempty"`
	AccountHolder  string         `json:"account_holder,omitempty"`
	FirstReported  string         `json:"first_reported"`
	LastReported   string         `json:"last_reported"`
	Verified       bool           `json:"verified"`
	ChronologyTags []string       `json:"chronology_tags"`
}

// ReportRequest is the payload to report a new scammer entity
type ReportRequest struct {
	Type             ThreatType     `json:"type"`
	Identifier       string         `json:"identifier"`
	Category         ThreatCategory `json:"category"`
	ReportedBank     string         `json:"reported_bank"`
	AccountHolder    string         `json:"account_holder"`
	Chronology       string         `json:"chronology"`
	AmountLost       int64          `json:"amount_lost"`
	EvidenceSHA256   string         `json:"evidence_sha256"`
	EvidenceFileName string         `json:"evidence_file_name"`
	EvidenceFilePath string         `json:"evidence_file_path"`
}

type ThreatReport struct {
	ID               string         `json:"id"`
	Type             ThreatType     `json:"type"`
	Identifier       string         `json:"identifier"`
	CleanKey         string         `json:"clean_key"`
	Category         ThreatCategory `json:"category"`
	ReportedBank     string         `json:"reported_bank,omitempty"`
	AccountHolder    string         `json:"account_holder,omitempty"`
	Chronology       string         `json:"chronology"`
	EvidenceFileName string         `json:"evidence_file_name,omitempty"`
	EvidenceFilePath string         `json:"evidence_file_path,omitempty"`
	EvidenceSHA256   string         `json:"evidence_sha256,omitempty"`
	Status           string         `json:"status"` // "pending", "verified", "rejected"
	ClientIP         string         `json:"client_ip,omitempty"`
	CreatedAt        string         `json:"created_at"`
	ReviewedAt       *string        `json:"reviewed_at,omitempty"`
	ReviewNotes      string         `json:"review_notes,omitempty"`
}

type AdminReportStats struct {
	TotalReports    int `json:"total_reports"`
	PendingReports  int `json:"pending_reports"`
	VerifiedReports int `json:"verified_reports"`
	RejectedReports int `json:"rejected_reports"`
}

// BlacklistStats gives summary statistics
type BlacklistStats struct {
	TotalEntities   int            `json:"total_entities"`
	TotalReports    int            `json:"total_reports"`
	CriticalThreats int            `json:"critical_threats"`
	CategoryCounts  map[string]int `json:"category_counts"`
}

// PostgresRegistry implements PostgreSQL-backed storage
type PostgresRegistry struct {
	db *sql.DB
}

var (
	globalRegistry *PostgresRegistry
	once           sync.Once
)

func normalizeKey(s string) string {
	s = strings.ToLower(strings.TrimSpace(s))
	s = strings.ReplaceAll(s, " ", "")
	s = strings.ReplaceAll(s, "-", "")
	s = strings.ReplaceAll(s, "_", "")
	s = strings.ReplaceAll(s, "/", "")
	s = strings.ReplaceAll(s, "https:", "")
	s = strings.ReplaceAll(s, "http:", "")
	s = strings.ReplaceAll(s, "www.", "")
	if strings.HasPrefix(s, "+62") {
		s = "0" + s[3:]
	} else if strings.HasPrefix(s, "62") && len(s) > 8 {
		s = "0" + s[2:]
	}
	return s
}

// InitRegistry connects to PostgreSQL and ensures schema and seed data exist
func InitRegistry(dbURL string) *PostgresRegistry {
	once.Do(func() {
		if dbURL == "" {
			dbURL = os.Getenv("DATABASE_URL")
		}
		if dbURL == "" {
			dbURL = "postgres://localhost:5432/pandu_db?sslmode=disable"
		}

		db, err := sql.Open("postgres", dbURL)
		if err != nil {
			log.Fatalf("Fatal: Cannot open PostgreSQL connection: %v", err)
		}

		db.SetMaxOpenConns(25)
		db.SetMaxIdleConns(10)
		db.SetConnMaxLifetime(5 * time.Minute)

		globalRegistry = &PostgresRegistry{db: db}
		if err := db.Ping(); err != nil {
			log.Printf("Warning: Cannot ping PostgreSQL pandu_db: %v (running in degraded registry mode)", err)
			return
		}

		globalRegistry.ensureSchema()
		log.Println("PANDU PostgreSQL Threat Registry successfully initialized")
	})
	return globalRegistry
}

func GetRegistry() *PostgresRegistry {
	if globalRegistry == nil {
		InitRegistry("")
	}
	return globalRegistry
}

func (r *PostgresRegistry) ensureSchema() {
	query := `
	CREATE TABLE IF NOT EXISTS threat_blacklist (
		id VARCHAR(64) PRIMARY KEY,
		type VARCHAR(32) NOT NULL,
		identifier VARCHAR(255) NOT NULL,
		clean_key VARCHAR(255) NOT NULL UNIQUE,
		category VARCHAR(64) NOT NULL,
		risk_level VARCHAR(32) NOT NULL DEFAULT 'HIGH',
		report_count INT NOT NULL DEFAULT 1,
		description TEXT,
		reported_bank VARCHAR(128),
		account_holder VARCHAR(255),
		first_reported TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
		last_reported TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
		verified BOOLEAN DEFAULT TRUE,
		chronology_tags TEXT[] DEFAULT '{}',
		created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
	);

	CREATE INDEX IF NOT EXISTS idx_threat_clean_key ON threat_blacklist(clean_key);
	CREATE INDEX IF NOT EXISTS idx_threat_type ON threat_blacklist(type);
	CREATE INDEX IF NOT EXISTS idx_threat_category ON threat_blacklist(category);
	CREATE INDEX IF NOT EXISTS idx_threat_risk_level ON threat_blacklist(risk_level);
	`
	if _, err := r.db.Exec(query); err != nil {
		log.Printf("Warning: Failed to ensure PostgreSQL schema: %v", err)
	}
}

// CheckBlacklistByType performs exact, type-scoped matching.
func (r *PostgresRegistry) CheckBlacklistByType(threatType ThreatType, query string) (*BlacklistEntry, bool) {
	if r == nil || r.db == nil {
		return nil, false
	}
	clean := normalizeKey(query)
	if clean == "" {
		return nil, false
	}

	querySQL := `
		SELECT id, type, identifier, clean_key, category, risk_level, report_count,
		       COALESCE(description, ''), COALESCE(reported_bank, ''), COALESCE(account_holder, ''),
		       to_char(first_reported, 'YYYY-MM-DD HH24:MI:SS'),
		       to_char(last_reported, 'YYYY-MM-DD HH24:MI:SS'),
		       verified, chronology_tags
		FROM threat_blacklist
		WHERE type = $1 AND clean_key = $2
		ORDER BY verified DESC, report_count DESC
		LIMIT 1
	`

	var entry BlacklistEntry
	var tags []string
	err := r.db.QueryRow(querySQL, threatType, clean).Scan(
		&entry.ID,
		&entry.Type,
		&entry.Identifier,
		&entry.CleanKey,
		&entry.Category,
		&entry.RiskLevel,
		&entry.ReportCount,
		&entry.Description,
		&entry.ReportedBank,
		&entry.AccountHolder,
		&entry.FirstReported,
		&entry.LastReported,
		&entry.Verified,
		pq.Array(&tags),
	)

	if err != nil {
		return nil, false
	}

	entry.ChronologyTags = tags
	return &entry, true
}

// CheckBlacklist is retained for the generic lookup endpoint, but only exact canonical keys match.
func (r *PostgresRegistry) CheckBlacklist(query string) (*BlacklistEntry, bool) {
	clean := normalizeKey(query)
	if clean == "" {
		return nil, false
	}
	for _, threatType := range []ThreatType{TypePhone, TypeBank, TypeURL, TypeEmail, TypeAPKHash} {
		if entry, found := r.CheckBlacklistByType(threatType, query); found {
			return entry, true
		}
	}
	return nil, false
}

// ReportThreat adds a pending community report or updates an existing pending entry.
func (r *PostgresRegistry) ReportThreat(req ReportRequest) (*BlacklistEntry, bool) {
	clean := normalizeKey(req.Identifier)
	if clean == "" {
		return nil, false
	}

	// 1. Try to increment report_count if already exists
	updateSQL := `
		UPDATE threat_blacklist
		SET report_count = report_count + 1,
		    last_reported = CURRENT_TIMESTAMP,
		    chronology_tags = array_append(chronology_tags, 'laporan_terkini')
		WHERE clean_key = $1
		RETURNING id, type, identifier, clean_key, category, risk_level, report_count,
		          COALESCE(description, ''), COALESCE(reported_bank, ''), COALESCE(account_holder, ''),
		          to_char(first_reported, 'YYYY-MM-DD HH24:MI:SS'),
		          to_char(last_reported, 'YYYY-MM-DD HH24:MI:SS'),
		          verified, chronology_tags
	`

	var entry BlacklistEntry
	var tags []string
	err := r.db.QueryRow(updateSQL, clean).Scan(
		&entry.ID,
		&entry.Type,
		&entry.Identifier,
		&entry.CleanKey,
		&entry.Category,
		&entry.RiskLevel,
		&entry.ReportCount,
		&entry.Description,
		&entry.ReportedBank,
		&entry.AccountHolder,
		&entry.FirstReported,
		&entry.LastReported,
		&entry.Verified,
		pq.Array(&tags),
	)

	if err == nil {
		entry.ChronologyTags = tags
		return &entry, false // updated existing
	}

	// 2. Insert new record
	risk := "HIGH"
	if req.Category == CatKurirAPK || req.Category == CatPhishingBank || req.Category == CatLokerFreelance {
		risk = "CRITICAL"
	}

	id := fmt.Sprintf("THREAT-%d", time.Now().UnixNano()%100000000)
	initialTags := []string{"laporan_komunitas", string(req.Category)}

	insertSQL := `
		INSERT INTO threat_blacklist (
			id, type, identifier, clean_key, category, risk_level, report_count,
			description, reported_bank, account_holder, verified, chronology_tags
		) VALUES ($1, $2, $3, $4, $5, $6, 1, $7, $8, '', FALSE, $9)
		RETURNING id, type, identifier, clean_key, category, risk_level, report_count,
		          COALESCE(description, ''), COALESCE(reported_bank, ''), COALESCE(account_holder, ''),
		          to_char(first_reported, 'YYYY-MM-DD HH24:MI:SS'),
		          to_char(last_reported, 'YYYY-MM-DD HH24:MI:SS'),
		          verified, chronology_tags
	`

	err = r.db.QueryRow(
		insertSQL,
		id, req.Type, req.Identifier, clean, req.Category, risk,
		req.Chronology, req.ReportedBank, pq.Array(initialTags),
	).Scan(
		&entry.ID,
		&entry.Type,
		&entry.Identifier,
		&entry.CleanKey,
		&entry.Category,
		&entry.RiskLevel,
		&entry.ReportCount,
		&entry.Description,
		&entry.ReportedBank,
		&entry.AccountHolder,
		&entry.FirstReported,
		&entry.LastReported,
		&entry.Verified,
		pq.Array(&tags),
	)

	if err != nil {
		log.Printf("Error inserting into PostgreSQL threat_blacklist: %v", err)
		return nil, false
	}

	entry.ChronologyTags = tags
	return &entry, true
}

// GetRecentThreats queries the latest blacklisted threats from PostgreSQL
func (r *PostgresRegistry) GetRecentThreats(limit int) []*BlacklistEntry {
	if limit <= 0 {
		limit = 10
	}

	querySQL := `
		SELECT id, type, identifier, clean_key, category, risk_level, report_count,
		       COALESCE(description, ''), COALESCE(reported_bank, ''), COALESCE(account_holder, ''),
		       to_char(first_reported, 'YYYY-MM-DD HH24:MI:SS'),
		       to_char(last_reported, 'YYYY-MM-DD HH24:MI:SS'),
		       verified, chronology_tags
		FROM threat_blacklist
		ORDER BY last_reported DESC
		LIMIT $1
	`

	rows, err := r.db.Query(querySQL, limit)
	if err != nil {
		return []*BlacklistEntry{}
	}
	defer rows.Close()

	list := make([]*BlacklistEntry, 0)
	for rows.Next() {
		var entry BlacklistEntry
		var tags []string
		if err := rows.Scan(
			&entry.ID,
			&entry.Type,
			&entry.Identifier,
			&entry.CleanKey,
			&entry.Category,
			&entry.RiskLevel,
			&entry.ReportCount,
			&entry.Description,
			&entry.ReportedBank,
			&entry.AccountHolder,
			&entry.FirstReported,
			&entry.LastReported,
			&entry.Verified,
			pq.Array(&tags),
		); err == nil {
			entry.ChronologyTags = tags
			list = append(list, &entry)
		}
	}

	return list
}

// GetStats aggregates statistics directly from PostgreSQL
func (r *PostgresRegistry) GetStats() BlacklistStats {
	var stats BlacklistStats
	stats.CategoryCounts = make(map[string]int)

	row := r.db.QueryRow(`
		SELECT COUNT(*), COALESCE(SUM(report_count), 0), COUNT(*) FILTER (WHERE risk_level = 'CRITICAL')
		FROM threat_blacklist
	`)
	_ = row.Scan(&stats.TotalEntities, &stats.TotalReports, &stats.CriticalThreats)

	rows, err := r.db.Query(`
		SELECT category, COUNT(*)
		FROM threat_blacklist
		GROUP BY category
	`)
	if err == nil {
		defer rows.Close()
		for rows.Next() {
			var cat string
			var count int
			if err := rows.Scan(&cat, &count); err == nil {
				stats.CategoryCounts[cat] = count
			}
		}
	}

	return stats
}

// CreateReport records an incoming user fraud report with authentic evidence file metadata.
func (r *PostgresRegistry) CreateReport(req ReportRequest, clientIP string) (*ThreatReport, error) {
	clean := normalizeKey(req.Identifier)
	if clean == "" {
		return nil, fmt.Errorf("Identitas target tidak valid")
	}

	id := fmt.Sprintf("REP-%s-%04d", time.Now().Format("20060102"), time.Now().UnixNano()%10000)

	query := `
		INSERT INTO threat_reports (
			id, type, identifier, clean_key, category, reported_bank, account_holder,
			chronology, evidence_file_name, evidence_file_path, evidence_sha256,
			status, client_ip
		) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 'pending', $12)
		RETURNING id, type, identifier, clean_key, category,
		          COALESCE(reported_bank, ''), COALESCE(account_holder, ''),
		          COALESCE(chronology, ''), COALESCE(evidence_file_name, ''),
		          COALESCE(evidence_file_path, ''), COALESCE(evidence_sha256, ''),
		          status, COALESCE(client_ip, ''),
		          to_char(created_at, 'YYYY-MM-DD HH24:MI:SS')
	`

	var rep ThreatReport
	err := r.db.QueryRow(
		query,
		id, req.Type, req.Identifier, clean, req.Category,
		req.ReportedBank, req.AccountHolder, req.Chronology,
		req.EvidenceFileName, req.EvidenceFilePath, req.EvidenceSHA256,
		clientIP,
	).Scan(
		&rep.ID, &rep.Type, &rep.Identifier, &rep.CleanKey, &rep.Category,
		&rep.ReportedBank, &rep.AccountHolder, &rep.Chronology,
		&rep.EvidenceFileName, &rep.EvidenceFilePath, &rep.EvidenceSHA256,
		&rep.Status, &rep.ClientIP, &rep.CreatedAt,
	)

	if err != nil {
		log.Printf("Error inserting into threat_reports: %v", err)
		return nil, err
	}

	// Also increment community report counter in threat_blacklist
	r.ReportThreat(req)

	return &rep, nil
}

// GetReports retrieves reports filtered by status with pagination.
func (r *PostgresRegistry) GetReports(status string, limit int, offset int) ([]ThreatReport, int, error) {
	if limit <= 0 || limit > 100 {
		limit = 50
	}
	if offset < 0 {
		offset = 0
	}

	var countQuery string
	var listQuery string
	var countArgs []interface{}
	var listArgs []interface{}

	if status != "" && status != "all" {
		countQuery = `SELECT COUNT(*) FROM threat_reports WHERE status = $1`
		countArgs = append(countArgs, status)

		listQuery = `
			SELECT id, type, identifier, clean_key, category,
			       COALESCE(reported_bank, ''), COALESCE(account_holder, ''),
			       COALESCE(chronology, ''), COALESCE(evidence_file_name, ''),
			       COALESCE(evidence_file_path, ''), COALESCE(evidence_sha256, ''),
			       status, COALESCE(client_ip, ''),
			       to_char(created_at, 'YYYY-MM-DD HH24:MI:SS'),
			       to_char(reviewed_at, 'YYYY-MM-DD HH24:MI:SS'),
			       COALESCE(review_notes, '')
			FROM threat_reports
			WHERE status = $1
			ORDER BY created_at DESC
			LIMIT $2 OFFSET $3
		`
		listArgs = append(listArgs, status, limit, offset)
	} else {
		countQuery = `SELECT COUNT(*) FROM threat_reports`

		listQuery = `
			SELECT id, type, identifier, clean_key, category,
			       COALESCE(reported_bank, ''), COALESCE(account_holder, ''),
			       COALESCE(chronology, ''), COALESCE(evidence_file_name, ''),
			       COALESCE(evidence_file_path, ''), COALESCE(evidence_sha256, ''),
			       status, COALESCE(client_ip, ''),
			       to_char(created_at, 'YYYY-MM-DD HH24:MI:SS'),
			       to_char(reviewed_at, 'YYYY-MM-DD HH24:MI:SS'),
			       COALESCE(review_notes, '')
			FROM threat_reports
			ORDER BY created_at DESC
			LIMIT $1 OFFSET $2
		`
		listArgs = append(listArgs, limit, offset)
	}

	var total int
	if err := r.db.QueryRow(countQuery, countArgs...).Scan(&total); err != nil {
		return nil, 0, err
	}

	rows, err := r.db.Query(listQuery, listArgs...)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	var reports []ThreatReport
	for rows.Next() {
		var rep ThreatReport
		var revAt sql.NullString
		err := rows.Scan(
			&rep.ID, &rep.Type, &rep.Identifier, &rep.CleanKey, &rep.Category,
			&rep.ReportedBank, &rep.AccountHolder, &rep.Chronology,
			&rep.EvidenceFileName, &rep.EvidenceFilePath, &rep.EvidenceSHA256,
			&rep.Status, &rep.ClientIP, &rep.CreatedAt,
			&revAt, &rep.ReviewNotes,
		)
		if err == nil {
			if revAt.Valid {
				v := revAt.String
				rep.ReviewedAt = &v
			}
			reports = append(reports, rep)
		}
	}

	return reports, total, nil
}

// GetReportByID returns a single report by ID.
func (r *PostgresRegistry) GetReportByID(id string) (*ThreatReport, error) {
	query := `
		SELECT id, type, identifier, clean_key, category,
		       COALESCE(reported_bank, ''), COALESCE(account_holder, ''),
		       COALESCE(chronology, ''), COALESCE(evidence_file_name, ''),
		       COALESCE(evidence_file_path, ''), COALESCE(evidence_sha256, ''),
		       status, COALESCE(client_ip, ''),
		       to_char(created_at, 'YYYY-MM-DD HH24:MI:SS'),
		       to_char(reviewed_at, 'YYYY-MM-DD HH24:MI:SS'),
		       COALESCE(review_notes, '')
		FROM threat_reports
		WHERE id = $1
		LIMIT 1
	`

	var rep ThreatReport
	var revAt sql.NullString
	err := r.db.QueryRow(query, id).Scan(
		&rep.ID, &rep.Type, &rep.Identifier, &rep.CleanKey, &rep.Category,
		&rep.ReportedBank, &rep.AccountHolder, &rep.Chronology,
		&rep.EvidenceFileName, &rep.EvidenceFilePath, &rep.EvidenceSHA256,
		&rep.Status, &rep.ClientIP, &rep.CreatedAt,
		&revAt, &rep.ReviewNotes,
	)
	if err != nil {
		return nil, err
	}

	if revAt.Valid {
		v := revAt.String
		rep.ReviewedAt = &v
	}

	return &rep, nil
}

// VerifyReport marks a report as verified and synchronizes it into the official blacklist registry.
func (r *PostgresRegistry) VerifyReport(id string, notes string) (*ThreatReport, error) {
	rep, err := r.GetReportByID(id)
	if err != nil {
		return nil, fmt.Errorf("Laporan tidak ditemukan: %w", err)
	}

	query := `
		UPDATE threat_reports
		SET status = 'verified',
		    reviewed_at = CURRENT_TIMESTAMP,
		    review_notes = $2
		WHERE id = $1
		RETURNING to_char(reviewed_at, 'YYYY-MM-DD HH24:MI:SS')
	`

	var revAt string
	if err := r.db.QueryRow(query, id, notes).Scan(&revAt); err != nil {
		return nil, err
	}

	rep.Status = "verified"
	rep.ReviewedAt = &revAt
	rep.ReviewNotes = notes

	// Elevate verification in threat_blacklist
	updateBlacklistSQL := `
		UPDATE threat_blacklist
		SET verified = TRUE,
		    risk_level = 'CRITICAL',
		    last_reported = CURRENT_TIMESTAMP,
		    chronology_tags = array_append(chronology_tags, 'terverifikasi_admin')
		WHERE clean_key = $1
	`
	_, _ = r.db.Exec(updateBlacklistSQL, rep.CleanKey)

	return rep, nil
}

// RejectReport marks a report as rejected with optional notes.
func (r *PostgresRegistry) RejectReport(id string, notes string) (*ThreatReport, error) {
	rep, err := r.GetReportByID(id)
	if err != nil {
		return nil, fmt.Errorf("Laporan tidak ditemukan: %w", err)
	}

	query := `
		UPDATE threat_reports
		SET status = 'rejected',
		    reviewed_at = CURRENT_TIMESTAMP,
		    review_notes = $2
		WHERE id = $1
		RETURNING to_char(reviewed_at, 'YYYY-MM-DD HH24:MI:SS')
	`

	var revAt string
	if err := r.db.QueryRow(query, id, notes).Scan(&revAt); err != nil {
		return nil, err
	}

	rep.Status = "rejected"
	rep.ReviewedAt = &revAt
	rep.ReviewNotes = notes

	return rep, nil
}

// GetAdminReportStats returns aggregated report count by status.
func (r *PostgresRegistry) GetAdminReportStats() (*AdminReportStats, error) {
	query := `
		SELECT
			COUNT(*),
			COUNT(*) FILTER (WHERE status = 'pending'),
			COUNT(*) FILTER (WHERE status = 'verified'),
			COUNT(*) FILTER (WHERE status = 'rejected')
		FROM threat_reports
	`

	var s AdminReportStats
	err := r.db.QueryRow(query).Scan(&s.TotalReports, &s.PendingReports, &s.VerifiedReports, &s.RejectedReports)
	if err != nil {
		return nil, err
	}

	return &s, nil
}
