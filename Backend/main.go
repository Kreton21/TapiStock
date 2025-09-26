package main

import (
    "database/sql"
    "encoding/json"
    "net/http"
    "strconv" 
    _ "github.com/mattn/go-sqlite3"
)

var db *sql.DB

type Produit struct {
    Nom       string  `json:"nom"`
    PrixVente int `json:"prixVente"`
    Category string  `json:"category"`
    Stock  int    `json:"stock"`

}

type Item struct {
    Name string `json:"name"`
	Quantite  int    `json:"quantite"`

}

type PurchaseRequest struct {
    Items []Item `json:"items"`
}

type Vente struct {
    Produit string `json:"produit"`
    Stock   int    `json:"quantite"`
    Heure   string `json:"heure"`
}



func main() {
    var err error
    db, err = sql.Open("sqlite3", "stock.db")
    if err != nil { panic(err) }
    defer db.Close()

    // Init DB
    db.Exec(`CREATE TABLE IF NOT EXISTS produits (nom TEXT PRIMARY KEY, prixVente INTEGER, stock INTEGER, category TEXT);
			CREATE TABLE IF NOT EXISTS restock (id INTEGER PRIMARY KEY AUTOINCREMENT, produit TEXT, prixAchat INTEGER, stock INTEGER);
			CREATE TABLE IF NOT EXISTS ventes (id INTEGER PRIMARY KEY AUTOINCREMENT, produit TEXT, stock INTEGER, heure DATE);`)

	http.HandleFunc("/api/acheter",gestionAchat)
	http.HandleFunc("/api/creerProduit",creerProduit)
	http.HandleFunc("/api/getStock",getStock)
	http.HandleFunc("/api/ajouterStock",ajouterStock)
	http.HandleFunc("/api/getHistory", getHistory)



    http.ListenAndServe(":9090", nil)
}
func gestionAchat(w http.ResponseWriter, r *http.Request) {
    // Only allow POST
    if r.Method != http.MethodPost {
        http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
        return
    }

    var req PurchaseRequest

    // Decode JSON body into struct
    err := json.NewDecoder(r.Body).Decode(&req)
    if err != nil {
        http.Error(w, "Invalid JSON", http.StatusBadRequest)
        return
    }

    // Process each item
    for _, item := range req.Items {
		var currentStock int
		err := db.QueryRow(`SELECT stock FROM produits WHERE nom=?`, item.Name).Scan(&currentStock)
		if err != nil {
			http.Error(w, "Database error: "+err.Error(), http.StatusInternalServerError)
			return
		}
	
		// Check if enough stock
		if currentStock < item.Quantite {
			http.Error(w, "Not enough stock for "+item.Name, http.StatusBadRequest)
			return
		}
        // Example: decrement stock in DB
        db.Exec("UPDATE produits SET stock = stock - ? WHERE nom = ?", item.Quantite, item.Name)
		db.Exec("INSERT INTO ventes (produit,stock,heure) VALUES (?,?,datetime('now'))", item.Name, item.Quantite)
    }

    // Respond with confirmation
    json.NewEncoder(w).Encode(map[string]interface{}{
        "status": "ok",
        "items":  req.Items,
    })
}
func creerProduit(w http.ResponseWriter, r *http.Request) {
    // Only allow POST requests
    if r.Method != http.MethodPost {
        http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
        return
    }

    // Parse the product directly - no need for temp struct
    var p Produit
    err := json.NewDecoder(r.Body).Decode(&p)
    if err != nil {
        http.Error(w, "Invalid JSON: "+err.Error(), http.StatusBadRequest)
        return
    }

    // Insert into SQLite DB - price is already an integer
    _, err = db.Exec(
        `INSERT INTO produits (nom, prixVente, stock, category) VALUES (?, ?, ?, ?)`,
        p.Nom, p.PrixVente, p.Stock, p.Category,
    )
    if err != nil {
        http.Error(w, "Database error: "+err.Error(), http.StatusInternalServerError)
        return
    }

    // Respond with success - keeping the integer price
    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(map[string]interface{}{
        "status":  "ok",
        "produit": p,
    })
}
func getStock(w http.ResponseWriter, r *http.Request) {
    // Only allow GET requests
    if r.Method != http.MethodGet {
        http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
        return
    }

    // Query all products
    rows, err := db.Query("SELECT nom, prixVente, stock, category FROM produits")
    if err != nil {
        http.Error(w, "Database error: "+err.Error(), http.StatusInternalServerError)
        return
    }
    defer rows.Close()

    // Build a slice of products with integer prices
    var produits []Produit
    for rows.Next() {
        var p Produit
        err := rows.Scan(&p.Nom, &p.PrixVente, &p.Stock, &p.Category)
        if err != nil {
            http.Error(w, "Database scan error: "+err.Error(), http.StatusInternalServerError)
            return
        }
        produits = append(produits, p)
    }

    // Return JSON with integer prices
    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(produits)
}
func ajouterStock(w http.ResponseWriter, r *http.Request) {
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

    _, err = db.Exec(`
    INSERT INTO restock (produit, prixAchat, stock) VALUES (?, ?, ?);
    `, produit, prixAchatCents, quantite)
    if err != nil {
        http.Error(w, "Database error: "+err.Error(), http.StatusInternalServerError)
        return
    }
    
    _, err = db.Exec(`UPDATE produits SET stock = stock + ? WHERE nom = ?;`, quantite, produit)
    if err != nil {
        http.Error(w, "Database error: "+err.Error(), http.StatusInternalServerError)
        return
    }
    
    // Return success response
    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(map[string]string{"status": "ok"})
}
func getHistory(w http.ResponseWriter, r *http.Request) {
    if r.Method != http.MethodGet {
        http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
        return
    }

    rows, err := db.Query("SELECT produit, stock, heure FROM ventes ORDER BY heure DESC")
    if err != nil {
        http.Error(w, "Database error: "+err.Error(), http.StatusInternalServerError)
        return
    }
    defer rows.Close()

    var history []Vente
    for rows.Next() {
        var v Vente
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
