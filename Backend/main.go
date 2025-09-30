package main

import (
	"log"
	"net/http"

	"tapistock/database"
	"tapistock/handlers"
)

func main() {
	// Initialize database
	if err := database.InitDB("stock.db"); err != nil {
		log.Fatalf("Failed to initialize database: %v", err)
	}
	defer database.Close()

	// Setup routes
	http.HandleFunc("/api/login", handlers.HandleLogin)
	http.HandleFunc("/api/logout", handlers.HandleLogout)
	http.HandleFunc("/api/acheter", handlers.RequireAuth(handlers.GestionAchat))
	http.HandleFunc("/api/creerProduit", handlers.RequireAuth(handlers.CreerProduit))
	http.HandleFunc("/api/getStock", handlers.RequireAuth(handlers.GetStock))
	http.HandleFunc("/api/ajouterStock", handlers.RequireAuth(handlers.AjouterStock))
	http.HandleFunc("/api/getHistory", handlers.RequireAuth(handlers.GetHistory))

	log.Println("Server starting on :9090")
	if err := http.ListenAndServe(":9090", nil); err != nil {
		log.Fatalf("Server failed to start: %v", err)
	}
}

