
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const { z } = require('zod');
const User = require('../models/User');

const requestSchema = z.object({
    email: z.string().email().max(254)
});

const resetSchema = z.object({
    token: z.string().min(1),
    password: z.string().min(8).max(128)
});

// Solicitar recuperación de contraseña
const requestPasswordReset = async (req, res) => {
console.log('DEBUG: Se recibió una solicitud de recuperación');
console.log('NODE_ENV:', process.env.NODE_ENV);
    try {
        const validation = requestSchema.safeParse(req.body);

        if (!validation.success) {
            return res.status(400).json({
                success: false,
                message: 'Introduce un correo válido'
            });
        }

        const email = validation.data.email.toLowerCase().trim();

        const user = await User.findOne({ email });

        // Misma respuesta exista o no el correo
        const response = {
            success: true,
            message: 'Si el correo está registrado, recibirás instrucciones para recuperar tu contraseña'
        };

        if (!user) {
            return res.status(200).json(response);
        }

        const resetToken = crypto.randomBytes(32).toString('hex');

        const hashedToken = crypto
            .createHash('sha256')
            .update(resetToken)
            .digest('hex');

        user.resetPasswordToken = hashedToken;
        user.resetPasswordExpires = Date.now() + 15 * 60 * 1000;

        await user.save();

        // Temporalmente se muestra en desarrollo.
        // Después se enviará por correo electrónico.
        if (process.env.NODE_ENV === 'development') {
            console.log('Token de recuperación:', resetToken);
        }

        return res.status(200).json(response);

    } catch (error) {
        console.error('Error al solicitar recuperación:', error.message);

        return res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
};

// Restablecer contraseña
const resetPassword = async (req, res) => {
    try {
        const validation = resetSchema.safeParse(req.body);

        if (!validation.success) {
            return res.status(400).json({
                success: false,
                message: 'Datos de recuperación inválidos'
            });
        }

        const { token, password } = validation.data;

        const hashedToken = crypto
            .createHash('sha256')
            .update(token)
            .digest('hex');

        const user = await User.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpires: { $gt: new Date() }
        }).select('+resetPasswordToken +resetPasswordExpires');

        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'El token es inválido o ha expirado'
            });
        }

        user.password = await bcrypt.hash(password, 12);

        user.resetPasswordToken = null;
        user.resetPasswordExpires = null;

        user.tokenVersion += 1;

        await user.save();

        return res.status(200).json({
            success: true,
            message: 'Contraseña actualizada correctamente'
        });

    } catch (error) {
        console.error('Error al restablecer contraseña:', error.message);

        return res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
};

module.exports = {
    requestPasswordReset,
    resetPassword
};
