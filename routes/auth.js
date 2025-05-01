const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Admin = require('../models/Admin');

router.get('/login', (req, res) => {
    res.render('login');
});

router.get('/admin-login', (req, res) => {
    res.render('admin-login');
});

router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username, password });
        
        if (user) {
            req.session.username = user.username; // Set session username
            req.session.userLevel = user.level;  // Set session level
            req.session.save(); // Ensure session is saved
            res.json({
                success: true,
                username: user.username,
                redirect: '/forms/level' + user.level
            });
        } else {
            res.json({ success: false });
        }
    } catch (error) {
        console.error('Login error:', error);
        res.json({ success: false });
    }
});

router.post('/admin-login', async (req, res) => {
    try {
        const { pin } = req.body;
        const admin = await Admin.findOne({ pin });
        
        if (admin) {
            req.session.isAdmin = true; // Set admin session
            res.redirect('/admin/dashboard');
        } else {
            res.redirect('/auth/admin-login');
        }
    } catch (error) {
        console.error('Admin login error:', error);
        res.redirect('/auth/admin-login');
    }
});

router.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Error destroying session:', err);
        }
        res.clearCookie('connect.sid'); // Clear session cookie
        res.redirect('/auth/login');
    });
});

router.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Error destroying session:', err);
            return res.status(500).json({ success: false, message: 'Logout failed' });
        }
        res.clearCookie('connect.sid'); // Clear session cookie
        res.json({ success: true, message: 'Logged out successfully' });
    });
});

module.exports = router;
