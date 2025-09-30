package handlers

import (
	"encoding/json"
	"net/http"
	"strconv"

	"tapistock/auth"
	"tapistock/database"
	"tapistock/models"
)

// GestionAchat handles purchase requests
func GestionAchat(w http.ResponseWriter, r *http.Request) {
	// Only allow POST
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var req models.PurchaseRequest

	// Decode JSON body into struct
	err := json.NewDecoder(r.Body).Decode(&req)
	if err != nil {
		http.Error(w, "Invalid JSON", http.StatusBadRequest)
		return
	}

	// Process each item
	for _, item := range req.Items {
		var currentStock int
		err := database.DB.QueryRow(`SELECT stock FROM produits WHERE nom=?`, item.Name).Scan(&currentStock)
		if err != nil {
			http.Error(w, "Database error: "+err.Error(), http.StatusInternalServerError)
			return
		}

		// Check if enough stock
		if currentStock < item.Quantite {
			http.Error(w, "Not enough stock for "+item.Name, http.StatusBadRequest)
			return
		}
		// Decrement stock in DB
		database.DB.Exec("UPDATE produits SET stock = stock - ? WHERE nom = ?", item.Quantite, item.Name)
		database.DB.Exec("INSERT INTO ventes (produit,stock,heure) VALUES (?,?,datetime('now'))", item.Name, item.Quantite)
	}

	// Respond with confirmation
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"status": "ok",
		"items":  req.Items,
	})
}

// CreerProduit handles product creation
func CreerProduit(w http.ResponseWriter, r *http.Request) {
	// Only allow POST requests
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	// Parse the product directly
	var p models.Produit
	err := json.NewDecoder(r.Body).Decode(&p)
	if err != nil {
		http.Error(w, "Invalid JSON: "+err.Error(), http.StatusBadRequest)
		return
	}

	// Insert into SQLite DB
	_, err = database.DB.Exec(
		`INSERT INTO produits (nom, prixVente, stock, category) VALUES (?, ?, ?, ?)`,
		p.Nom, p.PrixVente, p.Stock, p.Category,
	)
	if err != nil {
		http.Error(w, "Database error: "+err.Error(), http.StatusInternalServerError)
		return
	}

	// Respond with success
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"status":  "ok",
		"produit": p,
	})
}

// GetStock handles retrieving all products
func GetStock(w http.ResponseWriter, r *http.Request) {
	// Only allow GET requests
	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	// Query all products
	rows, err := database.DB.Query("SELECT nom, prixVente, stock, category FROM produits")
	if err != nil {
		http.Error(w, "Database error: "+err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	// Build a slice of products
	var produits []models.Produit
	for rows.Next() {
		var p models.Produit
		err := rows.Scan(&p.Nom, &p.PrixVente, &p.Stock, &p.Category)
		if err != nil {
			http.Error(w, "Database scan error: "+err.Error(), http.StatusInternalServerError)
			return
		}
		produits = append(produits, p)
	}

	// Return JSON
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(produits)
}

// AjouterStock handles adding stock to existing products
func AjouterStock(w http.ResponseWriter, r *http.Request) {
	query := r.URL.Query()

	produit := query.Get("produit")
	prixAchatStr := query.Get("prix_achat")
	quantiteStr := query.Get("quantite")

	// Convert string to float64, then to integer cents
	prixAchat, err := strconv.ParseFloat(prixAchatStr, 64)
	if err != nil {
		http.Error(w, "Invalid price format: "+err.Error(), http.StatusBadRequest)
		return
	}
	prixAchatCents := int(prixAchat * 100)

	// Convert quantity string to int
	quantite, err := strconv.Atoi(quantiteStr)
	if err != nil {
		http.Error(w, "Invalid quantity format: "+err.Error(), http.StatusBadRequest)
		return
	}

	_, err = database.DB.Exec(`
    INSERT INTO restock (produit, prixAchat, stock) VALUES (?, ?, ?);
    `, produit, prixAchatCents, quantite)
	if err != nil {
		http.Error(w, "Database error: "+err.Error(), http.StatusInternalServerError)
		return
	}

	_, err = database.DB.Exec(`UPDATE produits SET stock = stock + ? WHERE nom = ?;`, quantite, produit)
	if err != nil {
		http.Error(w, "Database error: "+err.Error(), http.StatusInternalServerError)
		return
	}

	// Return success response
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"status": "ok"})
}

// GetHistory handles retrieving sales history
func GetHistory(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	rows, err := database.DB.Query("SELECT produit, stock, heure FROM ventes ORDER BY heure DESC")
	if err != nil {
		http.Error(w, "Database error: "+err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var history []models.Vente
	for rows.Next() {
		var v models.Vente
		err := rows.Scan(&v.Produit, &v.Stock, &v.Heure)
		if err != nil {
			http.Error(w, "Database scan error: "+err.Error(), http.StatusInternalServerError)
			return
		}
		history = append(history, v)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(history)
}

// HandleLogin handles user authentication
func HandleLogin(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var user models.User
	err := json.NewDecoder(r.Body).Decode(&user)
	if err != nil {
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(models.LoginResponse{
			Success: false,
			Message: "Invalid JSON",
		})
		return
	}

	// Validate user credentials
	valid, err := auth.ValidateUser(user)
	if err != nil || !valid {
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(models.LoginResponse{
			Success: false,
			Message: "Invalid credentials",
		})
		return
	}

	// Create session
	token := auth.CreateSession(user.Username)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(models.LoginResponse{
		Success: true,
		Token:   token,
		Message: "Login successful",
	})
}

// HandleLogout handles user logout
func HandleLogout(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	token := r.Header.Get("Authorization")
	if token != "" {
		auth.InvalidateSession(token)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"status": "ok"})
}

// RequireAuth is a middleware that requires authentication
func RequireAuth(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		token := r.Header.Get("Authorization")
		if token == "" {
			http.Error(w, "Unauthorized: No token provided", http.StatusUnauthorized)
			return
		}

		username, exists := auth.ValidateToken(token)
		if !exists {
			http.Error(w, "Unauthorized: Invalid token", http.StatusUnauthorized)
			return
		}

		// Add username to request context if needed
		r.Header.Set("X-Username", username)
		next(w, r)
	}
}
