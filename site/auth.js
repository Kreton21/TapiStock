// Authentication utility module
class AuthManager {
    constructor() {
        this.token = localStorage.getItem('authToken');
        this.username = localStorage.getItem('username');
    }

    isAuthenticated() {
        return !!this.token;
    }

    getToken() {
        return this.token;
    }

    getUsername() {
        return this.username;
    }

    logout() {
        // Send logout request to server
        if (this.token) {
            fetch('/api/logout', {
                method: 'POST',
                headers: {
                    'Authorization': this.token
                }
            }).catch(error => {
                console.error('Logout error:', error);
            });
        }

        // Clear local storage
        localStorage.removeItem('authToken');
        localStorage.removeItem('username');
        this.token = null;
        this.username = null;

        // Redirect to login
        window.location.href = '/login.html';
    }

    async makeAuthenticatedRequest(url, options = {}) {
        if (!this.token) {
            this.redirectToLogin();
            return null;
        }

        const authOptions = {
            ...options,
            headers: {
                ...options.headers,
                'Authorization': this.token
            }
        };

        try {
            const response = await fetch(url, authOptions);
            
            if (response.status === 401) {
                // Token is invalid, redirect to login
                this.logout();
                return null;
            }

            return response;
        } catch (error) {
            console.error('Authenticated request error:', error);
            throw error;
        }
    }

    redirectToLogin() {
        window.location.href = '/login.html';
    }

    checkAuthOnLoad() {
        if (!this.isAuthenticated()) {
            this.redirectToLogin();
            return false;
        }
        return true;
    }
}

// Create global auth manager instance
const auth = new AuthManager();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AuthManager;
}
