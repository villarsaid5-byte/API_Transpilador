
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'El nombre es obligatorio'],
            trim: true,
            minlength: 3,
            maxlength: 80
        },

        email: {
            type: String,
            required: [true, 'El correo es obligatorio'],
            unique: true,
            lowercase: true,
            trim: true,
            maxlength: 254
        },

        password: {
            type: String,
            required: [true, 'La contraseña es obligatoria'],
            minlength: 8,
            select: false
        },

        tokenVersion: {
            type: Number,
            default: 0
        },

        resetPasswordToken: {
            type: String,
            default: null,
            select: false
        },

        resetPasswordExpires: {
            type: Date,
            default: null,
            select: false
        }
    },
    {
        timestamps: true,
        versionKey: false
    }
);

const User = mongoose.model('User', userSchema);

module.exports = User;
