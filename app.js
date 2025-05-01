require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session'); // Import session middleware
const path = require('path'); // Import path module
const MongoStore = require('connect-mongo'); // Add this line

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
app.set('views', path.join(__dirname, 'views')); // Explicitly set the views directory

// Configure session middleware
app.use(session({
    secret: process.env.SESSION_SECRET, // Use a secret from your .env file
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create({
        mongoUrl: process.env.MONGO_URI,
        collectionName: 'sessions'
    }),
    cookie: {
        secure: false, // Set to false for HTTP testing, true for production HTTPS
        httpOnly: true,
        sameSite: 'lax',
        maxAge: 24 * 60 * 60 * 1000 // 1 day (adjust as needed)
    }
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

const PORT = process.env.PORT || 3000; // Ensure PORT is dynamically assigned
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
