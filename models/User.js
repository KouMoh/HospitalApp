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
    }
});

module.exports = mongoose.model('User', userSchema);
