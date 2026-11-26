
const express = require('express');
const router = express.Router();

const {
    register,
    login,
    logout
} = require('../controllers/auth.controller');

const {
    requestPasswordReset,
    resetPassword
} = require('../controllers/password.controller');

const {
    authLimiter,
    passwordResetLimiter
} = require('../middleware/rateLimit.middleware');

const authMiddleware = require('../middleware/auth.middleware');
const User = require('../models/User');

// Registro
router.post('/register', authLimiter, register);

// Inicio de sesión
router.post('/login', authLimiter, login);

// Cierre de sesión
router.post('/logout', authMiddleware, logout);

// Perfil privado
router.get('/profile', authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Perfil obtenido correctamente',
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                createdAt: user.createdAt
            }
        });

    } catch (error) {
        console.error('Error al obtener perfil:', error.message);

        return res.status(500).json({
            success: false,
            message: 'Error interno al obtener el perfil'
        });
    }
});

// Recuperación de contraseña
router.post('/forgot-password', passwordResetLimiter, requestPasswordReset);

router.post('/reset-password', passwordResetLimiter, resetPassword);

module.exports = router;

