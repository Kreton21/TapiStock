// Login functionality
document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const loginBtn = document.getElementById('loginBtn');
    const btnText = document.querySelector('.btn-text');
    const btnLoading = document.querySelector('.btn-loading');
    const errorMessage = document.getElementById('errorMessage');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');

    // Check if already logged in
    const token = localStorage.getItem('authToken');
    if (token) {
        // Verify token with server
        verifyToken(token);
    }

    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const username = usernameInput.value.trim();
        const password = passwordInput.value;

        if (!username || !password) {
            showError('Veuillez remplir tous les champs');
            return;
        }

        setLoading(true);
        hideError();

        try {
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: username,
                    password: password
                })
            });

            const data = await response.json();

            if (data.success) {
                // Store token and redirect
                localStorage.setItem('authToken', data.token);
                localStorage.setItem('username', username);
                
                // Show success and redirect
                showSuccess('Connexion réussie! Redirection...');
                setTimeout(() => {
                    window.location.href = '/main/index.html';
                }, 1000);
            } else {
                showError(data.message || 'Erreur de connexion');
            }
        } catch (error) {
            console.error('Login error:', error);
            showError('Erreur de connexion au serveur');
        } finally {
            setLoading(false);
        }
    });

    async function verifyToken(token) {
        try {
            // Try to make an authenticated request to verify the token
            const response = await fetch('/api/getStock', {
                headers: {
                    'Authorization': token
                }
            });

            if (response.ok) {
                // Token is valid, redirect to main page
                window.location.href = '/main/index.html';
            } else {
                // Token is invalid, remove it
                localStorage.removeItem('authToken');
                localStorage.removeItem('username');
            }
        } catch (error) {
            // Error verifying token, remove it
            localStorage.removeItem('authToken');
            localStorage.removeItem('username');
        }
    }

    function setLoading(loading) {
        loginBtn.disabled = loading;
        if (loading) {
            btnText.style.display = 'none';
            btnLoading.style.display = 'inline-block';
        } else {
            btnText.style.display = 'inline-block';
            btnLoading.style.display = 'none';
        }
    }

    function showError(message) {
        errorMessage.textContent = message;
        errorMessage.style.display = 'block';
        errorMessage.style.background = '#f8d7da';
        errorMessage.style.color = '#721c24';
        errorMessage.style.borderColor = '#f5c6cb';
    }

    function showSuccess(message) {
        errorMessage.textContent = message;
        errorMessage.style.display = 'block';
        errorMessage.style.background = '#d4edda';
        errorMessage.style.color = '#155724';
        errorMessage.style.borderColor = '#c3e6cb';
    }

    function hideError() {
        errorMessage.style.display = 'none';
    }

    // Auto-focus username field
    usernameInput.focus();

    // Allow Enter key to submit form
    passwordInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            loginForm.requestSubmit();
        }
    });
});
