import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import { api } from '../services/api';

function Profile() {
    const { token, logout } = useAuth();
    const navigate = useNavigate();

    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const loadProfile = async () => {
            try {
                const data = await api.getProfile(token);
                setUser(data.user);
            } catch (err) {
                setError(err.message);

                if (err.message.includes('Token')) {
                    logout();
                    navigate('/login');
                }
            } finally {
                setLoading(false);
            }
        };

        loadProfile();
    }, [token, logout, navigate]);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    if (loading) {
        return <div className="container mt-5">Cargando perfil...</div>;
    }

    if (error) {
        return (
            <div className="container mt-5 alert alert-danger">
                {error}
            </div>
        );
    }

    return (
        <div className="container mt-5">
            <div className="card shadow mx-auto" style={{ maxWidth: '600px' }}>
                <div className="card-body p-4">
                    <h2 className="mb-3">Mi perfil</h2>

                    {user && (
                        <>
                            <p><strong>Nombre:</strong> {user.name}</p>
                            <p><strong>Correo:</strong> {user.email}</p>
                            <p><strong>ID:</strong> {user.id}</p>
                            <p>
                                <strong>Fecha de registro:</strong>{' '}
                                {new Date(user.createdAt).toLocaleDateString()}
                            </p>
                        </>
                    )}

                    <div className="d-flex flex-wrap gap-2 mt-4">
                        <button
                            className="btn btn-primary"
                            onClick={() => navigate('/transpilador')}
                        >
                            <i className="bi bi-code-slash me-2"></i>
                            Abrir transpilador
                        </button>

                        <button
                            className="btn btn-danger"
                            onClick={handleLogout}
                        >
                            <i className="bi bi-box-arrow-right me-2"></i>
                            Cerrar sesión
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Profile;
