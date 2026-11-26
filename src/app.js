
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const authRoutes = require('./routes/auth.routes');

const app = express();

// Seguridad HTTP
app.use(helmet());

// Configuración CORS
app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173'
}));

// Recibir JSON
app.use(express.json({ limit: '10kb' }));

// Ruta de prueba
app.get('/api/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'API de autenticacion funcionando correctamente',
        status: 'online',
        timestamp: new Date()
    });
});

// Rutas de autenticación
app.use('/api/auth', authRoutes);

// Ruta no encontrada
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Ruta no encontrada'
    });
});

module.exports = app;

