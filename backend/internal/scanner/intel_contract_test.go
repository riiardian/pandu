package scanner

import (
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
	"time"
)

func TestSummarizeCoverageDistinguishesUnavailableFromNoMatch(t *testing.T) {
	sources := []SourceResult{
		{ID: "one", Name: "One", Status: SourceQueried, Outcome: OutcomeNoMatch},
		{ID: "two", Name: "Two", Status: SourceUnavailable, Outcome: OutcomeUnknown},
	}

	coverage, summary := SummarizeCoverage(sources)
	if coverage != CoveragePartial {
		t.Fatalf("expected partial coverage, got %q", coverage)
	}
	if strings.Contains(strings.ToLower(summary), "aman") || strings.Contains(strings.ToLower(summary), "bersih") {
		t.Fatalf("coverage summary must not claim safety: %q", summary)
	}
}

func TestSummarizeCoverageAllUnavailableIsInconclusive(t *testing.T) {
	coverage, _ := SummarizeCoverage([]SourceResult{
		{ID: "one", Name: "One", Status: SourceUnavailable, Outcome: OutcomeUnknown},
	})
	if coverage != CoverageUnavailable {
		t.Fatalf("expected unavailable coverage, got %q", coverage)
	}
}

func TestStopForumSpamProviderKeepsProviderFailureSeparateFromMiss(t *testing.T) {
	oldBase := stopForumSpamBaseURL
	oldClient := threatHTTPClient
	t.Cleanup(func() {
		stopForumSpamBaseURL = oldBase
		threatHTTPClient = oldClient
	})

	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		http.Error(w, "provider down", http.StatusServiceUnavailable)
	}))
	defer server.Close()
	stopForumSpamBaseURL = server.URL
	threatHTTPClient = server.Client()

	result := QueryStopForumSpamEmail(context.Background(), "test@example.com")
	if result.Status != SourceUnavailable || result.Outcome != OutcomeUnknown {
		t.Fatalf("provider error must be unavailable/unknown, got status=%q outcome=%q", result.Status, result.Outcome)
	}
}

func TestCIRCLHashLookupHitAndMiss(t *testing.T) {
	oldBase := circlHashlookupBaseURL
	oldClient := threatHTTPClient
	t.Cleanup(func() {
		circlHashlookupBaseURL = oldBase
		threatHTTPClient = oldClient
	})

	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if strings.HasSuffix(r.URL.Path, strings.Repeat("a", 64)) {
			_ = json.NewEncoder(w).Encode(map[string]any{
				"SHA-256":          strings.Repeat("a", 64),
				"FileName":         "known.bin",
				"FileSize":         12,
				"hashlookup:trust": 80,
			})
			return
		}
		http.NotFound(w, r)
	}))
	defer server.Close()
	circlHashlookupBaseURL = server.URL
	threatHTTPClient = server.Client()

	hit := QueryCIRCLHash(context.Background(), strings.Repeat("a", 64))
	if hit.Status != SourceQueried || hit.Outcome != OutcomeMatch || len(hit.Evidence) == 0 {
		t.Fatalf("expected attributed CIRCL hit, got %#v", hit)
	}

	miss := QueryCIRCLHash(context.Background(), strings.Repeat("b", 64))
	if miss.Status != SourceQueried || miss.Outcome != OutcomeNoMatch {
		t.Fatalf("404 must be a successful no-match, got %#v", miss)
	}
}

func TestRDAPProviderReturnsRegistrationEvidence(t *testing.T) {
	oldBase := rdapBaseURL
	oldClient := threatHTTPClient
	t.Cleanup(func() {
		rdapBaseURL = oldBase
		threatHTTPClient = oldClient
	})

	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		_ = json.NewEncoder(w).Encode(map[string]any{
			"ldhName": "example.com",
			"status":  []string{"active"},
			"events":  []map[string]string{{"eventAction": "registration", "eventDate": "1995-08-14T00:00:00Z"}},
		})
	}))
	defer server.Close()
	rdapBaseURL = server.URL
	threatHTTPClient = server.Client()

	result := QueryRDAPDomain(context.Background(), "example.com")
	if result.Status != SourceQueried || result.Outcome != OutcomeContext || len(result.Evidence) == 0 {
		t.Fatalf("expected RDAP context evidence, got %#v", result)
	}
}

func TestAnalyzeBankCleanAccount(t *testing.T) {
	result := AnalyzeBank("BCA", "1234567890")
	if result.RiskScore != 0 {
		t.Fatalf("clean account without reports must have 0 risk score, got %d", result.RiskScore)
	}
	if !strings.Contains(result.ThreatLevel, "BERSIH") {
		t.Fatalf("clean account should have BERSIH threat level, got: %s", result.ThreatLevel)
	}
}

func TestAnalyzePhoneCleanNumber(t *testing.T) {
	result := AnalyzePhone("081234567890")
	if result.RiskScore != 0 {
		t.Fatalf("valid phone number without reports must have 0 risk score, got %d", result.RiskScore)
	}
	if !strings.Contains(result.ThreatLevel, "BERSIH") {
		t.Fatalf("valid phone number should have BERSIH threat level, got: %s", result.ThreatLevel)
	}
}

func TestAnalyzeFileHashesUploadedBytesAndDoesNotInventAPKPermissions(t *testing.T) {
	content := []byte("pandu-fixture")
	result := AnalyzeFile("renamed.apk", int64(len(content)), content)
	if result.SHA256 != "86a4edafa243e425493c17946cd41bb0e64607b01fcee505a22b6961ce126452" {
		t.Fatalf("unexpected SHA-256: %s", result.SHA256)
	}
	if len(result.DangerousPerms) != 0 {
		t.Fatalf("must not invent APK permissions from extension: %#v", result.DangerousPerms)
	}
	if strings.Contains(strings.ToLower(result.ThreatLevel), "malware") {
		t.Fatalf("extension alone must not produce malware verdict: %q", result.ThreatLevel)
	}
}

func TestSourceResultTimestampIsRFC3339(t *testing.T) {
	s := NewSourceResult("source", "Source")
	if _, err := time.Parse(time.RFC3339, s.CheckedAt); err != nil {
		t.Fatalf("checked_at must be RFC3339: %v", err)
	}
}
