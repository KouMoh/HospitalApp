const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    level: {
        type: Number,
        required: true,
        enum: [1, 2, 3]
    },
    lastLoginAt: {
        type: Date,
        default: null
    },
    lastLogoutAt: {
        type: Date,
        default: null
    }
});

module.exports = mongoose.model('User', userSchema);
