
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { z } = require('zod');
const User = require('../models/User');

// ======================================
// VALIDACIÓN DE DATOS
// ======================================

// Validación para registrar usuarios
const registerSchema = z.object({
    name: z.string()
        .trim()
        .min(3, 'El nombre debe tener al menos 3 caracteres')
        .max(80, 'El nombre no puede superar 80 caracteres'),

    email: z.string()
        .trim()
        .email('El correo electrónico no es válido')
        .max(254)
        .transform(value => value.toLowerCase()),

    password: z.string()
        .min(8, 'La contraseña debe tener al menos 8 caracteres')
        .max(72, 'La contraseña no puede superar 72 caracteres')
});

// Validación para iniciar sesión
const loginSchema = z.object({
    email: z.string()
        .trim()
        .email('El correo electrónico no es válido')
        .max(254)
        .transform(value => value.toLowerCase()),

    password: z.string()
        .min(1, 'La contraseña es obligatoria')
        .max(72, 'La contraseña no puede superar 72 caracteres')
});

// ======================================
// GENERAR TOKEN JWT
// ======================================


const generateToken = (userId, tokenVersion) => {
    if (!process.env.JWT_SECRET) {
        throw new Error('JWT_SECRET no está configurado');
    }

    return jwt.sign(
        {
            sub: userId.toString(),
            ver: tokenVersion
        },
        process.env.JWT_SECRET,
        {
            expiresIn: process.env.JWT_EXPIRES_IN || '1d'
        }
    );
};


// ======================================
// REGISTRAR USUARIO
// ======================================

const register = async (req, res) => {

    try {

        // Validar información recibida
        const validation = registerSchema.safeParse(req.body);

        if (!validation.success) {
            return res.status(400).json({
                success: false,
                message: 'Datos inválidos',
                errors: validation.error.issues.map(error => ({
                    field: error.path.join('.'),
                    message: error.message
                }))
            });
        }

        const { name, email, password } = validation.data;

        // Comprobar si el correo ya existe
        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: 'El correo electrónico ya está registrado'
            });
        }

        // Generar hash de la contraseña
        const hashedPassword = await bcrypt.hash(password, 12);

        // Crear usuario en MongoDB
        const user = await User.create({
            name,
            email,
            password: hashedPassword
        });

        // Generar token de autenticación
	const token = generateToken(user._id, user.tokenVersion);

        // Respuesta exitosa
        return res.status(201).json({
            success: true,
            message: 'Usuario registrado correctamente',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                createdAt: user.createdAt
            }
        });

    } catch (error) {

        // Controlar correos duplicados
        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message: 'El correo electrónico ya está registrado'
            });
        }

        console.error('Error en registro:', error.message);

        return res.status(500).json({
            success: false,
            message: 'Error interno al registrar el usuario'
        });
    }
};

// ======================================
// INICIAR SESIÓN
// ======================================

const login = async (req, res) => {

    try {

        // Validar información recibida
        const validation = loginSchema.safeParse(req.body);

        if (!validation.success) {
            return res.status(400).json({
                success: false,
                message: 'Datos inválidos',
                errors: validation.error.issues.map(error => ({
                    field: error.path.join('.'),
                    message: error.message
                }))
            });
        }

        const { email, password } = validation.data;

        // Buscar usuario incluyendo su contraseña
        const user = await User.findOne({ email })
            .select('+password');

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Correo o contraseña incorrectos'
            });
        }

        // Comparar contraseña con el hash almacenado
        const passwordValid = await bcrypt.compare(
            password,
            user.password
        );

        if (!passwordValid) {
            return res.status(401).json({
                success: false,
                message: 'Correo o contraseña incorrectos'
            });
        }

        // Generar token JWT
	const token = generateToken(user._id, user.tokenVersion);

        // Respuesta exitosa
        return res.status(200).json({
            success: true,
            message: 'Inicio de sesión correcto',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });

    } catch (error) {

        console.error('Error en login:', error.message);

        return res.status(500).json({
            success: false,
            message: 'Error interno al iniciar sesión'
        });
    }
};

// ======================================
// CERRAR SESIÓN
// ======================================

const logout = async (req, res) => {
    try {
        await User.updateOne(
            { _id: req.userId },
            { $inc: { tokenVersion: 1 } }
        );

        return res.status(200).json({
            success: true,
            message: 'Sesión cerrada correctamente'
        });

    } catch (error) {
        console.error('Error al cerrar sesión:', error.message);

        return res.status(500).json({
            success: false,
            message: 'Error interno al cerrar sesión'
        });
    }
};

// ======================================
// EXPORTAR FUNCIONES
// ======================================

module.exports = {
    register,
    login,
    logout
};
