
require('dotenv').config();

const app = require('./app');
const connectDB = require('./config/database');

const PORT = process.env.PORT || 3000;

const startServer = async () => {
    try {
        // Conectar con MongoDB
        await connectDB();

        // Iniciar servidor
        app.listen(PORT, () => {
            console.log('=================================');
            console.log(' API DE AUTENTICACION');
            console.log(` Servidor: http://localhost:${PORT}`);
            console.log(` Entorno: ${process.env.NODE_ENV}`);
            console.log('=================================');
        });

    } catch (error) {
        console.error('Error al iniciar el servidor:', error);
        process.exit(1);
    }
};

startServer();
