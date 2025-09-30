package models

// Produit represents a product in the inventory
type Produit struct {
	Nom       string `json:"nom"`
	PrixVente int    `json:"prixVente"`
	Category  string `json:"category"`
	Stock     int    `json:"stock"`
}

// Item represents an item in a purchase request
type Item struct {
	Name     string `json:"name"`
	Quantite int    `json:"quantite"`
}

// PurchaseRequest represents a purchase request with multiple items
type PurchaseRequest struct {
	Items []Item `json:"items"`
}

// Vente represents a sale record
type Vente struct {
	Produit string `json:"produit"`
	Stock   int    `json:"quantite"`
	Heure   string `json:"heure"`
}

// User represents a user for authentication
type User struct {
	Username string `json:"username"`
	Password string `json:"password"`
}

// LoginResponse represents the response to a login request
type LoginResponse struct {
	Success bool   `json:"success"`
	Token   string `json:"token,omitempty"`
	Message string `json:"message,omitempty"`
}
