require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const createTestUser = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        // Create a test user
        const user = new User({
            username: 'testuser',
            password: 'testpassword',
            level: 1
        });
        await user.save();
        console.log('Test user created:', user);
    } catch (error) {
        console.error('Error creating test user:', error);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
};

createTestUser();
