require('dotenv').config();
const mongoose = require('mongoose');
const Admin = require('../models/Admin');

const initializeAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        // Remove existing admin if any
        await Admin.deleteMany({});
        console.log('Cleared existing admins');

        // Create new admin
        const admin = new Admin({ pin: '123456' });
        await admin.save();
        console.log('Admin initialized with PIN: 123456');

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
};

initializeAdmin();
