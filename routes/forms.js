const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('../middleware/auth');

router.get('/level1', isAuthenticated, (req, res) => {
    res.render('forms/level1', { username: req.session.username });
});

router.get('/level2', isAuthenticated, (req, res) => {
    res.render('forms/level2', { username: req.session.username });
});

router.get('/level3', isAuthenticated, (req, res) => {
    res.render('forms/level3', { username: req.session.username });
});

router.get('/view/level3', isAuthenticated, (req, res) => {
    res.render('forms/view-level3', { username: req.session.username });
});

module.exports = router;
