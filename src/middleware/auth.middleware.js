
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authMiddleware = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'No se proporcionó un token de autenticación'
            });
        }

        const token = authHeader.split(' ')[1];

        // Verificar que el JWT sea válido
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        // Buscar al usuario en MongoDB
        const user = await User.findById(decoded.sub);

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }

        // Comprobar la versión del token
        if (decoded.ver !== user.tokenVersion) {
            return res.status(401).json({
                success: false,
                message: 'Sesión inválida o cerrada'
            });
        }

        // Guardar el identificador del usuario
        req.userId = user._id;

        next();

    } catch (error) {
        return res.status(401).json({
            success: false,
            message: 'Token inválido o expirado'
        });
    }
};

module.exports = authMiddleware;

