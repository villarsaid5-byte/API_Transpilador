
const API_URL = 'http://localhost:3000/api';

export const api = {
    async request(endpoint, options = {}) {
        const response = await fetch(`${API_URL}${endpoint}`, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            }
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Ocurrió un error en la solicitud');
        }

        return data;
    },

    register(userData) {
        return this.request('/auth/register', {
            method: 'POST',
            body: JSON.stringify(userData)
        });
    },

    login(credentials) {
        return this.request('/auth/login', {
            method: 'POST',
            body: JSON.stringify(credentials)
        });
    },

    getProfile(token) {
    return this.request('/auth/profile', {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
},

    // Cerrar sesión
    logout(token) {
    return this.request('/auth/logout', {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
}
};
