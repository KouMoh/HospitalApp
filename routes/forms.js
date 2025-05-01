const express = require('express');
const router = express.Router();
const { isAuthenticated, checkViewAccess } = require('../middleware/auth');
const Form = require('../models/Form'); // Assuming a Form model exists

// Helper to generate UID (e.g., ADPCT-YYYYMMDD-001)
async function generateUID() {
    const date = new Date();
    const ymd = date.toISOString().slice(0,10).replace(/-/g,'');
    // Find the highest suffix for today
    const regex = new RegExp(`^ADPCT-${ymd}-(\\d{3})$`);
    const latest = await Form.findOne({ level: 1, uid: { $regex: regex } })
        .sort({ uid: -1 })
        .select('uid');
    let nextNum = 1;
    if (latest && latest.uid) {
        const match = latest.uid.match(/-(\d{3})$/);
        if (match) {
            nextNum = parseInt(match[1], 10) + 1;
        }
    }
    if (nextNum > 999) {
        throw new Error('Maximum Level-1 forms reached for today (999)');
    }
    const suffix = String(nextNum).padStart(3, '0');
    return `ADPCT-${ymd}-${suffix}`;
}

// Level-1 form: generate UID and pass to form
router.get('/level1', isAuthenticated, async (req, res) => {
    try {
        const forms = await Form.find({ level: 1 }); // Fetch Level 1 forms
        const uid = await generateUID();
        const success = req.query.success === '1';
        res.render('forms/level1', { username: req.session.username, forms, uid, success });
    } catch (error) {
        console.error('Error fetching Level 1 forms or generating UID:', error);
        res.status(500).send('Error: ' + (error.message || 'Could not generate UID'));
    }
});

// Level-2 form: render form page with Level-1 UIDs
router.get('/level2', isAuthenticated, async (req, res) => {
    try {
        const forms = await Form.find({ level: 2 });
        const level1Forms = await Form.find({ level: 1 }, { uid: 1, 'content.name': 1, 'content.age': 1, 'content.gender': 1, 'content.sex': 1 }).sort({ createdAt: -1 });
        const success = req.query.success === '1';
        res.render('forms/level2', { username: req.session.username, forms, success, level1Forms });
    } catch (error) {
        console.error('Error fetching Level 2 forms:', error);
        res.redirect('/auth/login');
    }
});

// AJAX endpoint to fetch Level-1 details by UID
router.get('/level1/details/:uid', isAuthenticated, async (req, res) => {
    try {
        const form = await Form.findOne({ level: 1, uid: req.params.uid });
        if (!form) return res.status(404).json({ error: 'Not found' });
        res.json({
            name: form.content.name || '',
            age: form.content.age || '',
            sex: form.content.sex || form.content.gender || '',
            diagnosis: form.content.diagnosis || ''
        });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// POST handler to save Level-2 form data
router.post('/level2/submit', isAuthenticated, async (req, res) => {
    try {
        await Form.create({
            title: req.body.name ? `Psycho-Social Assessment: ${req.body.name}` : 'Level 2 Psycho-Social Assessment',
            content: req.body,
            level: 2
        });
        res.redirect('/forms/level2?success=1');
    } catch (error) {
        console.error('Error saving Level 2 form:', error);
        res.redirect('/forms/level2');
    }
});

// Level-3 form: fetch all Level-1 UIDs for dropdown
router.get('/level3', isAuthenticated, async (req, res) => {
    try {
        const forms = await Form.find({ level: 3 }); // Fetch Level 3 forms
        const level1Forms = await Form.find({ level: 1 }, { uid: 1, 'content.name': 1 }).sort({ createdAt: -1 });
        const success = req.query.success === '1';
        res.render('forms/level3', { username: req.session.username, forms, level1Forms, success });
    } catch (error) {
        console.error('Error fetching Level 3 forms:', error);
        res.redirect('/auth/login');
    }
});

// POST handler to save Level-3 form data
router.post('/level3/submit', isAuthenticated, async (req, res) => {
    try {
        await Form.create({
            title: req.body.patient_name ? `OPD/Teleconsultation Record: ${req.body.patient_name}` : 'Level 3 OPD/Teleconsultation Record',
            content: req.body,
            level: 3
        });
        res.redirect('/forms/level3?success=1');
    } catch (error) {
        console.error('Error saving Level 3 form:', error);
        res.redirect('/forms/level3');
    }
});

// POST handler to save Level-1 form data with UID
router.post('/level1/submit', isAuthenticated, async (req, res) => {
    try {
        const { uid, ...formData } = req.body;
        await Form.create({
            uid,
            title: formData.name ? `Case Record: ${formData.name}` : 'Level 1 Case Record',
            content: formData,
            level: 1
        });
        res.redirect('/forms/level1?success=1');
    } catch (error) {
        console.error('Error saving Level 1 form:', error);
        res.redirect('/forms/level1');
    }
});

// Level-3: Read-only view for Level-1 forms
router.get('/view/level1', isAuthenticated, (req, res, next) => {
    req.params.level = 1; // Explicitly set the requested level
    next();
}, checkViewAccess, async (req, res) => {
    try {
        const forms = await Form.find({ level: 1 }).sort({ createdAt: -1 }); // Fetch Level 1 forms
        res.render('forms/view-level1', { username: req.session.username, forms });
    } catch (error) {
        console.error('Error fetching Level 1 forms:', error);
        res.redirect('/auth/login');
    }
});

router.get('/view/level2', isAuthenticated, (req, res, next) => {
    req.params.level = 2; // Explicitly set the requested level
    next();
}, checkViewAccess, async (req, res) => {
    try {
        const forms = await Form.find({ level: 2 }); // Fetch Level 2 forms
        res.render('forms/view-level2', { username: req.session.username, forms });
    } catch (error) {
        console.error('Error fetching Level 2 forms:', error);
        res.redirect('/auth/login');
    }
});

// Level-1: Read-only view for Level-3 forms
router.get('/view/level3', isAuthenticated, (req, res, next) => {
    req.params.level = 3; // Explicitly set the requested level
    next();
}, checkViewAccess, async (req, res) => {
    try {
        // Show Level-3 forms in Level-1 view as read-only
        const forms = await Form.find({ level: 3 }).sort({ createdAt: -1 });
        res.render('forms/view-level3', { username: req.session.username, forms });
    } catch (error) {
        console.error('Error fetching Level 3 forms for Level 1 view:', error);
        res.redirect('/auth/login');
    }
});

module.exports = router;
