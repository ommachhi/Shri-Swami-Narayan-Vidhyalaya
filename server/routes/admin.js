const express = require('express');
const router = express.Router();
const { loginAdmin, getMe, createInitialAdmin } = require('../controllers/adminController');
const { protect } = require('../middleware/authMiddleware');

router.post('/login', loginAdmin);
router.get('/me', protect, getMe);
router.post('/init', createInitialAdmin); // Remove in production

module.exports = router;
