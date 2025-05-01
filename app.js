require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session'); // Import session middleware

const app = express();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public'));
app.set('view engine', 'ejs');

// Configure session middleware
app.use(session({
    secret: process.env.SESSION_SECRET, // Use a secret from your .env file
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Set secure: true if using HTTPS
}));

// Disable caching to prevent back button access after logout
app.use((req, res, next) => {
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
    next();
});

// Routes
app.use('/auth', require('./routes/auth'));
app.use('/admin', require('./routes/admin'));
app.use('/forms', require('./routes/forms'));

// Default route
app.get('/', (req, res) => {
    if (req.session.username) {
        res.redirect('/forms/level1');
    } else {
        res.redirect('/auth/login');
    }
});

// Redirect to login if no session exists
app.use((req, res) => {
    res.redirect('/auth/login');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
