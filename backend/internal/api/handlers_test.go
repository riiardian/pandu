package api

import (
	"bytes"
	"encoding/json"
	"io"
	"mime/multipart"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/gofiber/fiber/v2"
)

func TestAllSixScannerRoutesAreExposed(t *testing.T) {
	app := fiber.New()
	RegisterRoutes(app)

	for _, path := range []string{"/api/v1/scan/text", "/api/v1/scan/url", "/api/v1/scan/phone", "/api/v1/scan/bank", "/api/v1/scan/email"} {
		req := httptest.NewRequest("POST", path, strings.NewReader(`{}`))
		req.Header.Set("Content-Type", "application/json")
		resp, err := app.Test(req)
		if err != nil {
			t.Fatalf("%s: %v", path, err)
		}
		if resp.StatusCode == fiber.StatusNotFound {
			t.Fatalf("%s route must be active and exposed, got 404", path)
		}
	}
}

func TestScanFileRequiresMultipartBytes(t *testing.T) {
	app := fiber.New(fiber.Config{BodyLimit: 6 * 1024 * 1024})
	RegisterRoutes(app)

	req := httptest.NewRequest("POST", "/api/v1/scan/file", strings.NewReader(`{"file_name":"fake.apk","file_size":8}`))
	req.Header.Set("Content-Type", "application/json")
	resp, err := app.Test(req)
	if err != nil {
		t.Fatal(err)
	}
	if resp.StatusCode != fiber.StatusUnsupportedMediaType {
		t.Fatalf("old metadata-only JSON must be rejected, got %d", resp.StatusCode)
	}
}

func TestScanFileHashesActualMultipartBytes(t *testing.T) {
	app := fiber.New(fiber.Config{BodyLimit: 6 * 1024 * 1024})
	RegisterRoutes(app)

	var body bytes.Buffer
	writer := multipart.NewWriter(&body)
	part, err := writer.CreateFormFile("file", "evidence.bin")
	if err != nil {
		t.Fatal(err)
	}
	_, _ = part.Write([]byte("pandu-fixture"))
	_ = writer.Close()

	req := httptest.NewRequest("POST", "/api/v1/scan/file", &body)
	req.Header.Set("Content-Type", writer.FormDataContentType())
	resp, err := app.Test(req, 10000)
	if err != nil {
		t.Fatal(err)
	}
	defer resp.Body.Close()
	payload, _ := io.ReadAll(resp.Body)
	if resp.StatusCode != fiber.StatusOK {
		t.Fatalf("expected 200, got %d: %s", resp.StatusCode, payload)
	}
	var decoded struct {
		Success bool `json:"success"`
		Data    struct {
			SHA256   string `json:"sha256"`
			FileSize int64  `json:"file_size"`
		} `json:"data"`
	}
	if err := json.Unmarshal(payload, &decoded); err != nil {
		t.Fatal(err)
	}
	if decoded.Data.SHA256 != "86a4edafa243e425493c17946cd41bb0e64607b01fcee505a22b6961ce126452" {
		t.Fatalf("handler did not hash uploaded bytes: %s", decoded.Data.SHA256)
	}
	if decoded.Data.FileSize != 13 {
		t.Fatalf("expected actual received size 13, got %d", decoded.Data.FileSize)
	}
}
