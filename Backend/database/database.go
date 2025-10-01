package database

import (
	"database/sql"
	"fmt"
	"crypto/sha256"

	_ "github.com/mattn/go-sqlite3"
)

var DB *sql.DB

// InitDB initializes the database connection and creates tables
func InitDB(dbPath string) error {
	var err error
	DB, err = sql.Open("sqlite3", dbPath+"?_foreign_keys=on")
	if err != nil {
		return fmt.Errorf("failed to open database: %w", err)
	}
	if _, err := DB.Exec("PRAGMA foreign_keys = ON"); err != nil {
		return fmt.Errorf("failed to enable foreign keys: %w", err)
	}
	// Test connection
	if err := DB.Ping(); err != nil {
		return fmt.Errorf("failed to ping database: %w", err)
	}

	// Create tables
	if err := createTables(); err != nil {
		return fmt.Errorf("failed to create tables: %w", err)
	}

	// Create default admin user
	if err := createDefaultUser(); err != nil {
		return fmt.Errorf("failed to create default user: %w", err)
	}

	return nil
}

// createTables creates all necessary database tables
func createTables() error {
	queries := []string{
		`CREATE TABLE IF NOT EXISTS categories (
			nom TEXT PRIMARY KEY
		);`,
        `CREATE TABLE IF NOT EXISTS produits (
            nom TEXT PRIMARY KEY, 
            prixVente INTEGER, 
            stock INTEGER, 
            category TEXT,
            FOREIGN KEY(category) REFERENCES categories(nom)
                ON UPDATE CASCADE
                ON DELETE SET NULL
        );`,
		`CREATE TABLE IF NOT EXISTS restock (
			id INTEGER PRIMARY KEY AUTOINCREMENT, 
			produit TEXT, 
			prixAchat INTEGER, 
			stock INTEGER
		);`,
		`CREATE TABLE IF NOT EXISTS ventes (
			id INTEGER PRIMARY KEY AUTOINCREMENT, 
			produit TEXT, 
			stock INTEGER, 
			heure DATE
		);`,
		`CREATE TABLE IF NOT EXISTS users (
			username TEXT PRIMARY KEY, 
			password_hash TEXT
		);`,
	}

	for _, query := range queries {
		if _, err := DB.Exec(query); err != nil {
			return fmt.Errorf("failed to execute query %s: %w", query, err)
		}
	}

	return nil
}

// createDefaultUser creates a default admin user if no users exist
func createDefaultUser() error {
	var userCount int
	err := DB.QueryRow("SELECT COUNT(*) FROM users").Scan(&userCount)
	if err != nil {
		return fmt.Errorf("failed to count users: %w", err)
	}

	if userCount == 0 {
		defaultPassword := "admin"
		hasher := sha256.New()
		hasher.Write([]byte(defaultPassword))
		hash := fmt.Sprintf("%x", hasher.Sum(nil))
		
		_, err = DB.Exec("INSERT INTO users (username, password_hash) VALUES (?, ?)", "admin", hash)
		if err != nil {
			return fmt.Errorf("failed to create default user: %w", err)
		}
	}

	return nil
}

// Close closes the database connection
func Close() error {
	if DB != nil {
		return DB.Close()
	}
	return nil
}
