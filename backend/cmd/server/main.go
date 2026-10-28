package main

import (
	"log"
	"os"
	"time"

	"pandu/backend/internal/api"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/helmet"
	"github.com/gofiber/fiber/v2/middleware/limiter"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"github.com/gofiber/fiber/v2/middleware/recover"
)

func main() {
	port := os.Getenv("PORT")
	if port == "" {
		port = "8082"
	}

	app := fiber.New(fiber.Config{
		AppName:               "PANDU — Digital Deception Defense API v1.0",
		ReadTimeout:           15 * time.Second,
		WriteTimeout:          15 * time.Second,
		IdleTimeout:           60 * time.Second,
		BodyLimit:             2 * 1024 * 1024, // 2MB safe payload limit
		DisableStartupMessage: false,
	})

	// 1. Recover Panic
	app.Use(recover.New())

	// 2. Request Logger
	app.Use(logger.New(logger.Config{
		Format:     "[${time}] ${status} ${method} ${path} | ${latency} | ${ip}\n",
		TimeFormat: "2006-01-02 15:04:05",
		TimeZone:   "Asia/Jakarta",
	}))

	// 3. Security Headers (Helmet)
	app.Use(helmet.New(helmet.Config{
		XSSProtection:      "1; mode=block",
		ContentTypeNosniff: "nosniff",
		XFrameOptions:      "DENY",
		ReferrerPolicy:     "strict-origin-when-cross-origin",
	}))

	// 4. CORS
	app.Use(cors.New(cors.Config{
		AllowOrigins:     "https://pandu.web.id, http://localhost:3002, http://localhost:3000, http://127.0.0.1:3002",
		AllowMethods:     "GET,POST,PUT,DELETE,OPTIONS",
		AllowHeaders:     "Origin,Content-Type,Accept,Authorization",
		AllowCredentials: false,
		MaxAge:           3600,
	}))

	// 5. Rate Limiter (Proteksi Anti-Abuse Scanner)
	app.Use(limiter.New(limiter.Config{
		Max:        60,
		Expiration: 1 * time.Minute,
		LimitReached: func(c *fiber.Ctx) error {
			return c.Status(fiber.StatusTooManyRequests).JSON(fiber.Map{
				"success": false,
				"message": "Terlalu banyak permintaan pemindaian. Mohon tunggu 1 menit demi stabilitas layanan.",
			})
		},
	}))

	// 6. Register API Routes
	api.RegisterRoutes(app)

	// 7. Root Welcome
	app.Get("/", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{
			"project":   "PANDU",
			"tagline":   "Navigating Digital Deception — Guardians of the Digital Space",
			"team":      "404Forbidden (MIT-002)",
			"api_docs":  "/api/v1/health",
			"status":    "running",
			"timestamp": time.Now().Format(time.RFC3339),
		})
	})

	log.Printf("Starting PANDU API Engine on http://127.0.0.1:%s", port)
	if err := app.Listen("127.0.0.1:" + port); err != nil {
		log.Fatalf("Server startup failed: %v", err)
	}
}
