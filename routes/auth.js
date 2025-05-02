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
        console.log('Login attempt:', { username, password }); // Log login attempt

        const user = await User.findOne({ username, password });
        if (user) {
            console.log('User found:', user); // Log user details
            req.session.username = user.username;
            req.session.userLevel = user.level;
            req.session.save();

            user.lastLoginAt = new Date();
            await user.save();

            res.json({
                success: true,
                username: user.username,
                redirect: '/forms/dashboard/level' + user.level
            });
        } else {
            console.log('Invalid credentials'); // Log invalid credentials
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

router.post('/logout', async (req, res) => {
    try {
        if (req.session.username) {
            const user = await User.findOne({ username: req.session.username });
            if (user) {
                user.lastLogoutAt = new Date();
                await user.save();
            }
        }

        req.session.destroy((err) => {
            if (err) {
                console.error('Error destroying session:', err);
                return res.status(500).json({ success: false, message: 'Logout failed' });
            }
            res.clearCookie('connect.sid'); // Clear session cookie
            res.json({ success: true, message: 'Logged out successfully' });
        });
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({ success: false, message: 'Logout failed' });
    }
});

module.exports = router;
