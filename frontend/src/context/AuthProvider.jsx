import { useEffect, useState, useCallback } from 'react';
import { AuthContext } from './AuthContext.jsx';
import { api } from '../services/api';

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(() => sessionStorage.getItem('token'));
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const restoreSession = async () => {
            const savedToken = sessionStorage.getItem('token');

            if (!savedToken) {
                setLoading(false);
                return;
            }

            try {
                const data = await api.getProfile(savedToken);
                setToken(savedToken);
                setUser(data.user);
            } catch {
                sessionStorage.removeItem('token');
                setToken(null);
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        restoreSession();
    }, []);

    const register = async (userData) => {
        const data = await api.register(userData);

        sessionStorage.setItem('token', data.token);
        setToken(data.token);
        setUser(data.user);

        return data;
    };

    const login = async (credentials) => {
        const data = await api.login(credentials);

        sessionStorage.setItem('token', data.token);
        setToken(data.token);
        setUser(data.user);

        return data;
    };

    const logout = useCallback(async () => {
        const currentToken = token;

        try {
            if (currentToken) {
                await api.logout(currentToken);
            }
        } catch (error) {
            console.error(
                'Error al cerrar sesión en el servidor:',
                error.message
            );
        } finally {
            sessionStorage.removeItem('token');
            setToken(null);
            setUser(null);
        }
    }, [token]);

    const value = {
        user,
        token,
        loading,
        register,
        login,
        logout
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}
