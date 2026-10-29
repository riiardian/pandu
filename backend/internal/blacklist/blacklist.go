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
	Type          ThreatType     `json:"type"`
	Identifier    string         `json:"identifier"`
	Category      ThreatCategory `json:"category"`
	ReportedBank  string         `json:"reported_bank"`
	AccountHolder string         `json:"account_holder"`
	Chronology    string         `json:"chronology"`
	AmountLost    int64          `json:"amount_lost"`
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
			dbURL = "postgres://pandu_user:pandu_secure_pass_2026@127.0.0.1:5432/pandu_db?sslmode=disable"
		}

		db, err := sql.Open("postgres", dbURL)
		if err != nil {
			log.Fatalf("Fatal: Cannot open PostgreSQL connection: %v", err)
		}

		db.SetMaxOpenConns(25)
		db.SetMaxIdleConns(10)
		db.SetConnMaxLifetime(5 * time.Minute)

		if err := db.Ping(); err != nil {
			log.Fatalf("Fatal: Cannot ping PostgreSQL pandu_db: %v", err)
		}

		globalRegistry = &PostgresRegistry{db: db}
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
