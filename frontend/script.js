// Configuração da API
const API_BASE = 'http://localhost:5000';

// Elementos DOM
const authContainer = document.getElementById('authContainer');
const dashboard = document.getElementById('dashboard');
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const loading = document.getElementById('loading');
const message = document.getElementById('message');

// Funções para trocar entre login e cadastro
function showLogin() {
    loginForm.classList.add('active');
    registerForm.classList.remove('active');
}

function showRegister() {
    registerForm.classList.add('active');
    loginForm.classList.remove('active');
}

// Mostrar mensagem
function showMessage(text, type = 'success') {
    message.textContent = text;
    message.className = `message ${type}`;
    message.classList.remove('hidden');
    
    setTimeout(() => {
        message.classList.add('hidden');
    }, 5000);
}

// Mostrar/ocultar loading
function showLoading() {
    loading.classList.remove('hidden');
}

function hideLoading() {
    loading.classList.add('hidden');
}

// Verificar se usuário já está logado
function checkAuth() {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    if (token && user) {
        showDashboard(JSON.parse(user), token);
    }
}

// Mostrar dashboard
function showDashboard(user, token) {
    document.getElementById('userName').textContent = user.nome;
    document.getElementById('userEmail').textContent = user.email;
    document.getElementById('userToken').textContent = token.substring(0, 50) + '...';
    
    authContainer.classList.add('hidden');
    dashboard.classList.remove('hidden');
}

// Logout
function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    dashboard.classList.add('hidden');
    authContainer.classList.remove('hidden');
    
    // Reset forms
    loginForm.reset();
    registerForm.reset();
    showLogin();
    
    showMessage('Logout realizado com sucesso!');
}

// Event Listeners
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    try {
        showLoading();
        
        const response = await fetch(`${API_BASE}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, senha: password }),
        });
        
        const data = await response.json();
        
        if (response.ok) {
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.usuario));
            showDashboard(data.usuario, data.token);
            showMessage('Login realizado com sucesso!');
        } else {
            showMessage(data.erro || 'Erro no login', 'error');
        }
    } catch (error) {
        showMessage('Erro de conexão. Verifique se o servidor está rodando.', 'error');
        console.error('Erro no login:', error);
    } finally {
        hideLoading();
    }
});

registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const name = document.getElementById('registerName').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    
    try {
        showLoading();
        
        const response = await fetch(`${API_BASE}/cadastro`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
                nome: name, 
                email: email, 
                senha: password 
            }),
        });
        
        const data = await response.json();
        
        if (response.ok) {
            showMessage('Cadastro realizado com sucesso! Faça login.');
            showLogin();
            registerForm.reset();
        } else {
            showMessage(data.erro || 'Erro no cadastro', 'error');
        }
    } catch (error) {
        showMessage('Erro de conexão. Verifique se o servidor está rodando.', 'error');
        console.error('Erro no cadastro:', error);
    } finally {
        hideLoading();
    }
});

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    showLogin();
});