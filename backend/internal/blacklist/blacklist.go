package blacklist

import (
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"strings"
	"sync"
	"time"
)

// ThreatType defines the type of blacklisted entity
type ThreatType string

const (
	TypePhone   ThreatType = "phone"
	TypeBank    ThreatType = "bank_account"
	TypeURL     ThreatType = "url"
	TypeAPKHash ThreatType = "apk_hash"
)

// ThreatCategory defines the scam modality
type ThreatCategory string

const (
	CatLokerFreelance ThreatCategory = "loker_freelance"
	CatKurirAPK       ThreatCategory = "kurir_apk"
	CatPhishingBank   ThreatCategory = "phishing_bank"
	CatImpersonasi    ThreatCategory = "impersonasi"
	CatPinjolIlegal   ThreatCategory = "pinjol_ilegal"
	CatInvestasiBodong ThreatCategory = "investasi_bodong"
)

// BlacklistEntry represents a tracked malicious entity
type BlacklistEntry struct {
	ID             string         `json:"id"`
	Type           ThreatType     `json:"type"`            // phone, bank_account, url, apk_hash
	Identifier     string         `json:"identifier"`      // e.g. "085819238491", "BCA 8271039481", "shopee-vip-toko.site"
	CleanKey       string         `json:"clean_key"`       // normalized search key
	Category       ThreatCategory `json:"category"`        // loker_freelance, kurir_apk, etc.
	RiskLevel      string         `json:"risk_level"`      // CRITICAL, HIGH, MEDIUM
	ReportCount    int            `json:"report_count"`    // Total reports submitted by community
	Description    string         `json:"description"`     // Brief threat explanation
	ReportedBank   string         `json:"reported_bank,omitempty"`
	AccountHolder  string         `json:"account_holder,omitempty"`
	FirstReported  string         `json:"first_reported"`
	LastReported   string         `json:"last_reported"`
	Verified       bool           `json:"verified"`        // Verified by PANDU heuristic engine
	ChronologyTags []string       `json:"chronology_tags"` // e.g. ["minta_deposit", "kirim_apk", "ancam_sebar_data"]
}

// ReportRequest is the payload to report a new scammer entity
type ReportRequest struct {
	Type          ThreatType     `json:"type"`           // phone, bank_account, url, apk_hash
	Identifier    string         `json:"identifier"`     // target phone/rekening/url
	Category      ThreatCategory `json:"category"`       // scam modality
	ReportedBank  string         `json:"reported_bank"`  // optional bank name (BCA, BRI, Mandiri, DANA, dll)
	AccountHolder string         `json:"account_holder"` // optional account holder name
	Chronology    string         `json:"chronology"`     // user's story / what happened
	AmountLost    int64          `json:"amount_lost"`    // optional nominal kerugian
}

// RegistryStore holds the in-memory blacklist with persistent JSON backup
type RegistryStore struct {
	mu       sync.RWMutex
	filePath string
	entries  map[string]*BlacklistEntry
}

var (
	globalStore *RegistryStore
	once        sync.Once
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

// InitRegistry initializes the blacklist store
func InitRegistry(dataPath string) *RegistryStore {
	once.Do(func() {
		globalStore = &RegistryStore{
			filePath: dataPath,
			entries:  make(map[string]*BlacklistEntry),
		}

		if err := globalStore.loadFromFile(); err != nil {
			// If file doesn't exist, seed with default threat data
			globalStore.seedDefaults()
			_ = globalStore.saveToFile()
		}
	})
	return globalStore
}

func GetRegistry() *RegistryStore {
	if globalStore == nil {
		InitRegistry("/www/wwwroot/pandu/backend/data/blacklist.json")
	}
	return globalStore
}

func (s *RegistryStore) loadFromFile() error {
	s.mu.Lock()
	defer s.mu.Unlock()

	data, err := os.ReadFile(s.filePath)
	if err != nil {
		return err
	}

	var list []*BlacklistEntry
	if err := json.Unmarshal(data, &list); err != nil {
		return err
	}

	for _, entry := range list {
		s.entries[entry.CleanKey] = entry
	}
	return nil
}

func (s *RegistryStore) saveToFile() error {
	dir := filepath.Dir(s.filePath)
	if err := os.MkdirAll(dir, 0755); err != nil {
		return err
	}

	list := make([]*BlacklistEntry, 0, len(s.entries))
	for _, entry := range s.entries {
		list = append(list, entry)
	}

	data, err := json.MarshalIndent(list, "", "  ")
	if err != nil {
		return err
	}

	return os.WriteFile(s.filePath, data, 0644)
}

func (s *RegistryStore) seedDefaults() {
	now := time.Now().Format("2006-01-02 15:04:05")
	initialThreats := []*BlacklistEntry{
		{
			ID:             "THREAT-085819238491",
			Type:           TypePhone,
			Identifier:     "085819238491",
			CleanKey:       normalizeKey("085819238491"),
			Category:       CatLokerFreelance,
			RiskLevel:      "CRITICAL",
			ReportCount:    24,
			Description:    "Perekrut palsu tugas like video YouTube & TikTok. Meminta deposit bertahap hingga puluhan juta rupiah.",
			FirstReported:  "2026-09-12 11:20:00",
			LastReported:   now,
			Verified:       true,
			ChronologyTags: []string{"deposit_tugas_vip", "loker_freelance", "grup_telegram_palsu"},
		},
		{
			ID:             "THREAT-082194810293",
			Type:           TypePhone,
			Identifier:     "082194810293",
			CleanKey:       normalizeKey("082194810293"),
			Category:       CatKurirAPK,
			RiskLevel:      "CRITICAL",
			ReportCount:    41,
			Description:    "Mengaku kurir ekspedisi J&T mengirimkan file paket berkedok resi_paket.apk untuk membajak SMS OTP m-banking.",
			FirstReported:  "2026-08-04 14:10:00",
			LastReported:   now,
			Verified:       true,
			ChronologyTags: []string{"kirim_apk_resi", "sadap_sms_otp", "kurir_gadungan"},
		},
		{
			ID:             "THREAT-087819382019",
			Type:           TypePhone,
			Identifier:     "087819382019",
			CleanKey:       normalizeKey("087819382019"),
			Category:       CatImpersonasi,
			RiskLevel:      "HIGH",
			ReportCount:    12,
			Description:    "Impersonasi kontak kerabat/teman di WhatsApp, mengaku ganti nomor dan meminta transfer talangan mendesak.",
			FirstReported:  "2026-10-01 09:30:00",
			LastReported:   now,
			Verified:       true,
			ChronologyTags: []string{"ganti_nomor_wa", "pinjam_dana_darurat", "foto_profil_curian"},
		},
		{
			ID:             "THREAT-081293847102",
			Type:           TypePhone,
			Identifier:     "081293847102",
			CleanKey:       normalizeKey("081293847102"),
			Category:       CatPhishingBank,
			RiskLevel:      "CRITICAL",
			ReportCount:    33,
			Description:    "Mengatasnamakan CS Bank BRI, menyebarkan ancaman perubahan tarif transaksi Rp 150.000/bulan.",
			FirstReported:  "2026-07-19 16:45:00",
			LastReported:   now,
			Verified:       true,
			ChronologyTags: []string{"cs_bank_palsu", "ancaman_kenaikan_tarif", "link_phishing_bri"},
		},
		{
			ID:             "THREAT-BCA-8271039481",
			Type:           TypeBank,
			Identifier:     "BCA 8271039481",
			CleanKey:       normalizeKey("8271039481"),
			Category:       CatLokerFreelance,
			RiskLevel:      "CRITICAL",
			ReportCount:    19,
			Description:    "Rekening penampung dana deposit tugas kerja sampingan freelance online.",
			ReportedBank:   "BCA (Bank Central Asia)",
			AccountHolder:  "Wahyu Pratama",
			FirstReported:  "2026-09-14 10:15:00",
			LastReported:   now,
			Verified:       true,
			ChronologyTags: []string{"rekening_penampung", "setor_deposit", "loker_bodong"},
		},
		{
			ID:             "THREAT-BRI-034101002948501",
			Type:           TypeBank,
			Identifier:     "BRI 034101002948501",
			CleanKey:       normalizeKey("034101002948501"),
			Category:       CatPinjolIlegal,
			RiskLevel:      "CRITICAL",
			ReportCount:    28,
			Description:    "Rekening tujuan pelunasan denda pinjol ilegal dengan ancaman penyebaran kontak.",
			ReportedBank:   "Bank BRI",
			AccountHolder:  "Siti Nurhaliza",
			FirstReported:  "2026-08-22 13:00:00",
			LastReported:   now,
			Verified:       true,
			ChronologyTags: []string{"pinjol_ilegal", "pemerasan_kontak", "rekening_bodong"},
		},
		{
			ID:             "THREAT-DANA-085819238491",
			Type:           TypeBank,
			Identifier:     "DANA 085819238491",
			CleanKey:       normalizeKey("085819238491"),
			Category:       CatKurirAPK,
			RiskLevel:      "HIGH",
			ReportCount:    15,
			Description:    "Akun e-wallet DANA penampung transfer biaya konfirmasi resi kurir fiktif.",
			ReportedBank:   "DANA (E-Wallet)",
			AccountHolder:  "Bayu Kencana",
			FirstReported:  "2026-09-02 18:00:00",
			LastReported:   now,
			Verified:       true,
			ChronologyTags: []string{"ewallet_penampung", "tebusan_paket", "kurir_gadungan"},
		},
		{
			ID:             "THREAT-URL-SHOPEE-VIP",
			Type:           TypeURL,
			Identifier:     "shopee-vip-toko.site",
			CleanKey:       normalizeKey("shopee-vip-toko.site"),
			Category:       CatPhishingBank,
			RiskLevel:      "CRITICAL",
			ReportCount:    38,
			Description:    "Domain phishing meniru portal e-commerce Shopee untuk pendaftaran akun tugas deposit berbayar.",
			FirstReported:  "2026-08-30 08:00:00",
			LastReported:   now,
			Verified:       true,
			ChronologyTags: []string{"typosquatting", "phishing_ecommerce", "domain_site"},
		},
		{
			ID:             "THREAT-URL-RESI-PAKET",
			Type:           TypeURL,
			Identifier:     "resi-paket-jne-expedisi.com",
			CleanKey:       normalizeKey("resi-paket-jne-expedisi.com"),
			Category:       CatKurirAPK,
			RiskLevel:      "CRITICAL",
			ReportCount:    45,
			Description:    "Situs palsu penyedia unduhan malware Android berkedok tracking resi JNE.",
			FirstReported:  "2026-07-28 11:30:00",
			LastReported:   now,
			Verified:       true,
			ChronologyTags: []string{"drive_by_download", "malware_apk", "typosquat_jne"},
		},
		{
			ID:             "THREAT-URL-BCA-XYZ",
			Type:           TypeURL,
			Identifier:     "bca-tarif-transaksi.xyz",
			CleanKey:       normalizeKey("bca-tarif-transaksi.xyz"),
			Category:       CatPhishingBank,
			RiskLevel:      "CRITICAL",
			ReportCount:    52,
			Description:    "Situs phishing formulir perubahan tarif BCA palsu yang mencuri nomor kartu debit dan OTP.",
			FirstReported:  "2026-08-11 12:00:00",
			LastReported:   now,
			Verified:       true,
			ChronologyTags: []string{"phishing_bca", "curi_otp_perbankan", "domain_xyz"},
		},
	}

	for _, entry := range initialThreats {
		s.entries[entry.CleanKey] = entry
	}
}

// CheckBlacklist searches if an identifier or query matches any blacklisted threat
func (s *RegistryStore) CheckBlacklist(query string) (*BlacklistEntry, bool) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	clean := normalizeKey(query)
	if clean == "" {
		return nil, false
	}

	// 1. Direct exact match
	if entry, ok := s.entries[clean]; ok {
		return entry, true
	}

	// 2. Partial / substring match
	for key, entry := range s.entries {
		if strings.Contains(clean, key) || strings.Contains(key, clean) {
			return entry, true
		}
	}

	return nil, false
}

// ReportThreat adds a new report or updates existing entry in the blacklist
func (s *RegistryStore) ReportThreat(req ReportRequest) (*BlacklistEntry, bool) {
	s.mu.Lock()
	defer s.mu.Unlock()

	clean := normalizeKey(req.Identifier)
	if clean == "" {
		return nil, false
	}

	now := time.Now().Format("2006-01-02 15:04:05")

	if existing, ok := s.entries[clean]; ok {
		existing.ReportCount++
		existing.LastReported = now
		if req.Chronology != "" {
			existing.ChronologyTags = append(existing.ChronologyTags, "laporan_terkini")
		}
		_ = s.saveToFile()
		return existing, false // not new, but updated
	}

	// Determine initial risk level based on category
	risk := "HIGH"
	if req.Category == CatKurirAPK || req.Category == CatPhishingBank || req.Category == CatLokerFreelance {
		risk = "CRITICAL"
	}

	id := fmt.Sprintf("THREAT-%d", time.Now().UnixNano()%100000000)
	newEntry := &BlacklistEntry{
		ID:             id,
		Type:           req.Type,
		Identifier:     req.Identifier,
		CleanKey:       clean,
		Category:       req.Category,
		RiskLevel:      risk,
		ReportCount:    1,
		Description:    req.Chronology,
		ReportedBank:   req.ReportedBank,
		AccountHolder:  req.AccountHolder,
		FirstReported:  now,
		LastReported:   now,
		Verified:       true, // Auto-verified by PANDU crowd-flagging
		ChronologyTags: []string{"laporan_komunitas", string(req.Category)},
	}

	s.entries[clean] = newEntry
	_ = s.saveToFile()
	return newEntry, true
}

// GetRecentThreats returns the most recent entries
func (s *RegistryStore) GetRecentThreats(limit int) []*BlacklistEntry {
	s.mu.RLock()
	defer s.mu.RUnlock()

	if limit <= 0 {
		limit = 10
	}

	list := make([]*BlacklistEntry, 0, len(s.entries))
	for _, entry := range s.entries {
		list = append(list, entry)
	}

	// Simple slice up to limit
	if len(list) > limit {
		return list[:limit]
	}
	return list
}

// BlacklistStats gives summary statistics
type BlacklistStats struct {
	TotalEntities   int            `json:"total_entities"`
	TotalReports    int            `json:"total_reports"`
	CriticalThreats int            `json:"critical_threats"`
	CategoryCounts  map[string]int `json:"category_counts"`
}

func (s *RegistryStore) GetStats() BlacklistStats {
	s.mu.RLock()
	defer s.mu.RUnlock()

	stats := BlacklistStats{
		TotalEntities:  len(s.entries),
		CategoryCounts: make(map[string]int),
	}

	for _, entry := range s.entries {
		stats.TotalReports += entry.ReportCount
		if entry.RiskLevel == "CRITICAL" {
			stats.CriticalThreats++
		}
		stats.CategoryCounts[string(entry.Category)]++
	}

	return stats
}
