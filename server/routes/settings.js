const express = require('express');
const router = express.Router();
const { getSettings, updateSettings } = require('../controllers/settingsController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', getSettings); // Public to get school info for login page
router.put('/', protect, updateSettings);

module.exports = router;
