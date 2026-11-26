
const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const connection = await mongoose.connect(process.env.MONGODB_URI);

        console.log('=================================');
        console.log(' MongoDB conectado correctamente');
        console.log(` Servidor: ${connection.connection.host}`);
        console.log(` Base de datos: ${connection.connection.name}`);
        console.log('=================================');

    } catch (error) {
        console.error('Error al conectar con MongoDB:', error.message);
        process.exit(1);
    }
};

module.exports = connectDB;
