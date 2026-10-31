package admin

import (
	"crypto/hmac"
	"crypto/sha256"
	"crypto/subtle"
	"encoding/hex"
	"fmt"
	"os"
	"strconv"
	"strings"
	"sync"
	"time"

	"github.com/gofiber/fiber/v2"
	"golang.org/x/crypto/bcrypt"
)

type RateLimiter struct {
	mu       sync.Mutex
	attempts map[string]int
	lockouts map[string]time.Time
}

var (
	loginLimiter = &RateLimiter{
		attempts: make(map[string]int),
		lockouts: make(map[string]time.Time),
	}
)

func (rl *RateLimiter) Check(ip string) error {
	rl.mu.Lock()
	defer rl.mu.Unlock()

	if lockUntil, ok := rl.lockouts[ip]; ok {
		if time.Now().Before(lockUntil) {
			remaining := int(time.Until(lockUntil).Minutes()) + 1
			return fmt.Errorf("Akses diblokir sementara karena terlalu banyak percobaan gagal. Silakan coba lagi dalam %d menit", remaining)
		}
		delete(rl.lockouts, ip)
		delete(rl.attempts, ip)
	}
	return nil
}

func (rl *RateLimiter) RecordFail(ip string) {
	rl.mu.Lock()
	defer rl.mu.Unlock()

	rl.attempts[ip]++
	if rl.attempts[ip] >= 5 {
		rl.lockouts[ip] = time.Now().Add(15 * time.Minute)
	}
}

func (rl *RateLimiter) RecordSuccess(ip string) {
	rl.mu.Lock()
	defer rl.mu.Unlock()

	delete(rl.attempts, ip)
	delete(rl.lockouts, ip)
}

func loadSecretFile() map[string]string {
	data, err := os.ReadFile("/www/wwwroot/pandu/backend/.admin_secret")
	if err != nil {
		return nil
	}
	res := make(map[string]string)
	for _, line := range strings.Split(string(data), "\n") {
		line = strings.TrimSpace(line)
		if line == "" || strings.HasPrefix(line, "#") {
			continue
		}
		parts := strings.SplitN(line, "=", 2)
		if len(parts) == 2 {
			res[strings.TrimSpace(parts[0])] = strings.TrimSpace(parts[1])
		}
	}
	return res
}

func GetAdminUsername() string {
	if cfg := loadSecretFile(); cfg != nil && cfg["ADMIN_USERNAME"] != "" {
		return cfg["ADMIN_USERNAME"]
	}
	if u := os.Getenv("PANDU_ADMIN_USERNAME"); u != "" {
		return u
	}
	return "admin_rio"
}

func GetAdminPasswordHash() string {
	if cfg := loadSecretFile(); cfg != nil && cfg["ADMIN_PASSWORD_HASH"] != "" {
		return cfg["ADMIN_PASSWORD_HASH"]
	}
	if h := os.Getenv("PANDU_ADMIN_PASSWORD_HASH"); h != "" && len(h) > 10 {
		return h
	}
	return "$2b$12$QeZQpMnQ0kfvKNdPrtPDAew25dROEEVMeWfQ4SMMGHAbadapFy2fS"
}

func GetAdminSecretKey() string {
	if cfg := loadSecretFile(); cfg != nil && cfg["ADMIN_SECRET_KEY"] != "" {
		return cfg["ADMIN_SECRET_KEY"]
	}
	if k := os.Getenv("PANDU_ADMIN_SECRET_KEY"); k != "" {
		return k
	}
	return "43427390b511a7f99f89a5852762083547d29f9f7bf2f3aabb1a6fb7d9cc1efe"
}

func GetAdminURLKey() string {
	if cfg := loadSecretFile(); cfg != nil && cfg["ADMIN_URL_KEY"] != "" {
		return cfg["ADMIN_URL_KEY"]
	}
	if k := os.Getenv("PANDU_ADMIN_URL_KEY"); k != "" {
		return k
	}
	return "ops-intel-7f89b"
}

// GenerateSessionToken creates an HMAC-signed session string: username:expiresAt:signature
func GenerateSessionToken(username string) string {
	expiresAt := time.Now().Add(24 * time.Hour).Unix()
	payload := fmt.Sprintf("%s:%d", username, expiresAt)

	mac := hmac.New(sha256.New, []byte(GetAdminSecretKey()))
	mac.Write([]byte(payload))
	sig := hex.EncodeToString(mac.Sum(nil))

	return fmt.Sprintf("%s:%s", payload, sig)
}

// ValidateSessionToken checks if the token is authentic and not expired
func ValidateSessionToken(token string) (string, error) {
	parts := strings.Split(token, ":")
	if len(parts) != 3 {
		return "", fmt.Errorf("Format token tidak valid")
	}

	username := parts[0]
	expStr := parts[1]
	providedSig := parts[2]

	exp, err := strconv.ParseInt(expStr, 10, 64)
	if err != nil {
		return "", fmt.Errorf("Timestamp kedaluwarsa tidak valid")
	}

	if time.Now().Unix() > exp {
		return "", fmt.Errorf("Sesi telah kedaluwarsa, silakan login kembali")
	}

	payload := fmt.Sprintf("%s:%s", username, expStr)
	mac := hmac.New(sha256.New, []byte(GetAdminSecretKey()))
	mac.Write([]byte(payload))
	expectedSig := hex.EncodeToString(mac.Sum(nil))

	if !hmac.Equal([]byte(providedSig), []byte(expectedSig)) {
		return "", fmt.Errorf("Tanda tangan token tidak sah")
	}

	return username, nil
}

// Authenticate verifies username and password with bcrypt, constant-time checks, and rate limiting
func Authenticate(username, password, ip string) (string, error) {
	if err := loginLimiter.Check(ip); err != nil {
		return "", err
	}

	expectedUser := GetAdminUsername()
	hash := GetAdminPasswordHash()

	// Constant-time comparison for username
	userMatch := subtle.ConstantTimeCompare([]byte(username), []byte(expectedUser)) == 1

	// Dummy hash comparison to ensure constant execution time even if username is invalid
	targetHash := hash
	if !userMatch {
		targetHash = "$2b$12$e80yq9j5X42K97n/2g9yquZqjN1V5n2g7K97n/2g9yquZqjN1V5n2"
	}

	err := bcrypt.CompareHashAndPassword([]byte(targetHash), []byte(password))
	if !userMatch || err != nil {
		loginLimiter.RecordFail(ip)
		return "", fmt.Errorf("Kredensial admin tidak valid")
	}

	loginLimiter.RecordSuccess(ip)
	token := GenerateSessionToken(username)
	return token, nil
}

// AuthMiddleware ensures the caller has a valid admin session
func AuthMiddleware() fiber.Handler {
	return func(c *fiber.Ctx) error {
		var token string

		authHeader := c.Get("Authorization")
		if strings.HasPrefix(authHeader, "Bearer ") {
			token = strings.TrimPrefix(authHeader, "Bearer ")
		}

		if token == "" {
			token = c.Cookies("pandu_admin_session")
		}

		if token == "" {
			token = c.Query("token")
		}

		if token == "" {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"success": false,
				"message": "Akses ditolak: Autentikasi admin diperlukan",
			})
		}

		username, err := ValidateSessionToken(token)
		if err != nil {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"success": false,
				"message": err.Error(),
			})
		}

		c.Locals("admin_user", username)
		return c.Next()
	}
}
