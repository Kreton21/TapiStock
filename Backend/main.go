package main

import (
    "database/sql"
    "encoding/json"
    "net/http"

    _ "github.com/mattn/go-sqlite3"
)

var db *sql.DB

func main() {
    var err error
    db, err = sql.Open("sqlite3", "stock.db")
    if err != nil { panic(err) }
    defer db.Close()

    // Init DB
    db.Exec(`CREATE TABLE IF NOT EXISTS items (nom TEXT PRIMARY KEY, Pvente INTEGER, Qte INTEGER, category TEXT)`)


	// Ce code sera appele par creerProduit();
    // db.Exec(`INSERT OR IGNORE INTO items (name, stock) VALUES ("applejuice", 30)`)


	http.HandleFunc("api/acheter",gestionAchat)

    http.HandleFunc("/api/decrement", decrementHandler)
    http.HandleFunc("/api/get", getHandler)
	



    http.ListenAndServe(":8080", nil)
}



func decrementHandler(w http.ResponseWriter, r *http.Request) {
    item := r.URL.Query().Get("item")
    db.Exec("UPDATE items SET stock = stock - 1 WHERE name = ?", item)
    getHandler(w, r) // respond with updated stock
}

func getHandler(w http.ResponseWriter, r *http.Request) {
    item := r.URL.Query().Get("item")
    var stock int
    db.QueryRow("SELECT stock FROM items WHERE name = ?", item).Scan(&stock)
    json.NewEncoder(w).Encode(map[string]interface{}{
        "item":  item,
        "stock": stock,
    })
}
