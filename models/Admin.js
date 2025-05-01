const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
    pin: String
});

module.exports = mongoose.model('Admin', adminSchema);
