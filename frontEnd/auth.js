// auth.js - Guardar este archivo en la misma carpeta que tus HTML

const API_BASE = 'http://localhost:3002/api';

// Verificar autenticaciÃ³n
function verificarAutenticacion() {
    const token = localStorage.getItem('token');
    const usuario = localStorage.getItem('usuario');
    
    if (!token || !usuario) {
        window.location.href = 'login.html';
        return null;
    }
    
    return JSON.parse(usuario);
}

// Obtener headers con token
function getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
}

// Realizar peticiÃ³n autenticada
async function fetchAuth(url, options = {}) {
    const defaultOptions = {
        headers: getAuthHeaders()
    };
    
    const mergedOptions = {
        ...defaultOptions,
        ...options,
        headers: {
            ...defaultOptions.headers,
            ...options.headers
        }
    };
    
    try {
        const response = await fetch(`${API_BASE}${url}`, mergedOptions);
        
        // Si token expirÃ³ o no es vÃ¡lido
        if (response.status === 401 || response.status === 403) {
            localStorage.clear();
            window.location.href = 'login.html';
            return null;
        }
        
        return await response.json();
    } catch (error) {
        console.error('Error en peticiÃ³n:', error);
        throw error;
    }
}

// Cerrar sesiÃ³n
async function cerrarSesion() {
    try {
        await fetchAuth('/usuario/logout', { method: 'POST' });
    } catch (error) {
        console.error('Error al cerrar sesiÃ³n:', error);
    } finally {
        localStorage.clear();
        window.location.href = 'login.html';
    }
}

// Obtener usuario actual
function getUsuarioActual() {
    const usuario = localStorage.getItem('usuario');
    return usuario ? JSON.parse(usuario) : null;
}

// Formatear fecha
function formatearFecha(fecha) {
    const opciones = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    };
    return new Date(fecha).toLocaleDateString('es-MX', opciones);
}

// Formatear hora
function formatearHora(fecha) {
    return new Date(fecha).toLocaleTimeString('es-MX', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
}