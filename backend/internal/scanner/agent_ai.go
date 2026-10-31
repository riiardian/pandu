package scanner

import (
	"bytes"
	"context"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"strings"
	"time"
)

var (
	routerBaseURL = "http://127.0.0.1:20128/v1/chat/completions"
	aiModelName   = "ag/gemini-3.8-flash-high"
	aiHTTPClient  = &http.Client{Timeout: 45 * time.Second}
)

func getRouterKey() string {
	if k := strings.TrimSpace(os.Getenv("ROUTER_API_KEY")); k != "" {
		return k
	}
	if data, err := os.ReadFile(".env"); err == nil {
		for _, line := range strings.Split(string(data), "\n") {
			line = strings.TrimSpace(line)
			if strings.HasPrefix(line, "ROUTER_API_KEY=") {
				return strings.Trim(strings.TrimPrefix(line, "ROUTER_API_KEY="), "\"' ")
			}
		}
	}
	if data, err := os.ReadFile("/root/.hermes/.env"); err == nil {
		for _, line := range strings.Split(string(data), "\n") {
			line = strings.TrimSpace(line)
			if strings.HasPrefix(line, "HERMES_CUSTOM_103_181_182_78_20128_API_KEY=") {
				return strings.Trim(strings.TrimPrefix(line, "HERMES_CUSTOM_103_181_182_78_20128_API_KEY="), "\"' ")
			}
		}
	}
	return ""
}

// AITextAgentReport holds agentic analysis of text messages.
type AITextAgentReport struct {
	DetectedCategory    string   `json:"detected_category"`
	IsSuspicious        bool     `json:"is_suspicious"`
	RiskScore           int      `json:"risk_score"`
	Explanation         string   `json:"explanation"`
	KeyIndicators       []string `json:"key_indicators"`
	ManipulativeTactics []string `json:"manipulative_tactics"`
	MitigationTip       string   `json:"mitigation_tip"`
}

// AIVisionAnalysis holds multimodal inspection findings for images.
type AIVisionAnalysis struct {
	ContentType               string   `json:"content_type"` // BUKTI_TRANSFER, POSTER_LOKER, CHAT_MANIPULASI, PENGUMUMAN_UNDIAN, DOKUMEN_BIASA, GAMBAR_BIASA
	IsSuspicious              bool     `json:"is_suspicious"`
	RiskScore                 int      `json:"risk_score"`
	ThreatLevel               string   `json:"threat_level"`
	ExtractedTextSummary      string   `json:"extracted_text_summary"`
	VisualAnomalies           []string `json:"visual_anomalies"`
	SocialEngineeringPatterns []string `json:"social_engineering_patterns"`
	Explanation               string   `json:"explanation"`
	MitigationGuide           string   `json:"mitigation_guide"`
}

type openAIChatMessage struct {
	Role    string `json:"role"`
	Content any    `json:"content"`
}

type openAIChatRequest struct {
	Model     string              `json:"model"`
	Stream    bool                `json:"stream"`
	Messages  []openAIChatMessage `json:"messages"`
	MaxTokens int                 `json:"max_tokens,omitempty"`
}

type openAIChatResponse struct {
	Choices []struct {
		Message struct {
			Content string `json:"content"`
		} `json:"message"`
	} `json:"choices"`
	Error *struct {
		Message string `json:"message"`
	} `json:"error,omitempty"`
}

// QueryAITextAgent calls the local AI Agent to evaluate complex social engineering context.
func QueryAITextAgent(ctx context.Context, text string) (*AITextAgentReport, error) {
	apiKey := getRouterKey()
	if apiKey == "" {
		return nil, fmt.Errorf("router api key tidak ditemukan")
	}

	clean := strings.TrimSpace(text)
	if clean == "" {
		return nil, fmt.Errorf("teks kosong")
	}

	systemPrompt := `Anda adalah AI Agent Forensik Rekayasa Sosial Siber PANDU.
Analisis pesan teks ini untuk mendeteksi indikasi penipuan digital Indonesia:
- Emergency extortion / darurat palsu (kecelakaan keluarga, RS butuh biaya, ancaman polisi)
- Misi freelance like video / follow toko / tugas berbayar VIP
- Undian / hadiah palsu / tebusan admin
- Phishing perbankan / kenaikan tarif
- Kontak penagihan pinjol ilegal / intimidasi
- Permintaan OTP, PIN, transfer rekening darurat

Jika pesan adalah percakapan biasa sehari-hari antar teman/keluarga tanpa desakan atau tipu muslihat, nyatakan aman (risk_score: 0).

Kembalikan HANYA JSON valid tanpa markdown formatting:
{
  "detected_category": "kategori penipuan (kosongkan string jika pesan aman / bukan penipuan)",
  "is_suspicious": true/false,
  "risk_score": 0-100,
  "explanation": "penjelasan logis mengapa pesan ini manipulatif atau aman",
  "key_indicators": ["indikator 1", "indikator 2"],
  "manipulative_tactics": ["kepanikan / desakan waktu / imbalan"],
  "mitigation_tip": "rekomendasi proteksi untuk pengguna"
}`

	reqBody := openAIChatRequest{
		Model:  aiModelName,
		Stream: false,
		Messages: []openAIChatMessage{
			{Role: "system", Content: systemPrompt},
			{Role: "user", Content: clean},
		},
		MaxTokens: 1500,
	}

	data, err := json.Marshal(reqBody)
	if err != nil {
		return nil, err
	}

	httpReq, err := http.NewRequestWithContext(ctx, http.MethodPost, routerBaseURL, bytes.NewReader(data))
	if err != nil {
		return nil, err
	}
	httpReq.Header.Set("Content-Type", "application/json")
	httpReq.Header.Set("Authorization", "Bearer "+apiKey)

	resp, err := aiHTTPClient.Do(httpReq)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	bodyBytes, err := io.ReadAll(io.LimitReader(resp.Body, 1<<20))
	if err != nil {
		return nil, err
	}

	var chatResp openAIChatResponse
	if err := json.Unmarshal(bodyBytes, &chatResp); err != nil {
		return nil, err
	}
	if len(chatResp.Choices) == 0 {
		return nil, fmt.Errorf("tidak ada respons dari AI Agent")
	}

	rawContent := strings.TrimSpace(chatResp.Choices[0].Message.Content)
	rawContent = strings.TrimPrefix(rawContent, "```json")
	rawContent = strings.TrimPrefix(rawContent, "```")
	rawContent = strings.TrimSuffix(rawContent, "```")
	rawContent = strings.TrimSpace(rawContent)

	var report AITextAgentReport
	if err := json.Unmarshal([]byte(rawContent), &report); err != nil {
		return nil, fmt.Errorf("gagal parsing output AI Agent: %w (output: %s)", err, rawContent)
	}

	return &report, nil
}

// QueryAIVisionAgent sends image bytes to the local AI Vision Agent for deep visual & fraud forensics.
func QueryAIVisionAgent(ctx context.Context, mimeType string, imageBytes []byte) (*AIVisionAnalysis, error) {
	apiKey := getRouterKey()
	if apiKey == "" {
		return nil, fmt.Errorf("router api key tidak ditemukan")
	}

	if len(imageBytes) == 0 {
		return nil, fmt.Errorf("byte gambar kosong")
	}

	b64Image := base64.StdEncoding.EncodeToString(imageBytes)
	dataURI := fmt.Sprintf("data:%s;base64,%s", mimeType, b64Image)

	systemPrompt := `Anda adalah AI Agent Forensik Dokumen & Rekayasa Sosial Digital PANDU.
Tugas Anda memeriksa gambar yang diunggah pengguna:
1. Klasifikasi konten gambar: BUKTI_TRANSFER, POSTER_LOKER, CHAT_MANIPULASI, PENGUMUMAN_UNDIAN, DOKUMEN_BIASA, GAMBAR_BIASA.
2. Identifikasi apakah ada kejanggalan visual (font angka nominal berbeda/ditempel, font rekening miring/tidak sejajar, ciri generator struk palsu).
3. Ekstrak teks kunci (OCR) dan periksa apakah ada perangkap rekayasa sosial:
   - Iming-iming tugas like/follow berbayar harian
   - Deposit berlipat ganda
   - Ancaman blokir akun / denda tilang
   - Informasi transfer ke rekening pribadi atas nama instansi resmi
   - Arahan bergabung ke grup Telegram admin

PENTING:
- Jika gambar adalah foto atau dokumen biasa yang wajar, nyatakan aman (is_suspicious: false, risk_score: 0).
- Jika gambar bukti transfer tampak normal tanpa edit visual yang jelas, beri tahu bahwa keabsahan transfer dana hanya bisa dipastikan lewat mutasi rekening asli di m-banking/ATM.

Kembalikan HANYA JSON valid tanpa formatting markdown:
{
  "content_type": "BUKTI_TRANSFER / POSTER_LOKER / CHAT_MANIPULASI / PENGUMUMAN_UNDIAN / DOKUMEN_BIASA / GAMBAR_BIASA",
  "is_suspicious": true/false,
  "risk_score": 0-100,
  "threat_level": "KRITIS / TINGGI / WASPADA / AMAN / WAJAR",
  "extracted_text_summary": "ringkasan teks yang terbaca",
  "visual_anomalies": ["anomali 1", "anomali 2"],
  "social_engineering_patterns": ["pola 1", "pola 2"],
  "explanation": "penjelasan analisis forensik visual dan rekayasa sosial",
  "mitigation_guide": "langkah mitigasi praktis untuk pengguna"
}`

	contentParts := []any{
		map[string]any{"type": "text", "text": "Lakukan analisis forensik digital dan rekayasa sosial terhadap gambar ini secara objektif."},
		map[string]any{"type": "image_url", "image_url": map[string]any{"url": dataURI}},
	}

	reqBody := openAIChatRequest{
		Model: aiModelName,
		Stream: false,
		Messages: []openAIChatMessage{
			{Role: "system", Content: systemPrompt},
			{Role: "user", Content: contentParts},
		},
		MaxTokens: 2000,
	}

	data, err := json.Marshal(reqBody)
	if err != nil {
		return nil, err
	}

	httpReq, err := http.NewRequestWithContext(ctx, http.MethodPost, routerBaseURL, bytes.NewReader(data))
	if err != nil {
		return nil, err
	}
	httpReq.Header.Set("Content-Type", "application/json")
	httpReq.Header.Set("Authorization", "Bearer "+apiKey)

	resp, err := aiHTTPClient.Do(httpReq)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	bodyBytes, err := io.ReadAll(io.LimitReader(resp.Body, 2<<20))
	if err != nil {
		return nil, err
	}

	var chatResp openAIChatResponse
	if err := json.Unmarshal(bodyBytes, &chatResp); err != nil {
		return nil, err
	}
	if len(chatResp.Choices) == 0 {
		return nil, fmt.Errorf("tidak ada respons dari AI Vision Agent")
	}

	rawContent := strings.TrimSpace(chatResp.Choices[0].Message.Content)
	rawContent = strings.TrimPrefix(rawContent, "```json")
	rawContent = strings.TrimPrefix(rawContent, "```")
	rawContent = strings.TrimSuffix(rawContent, "```")
	rawContent = strings.TrimSpace(rawContent)

	var analysis AIVisionAnalysis
	if err := json.Unmarshal([]byte(rawContent), &analysis); err != nil {
		return nil, fmt.Errorf("gagal parsing output AI Vision: %w (output: %s)", err, rawContent)
	}

	return &analysis, nil
}

// AIOSINTReport holds agentic reasoning results from open web scraping.
type AIOSINTReport struct {
	HasReportedCases bool     `json:"has_reported_cases"`
	RiskScore        int      `json:"risk_score"`
	ThreatLevel      string   `json:"threat_level"`
	Explanation      string   `json:"explanation"`
	FoundModuses     []string `json:"found_moduses,omitempty"`
}

// QueryAIAgentOSINT reasons over raw web scraping snippets for a target entity.
func QueryAIAgentOSINT(ctx context.Context, targetType, targetValue, rawSnippets string) (*AIOSINTReport, error) {
	apiKey := getRouterKey()
	if apiKey == "" {
		return nil, fmt.Errorf("router api key tidak ditemukan")
	}

	cleanType := strings.TrimSpace(targetType)
	cleanVal := strings.TrimSpace(targetValue)
	if cleanVal == "" {
		return nil, fmt.Errorf("target value kosong")
	}

	systemPrompt := `Anda adalah AI Agent Intelijen Siber & OSINT PANDU.
Tugas Anda: Menganalisis hasil penelusuran web terbuka (OSINT) untuk entitas yang dicurigai.
Anda harus membedakan dengan tegas antara:
1. Laporan riil penipuan / korban yang secara spesifik menyebut target ini.
2. Hasil pencarian umum / halaman depan direktori (misal: deskripsi layanan Truecaller, Kredibel, atau artikel umum tentang cara menghindari penipuan) yang kebetulan muncul tetapi TIDAK menyebut target melakukan kejahatan.

PANDUAN PENILAIAN:
- Jika target benar-benar dilaporkan atau dibahas sebagai pelaku penipuan: has_reported_cases: true, risk_score: 75-95, threat_level: "WASPADA TINGGI / DITEMUKAN JEJAK ADUAN PUBLIK", jelaskan modus spesifik yang dilaporkan korban.
- Jika hasil web HANYA memuat direktori umum, artikel edukasi, atau tidak ada aduan spesifik terhadap target ini: has_reported_cases: false, risk_score: 0, threat_level: "BERSIH / TIDAK DITEMUKAN CATATAN LAPORAN", jelaskan bahwa pencarian hanya memuat direktori umum dan tidak ada laporan penipuan terhadap target ini.

Kembalikan HANYA JSON valid tanpa formatting markdown:
{
  "has_reported_cases": true/false,
  "risk_score": 0-100,
  "threat_level": "BERSIH / TIDAK DITEMUKAN CATATAN LAPORAN atau WASPADA TINGGI",
  "explanation": "penjelasan penalaran logis atas temuan web terbuka",
  "found_moduses": ["modus 1", "modus 2"]
}`

	userPrompt := fmt.Sprintf("Jenis Target: %s\nNilai Target: %s\n\nCuplikan Hasil Pencarian Web Terbuka:\n%s", cleanType, cleanVal, rawSnippets)

	reqBody := openAIChatRequest{
		Model:  aiModelName,
		Stream: false,
		Messages: []openAIChatMessage{
			{Role: "system", Content: systemPrompt},
			{Role: "user", Content: userPrompt},
		},
		MaxTokens: 1500,
	}

	data, err := json.Marshal(reqBody)
	if err != nil {
		return nil, err
	}

	httpReq, err := http.NewRequestWithContext(ctx, http.MethodPost, routerBaseURL, bytes.NewReader(data))
	if err != nil {
		return nil, err
	}
	httpReq.Header.Set("Content-Type", "application/json")
	httpReq.Header.Set("Authorization", "Bearer "+apiKey)

	resp, err := aiHTTPClient.Do(httpReq)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	bodyBytes, err := io.ReadAll(io.LimitReader(resp.Body, 1<<20))
	if err != nil {
		return nil, err
	}

	var chatResp openAIChatResponse
	if err := json.Unmarshal(bodyBytes, &chatResp); err != nil {
		return nil, err
	}
	if len(chatResp.Choices) == 0 {
		return nil, fmt.Errorf("tidak ada respons dari AI Agent OSINT")
	}

	rawContent := strings.TrimSpace(chatResp.Choices[0].Message.Content)
	rawContent = strings.TrimPrefix(rawContent, "```json")
	rawContent = strings.TrimPrefix(rawContent, "```")
	rawContent = strings.TrimSuffix(rawContent, "```")
	rawContent = strings.TrimSpace(rawContent)

	var report AIOSINTReport
	if err := json.Unmarshal([]byte(rawContent), &report); err != nil {
		return nil, fmt.Errorf("gagal parsing output AI Agent OSINT: %w (output: %s)", err, rawContent)
	}

	return &report, nil
}
