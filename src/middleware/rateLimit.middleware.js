
const rateLimit = require('express-rate-limit');

// Limitar intentos de inicio de sesión y registro
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 10,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    message: {
        success: false,
        message: 'Demasiadas solicitudes. Intenta nuevamente más tarde.'
    }
});

// Limitar solicitudes de recuperación de contraseña
const passwordResetLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 5,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    message: {
        success: false,
        message: 'Demasiados intentos de recuperación. Intenta más tarde.'
    }
});

module.exports = {
    authLimiter,
    passwordResetLimiter
};
