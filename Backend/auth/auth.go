package auth

import (
	"crypto/sha256"
	"fmt"
	"math/rand"
	"time"

	"tapistock/database"
	"tapistock/models"
)

// sessions stores active sessions (token -> username)
var sessions = make(map[string]string)

// init initializes the random seed for token generation
func init() {
	rand.Seed(time.Now().UnixNano())
}

// GenerateToken generates a random token for session management
func GenerateToken() string {
	const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
	token := make([]byte, 32)
	for i := range token {
		token[i] = chars[rand.Intn(len(chars))]
	}
	return string(token)
}

// ValidateUser validates user credentials against the database
func ValidateUser(user models.User) (bool, error) {
	// Hash the provided password
	hasher := sha256.New()
	hasher.Write([]byte(user.Password))
	providedHash := fmt.Sprintf("%x", hasher.Sum(nil))

	// Check against database
	var storedHash string
	err := database.DB.QueryRow("SELECT password_hash FROM users WHERE username = ?", user.Username).Scan(&storedHash)
	if err != nil {
		return false, err
	}

	return storedHash == providedHash, nil
}

// CreateSession creates a new session for the user
func CreateSession(username string) string {
	token := GenerateToken()
	sessions[token] = username
	return token
}

// ValidateToken validates a session token and returns the username
func ValidateToken(token string) (string, bool) {
	username, exists := sessions[token]
	return username, exists
}

// InvalidateSession removes a session
func InvalidateSession(token string) {
	delete(sessions, token)
}

// GetAllSessions returns all active sessions (for debugging/admin purposes)
func GetAllSessions() map[string]string {
	return sessions
}
