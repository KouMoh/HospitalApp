const mongoose = require('mongoose');

const formSchema = new mongoose.Schema({
    uid: {
        type: String,
        unique: true,
        sparse: true // Only enforce uniqueness when present (for Level-1)
    },
    title: {
        type: String,
        required: true
    },
    content: {
        type: mongoose.Schema.Types.Mixed, // Accepts objects for Level-1 forms
        required: true
    },
    level: {
        type: Number,
        required: true,
        enum: [1, 2, 3] // Restrict levels to 1, 2, or 3
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Form', formSchema);
