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
    
    // Define dropdown options for the form
    const formOptions = {
      districts: ['Dibrugarh', 'Tinsukia', 'Sivasagar', 'Jorhat', 'Golaghat', 'Other'],
      bodyLocations: ['Head', 'Neck', 'Breast', 'Lungs', 'Stomach', 'Liver', 'Colon', 'Rectum', 'Prostate', 'Ovary', 'Uterus', 'Bone', 'Skin', 'Brain', 'Blood', 'Lymph Nodes', 'Other'],
      painLocations: ['Head', 'Neck', 'Chest', 'Abdomen', 'Back', 'Arms', 'Legs', 'Joints', 'Other'],
      comorbidities: ['Diabetes Mellitus (DM)', 'Hypertension (HTN)', 'COPD', 'Cardiac Disease', 'Mental Illness', 'Renal Disease', 'Hepatic Disease', 'Allergy', 'None', 'Other'],
      oralConditions: ['Normal', 'Thrush', 'Ulcer', 'Dental Caries', 'Bleeding', 'Bad Odor', 'Other']
    };
    
    res.render('forms/level1', { 
      username: req.session.username, 
      forms, 
      uid, 
      success, 
      options: formOptions,
      editMode: false
    });
  } catch (error) {
    console.error('Error fetching Level 1 forms or generating UID:', error);
    res.status(500).send('Error: ' + (error.message || 'Could not generate UID'));
  }
});

// Edit Level-1 form
router.get('/level1/edit/:id', isAuthenticated, async (req, res) => {
  try {
    const form = await Form.findById(req.params.id);
    
    if (!form) {
      return res.status(404).send('Form not found');
    }
    
    // Check if user is allowed to edit this form
    if (!form.isEditable(req.session.username)) {
      return res.status(403).send('You cannot edit this form anymore. The 24-hour edit period has expired or you are not the creator.');
    }
    
    // Define dropdown options for the form
    const formOptions = {
      districts: ['Dibrugarh', 'Tinsukia', 'Sivasagar', 'Jorhat', 'Golaghat', 'Other'],
      bodyLocations: ['Head', 'Neck', 'Breast', 'Lungs', 'Stomach', 'Liver', 'Colon', 'Rectum', 'Prostate', 'Ovary', 'Uterus', 'Bone', 'Skin', 'Brain', 'Blood', 'Lymph Nodes', 'Other'],
      painLocations: ['Head', 'Neck', 'Chest', 'Abdomen', 'Back', 'Arms', 'Legs', 'Joints', 'Other'],
      comorbidities: ['Diabetes Mellitus (DM)', 'Hypertension (HTN)', 'COPD', 'Cardiac Disease', 'Mental Illness', 'Renal Disease', 'Hepatic Disease', 'Allergy', 'None', 'Other'],
      oralConditions: ['Normal', 'Thrush', 'Ulcer', 'Dental Caries', 'Bleeding', 'Bad Odor', 'Other']
    };
    
    res.render('forms/level1', { 
      username: req.session.username, 
      form, 
      uid: form.uid, 
      editMode: true,
      options: formOptions
    });
  } catch (error) {
    console.error('Error fetching form for edit:', error);
    res.status(500).send('Error: ' + (error.message || 'Could not load form for editing'));
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
      level: 2,
      createdBy: req.session.username
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
      level: 3,
      createdBy: req.session.username
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
    
    // Validate phone number
    if (!formData.contact_phone || !/^\+?[0-9]{10,12}$/.test(formData.contact_phone.replace(/\s/g, ''))) {
      return res.status(400).send('Invalid phone number format. Please provide a 10-digit number.');
    }
    
    // Format phone numbers with country code if not present
    if (formData.contact_phone && !formData.contact_phone.startsWith('+')) {
      formData.contact_phone = '+91' + formData.contact_phone.replace(/\s/g, '');
    }
    
    if (formData.caregiver_phone && !formData.caregiver_phone.startsWith('+')) {
      formData.caregiver_phone = '+91' + formData.caregiver_phone.replace(/\s/g, '');
    }
    
    // If referred_from is filled, set self_referred to "no"
    if (formData.referred_from && formData.referred_from.trim() !== '') {
      formData.self_referred = 'no';
    }
    
    await Form.create({
      uid,
      title: formData.name ? `Case Record: ${formData.name}` : 'Level 1 Case Record',
      content: formData,
      level: 1,
      createdBy: req.session.username
    });
    
    res.redirect('/forms/level1?success=1');
  } catch (error) {
    console.error('Error saving Level 1 form:', error);
    res.status(400).send('Error: ' + (error.message || 'Could not save form'));
  }
});

// Update Level-1 form
router.post('/level1/update/:id', isAuthenticated, async (req, res) => {
  try {
    const form = await Form.findById(req.params.id);
    
    if (!form) {
      return res.status(404).send('Form not found');
    }
    
    // Check if user is allowed to edit this form
    if (!form.isEditable(req.session.username)) {
      return res.status(403).send('You cannot edit this form anymore. The 24-hour edit period has expired or you are not the creator.');
    }
    
    const { uid, ...formData } = req.body;
    
    // Validate phone number
    if (!formData.contact_phone || !/^\+?[0-9]{10,12}$/.test(formData.contact_phone.replace(/\s/g, ''))) {
      return res.status(400).send('Invalid phone number format. Please provide a 10-digit number.');
    }
    
    // Format phone numbers with country code if not present
    if (formData.contact_phone && !formData.contact_phone.startsWith('+')) {
      formData.contact_phone = '+91' + formData.contact_phone.replace(/\s/g, '');
    }
    
    if (formData.caregiver_phone && !formData.caregiver_phone.startsWith('+')) {
      formData.caregiver_phone = '+91' + formData.caregiver_phone.replace(/\s/g, '');
    }
    
    // If referred_from is filled, set self_referred to "no"
    if (formData.referred_from && formData.referred_from.trim() !== '') {
      formData.self_referred = 'no';
    }
    
    // Update the form
    form.content = formData;
    form.lastModifiedBy = req.session.username;
    form.lastModifiedAt = new Date();
    
    await form.save();
    
    res.redirect('/forms/level1?success=1');
  } catch (error) {
    console.error('Error updating Level 1 form:', error);
    res.status(400).send('Error: ' + (error.message || 'Could not update form'));
  }
});

// Level-3: Read-only view for Level-1 forms
router.get('/view/level1', isAuthenticated, (req, res, next) => {
  req.params.level = 1;
  next();
}, checkViewAccess, async (req, res) => {
  try {
    let query = { level: 1 };
    if (req.query.uid) {
      query.uid = req.query.uid;
    }
    
    const forms = await Form.find(query).sort({ createdAt: -1 });
    res.render('forms/view-level1', { username: req.session.username, forms, uid: req.query.uid || '' });
  } catch (error) {
    console.error('Error fetching Level 1 forms:', error);
    res.redirect('/auth/login');
  }
});

router.get('/view/level2', isAuthenticated, (req, res, next) => {
  req.params.level = 2;
  next();
}, checkViewAccess, async (req, res) => {
  try {
    let query = { level: 2 };
    if (req.query.uid) {
      query['content.level1_uid'] = req.query.uid;
    }
    
    const forms = await Form.find(query);
    res.render('forms/view-level2', { username: req.session.username, forms, uid: req.query.uid || '' });
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

// Dashboard for Level 1
router.get('/dashboard/level1', isAuthenticated, async (req, res) => {
  if (req.session.userLevel !== 1) return res.redirect('/auth/login');
  
  // Only consider UIDs from Level-1 forms
  const totalPatients = await Form.distinct('uid', { level: 1 }).then(arr => arr.filter(Boolean).length);
  
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const newThisMonth = await Form.distinct('uid', { level: 1, createdAt: { $gte: monthStart } }).then(arr => arr.filter(Boolean).length);
  
  res.render('dashboard-level1', {
    username: req.session.username,
    totalPatients,
    newThisMonth,
    activeCases: totalPatients
  });
});

// Dashboard for Level 2
router.get('/dashboard/level2', isAuthenticated, async (req, res) => {
  if (req.session.userLevel !== 2) return res.redirect('/auth/login');
  
  // Always count unique UIDs from Level-1 for total patients
  const totalPatients = await Form.distinct('uid', { level: 1 }).then(arr => arr.filter(Boolean).length);
  
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const newThisMonth = await Form.distinct('uid', { level: 1, createdAt: { $gte: monthStart } }).then(arr => arr.filter(Boolean).length);
  
  res.render('dashboard-level2', {
    username: req.session.username,
    totalPatients,
    newThisMonth,
    activeCases: totalPatients
  });
});

// Dashboard for Level 3
router.get('/dashboard/level3', isAuthenticated, async (req, res) => {
  if (req.session.userLevel !== 3) return res.redirect('/auth/login');
  
  // Always count unique UIDs from Level-1 for total patients
  const totalPatients = await Form.distinct('uid', { level: 1 }).then(arr => arr.filter(Boolean).length);
  
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const newThisMonth = await Form.distinct('uid', { level: 1, createdAt: { $gte: monthStart } }).then(arr => arr.filter(Boolean).length);
  
  res.render('dashboard-level3', {
    username: req.session.username,
    totalPatients,
    newThisMonth,
    activeCases: totalPatients
  });
});

// Placeholder for Subsequent Follow Up and Report routes for all levels
router.get('/followup/level:level', isAuthenticated, (req, res) => {
  const level = parseInt(req.params.level, 10);
  if (![1, 2, 3].includes(level)) return res.status(404).send('Not found');
  
  res.render('forms/placeholder', {
    username: req.session.username,
    level,
    title: 'Subsequent Follow Up (Coming Soon)'
  });
});

router.get('/report/level:level', isAuthenticated, (req, res) => {
  const level = parseInt(req.params.level, 10);
  if (![1, 2, 3].includes(level)) return res.status(404).send('Not found');
  
  res.render('forms/placeholder', {
    username: req.session.username,
    level,
    title: 'Report (Coming Soon)'
  });
});

module.exports = router;
