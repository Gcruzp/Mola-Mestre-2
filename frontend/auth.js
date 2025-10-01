// Funções auxiliares de autenticação

// Verificar se token é válido
function isTokenValid() {
    const token = localStorage.getItem('token');
    if (!token) return false;
    
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.exp > Date.now() / 1000;
    } catch {
        return false;
    }
}

// Fazer requisições autenticadas
async function makeAuthenticatedRequest(url, options = {}) {
    const token = localStorage.getItem('token');
    
    if (!token) {
        throw new Error('Usuário não autenticado');
    }
    
    const defaultOptions = {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    };
    
    const mergedOptions = {
        ...defaultOptions,
        ...options,
        headers: {
            ...defaultOptions.headers,
            ...options.headers
        }
    };
    
    const response = await fetch(url, mergedOptions);
    
    if (response.status === 401) {
        // Token expirado
        logout();
        throw new Error('Sessão expirada');
    }
    
    return response;
}

// Auto-logout quando token expirar
function setupTokenExpirationCheck() {
    setInterval(() => {
        if (!isTokenValid()) {
            showMessage('Sessão expirada. Faça login novamente.', 'error');
            logout();
        }
    }, 60000); // Verifica a cada minuto
}

// Inicializar verificações de autenticação
document.addEventListener('DOMContentLoaded', () => {
    if (localStorage.getItem('token')) {
        setupTokenExpirationCheck();
    }
});