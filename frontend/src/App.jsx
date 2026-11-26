
import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthProvider';
import { useAuth } from './context/useAuth';

// Cargar las páginas solamente cuando sean necesarias
const Login = lazy(() => import('./pages/Login.jsx'));
const Register = lazy(() => import('./pages/Register.jsx'));
const Profile = lazy(() => import('./pages/Profile.jsx'));
const Transpiler = lazy(() => import('./pages/Transpiler.jsx'));

function PrivateRoute({ children }) {
    const { token, loading } = useAuth();

    if (loading) {
        return <div className="container mt-5">Verificando sesión...</div>;
    }

    return token
        ? children
        : <Navigate to="/login" replace />;
}

function PublicRoute({ children }) {
    const { token, loading } = useAuth();

    if (loading) {
        return <div className="container mt-5">Verificando sesión...</div>;
    }

    return token
        ? <Navigate to="/perfil" replace />
        : children;
}

function AppRoutes() {
    return (
        <Suspense
            fallback={
                <div className="container mt-5">
                    Cargando página...
                </div>
            }
        >
            <Routes>
                <Route
                    path="/"
                    element={<Navigate to="/login" replace />}
                />

                <Route
                    path="/login"
                    element={
                        <PublicRoute>
                            <Login />
                        </PublicRoute>
                    }
                />

                <Route
                    path="/registro"
                    element={
                        <PublicRoute>
                            <Register />
                        </PublicRoute>
                    }
                />

                <Route
                    path="/perfil"
                    element={
                        <PrivateRoute>
                            <Profile />
                        </PrivateRoute>
                    }
                />

                <Route
                    path="/transpilador"
                    element={
                        <PrivateRoute>
                            <Transpiler />
                        </PrivateRoute>
                    }
                />

                <Route
                    path="*"
                    element={<Navigate to="/" replace />}
                />
            </Routes>
        </Suspense>
    );
}

function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <AppRoutes />
            </BrowserRouter>
        </AuthProvider>
    );
}

export default App;

