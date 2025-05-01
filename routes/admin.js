const express = require('express');
const router = express.Router();
const { isAdmin } = require('../middleware/auth');
const User = require('../models/User');

router.get('/dashboard', isAdmin, async (req, res) => {
    try {
        const users = await User.find({});
        res.render('admin/dashboard', { users, isAdmin: req.session.isAdmin });
    } catch (error) {
        res.redirect('/auth/admin-login');
    }
});

router.post('/create-user', isAdmin, async (req, res) => {
    try {
        const { username, password, level } = req.body;
        await new User({ username, password, level }).save();
        res.redirect('/admin/dashboard');
    } catch (error) {
        res.redirect('/admin/dashboard');
    }
});

router.post('/delete-user/:id', isAdmin, async (req, res) => {
    try {
        await require('../models/User').findByIdAndDelete(req.params.id);
        res.redirect('/admin/dashboard');
    } catch (err) {
        console.error(err);
        res.redirect('/admin/dashboard');
    }
});

module.exports = router;
