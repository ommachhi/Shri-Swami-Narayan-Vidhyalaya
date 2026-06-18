const express = require('express');
const router = express.Router();
const { sendOtp, verifyOtp } = require('../controllers/otpController');
const rateLimit = require('express-rate-limit');

// Rate limiting: max 3 OTP requests per mobile per 15 minutes
const otpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 3,
  message: { message: 'Too many OTP requests from this IP, please try again after 15 minutes' }
});

router.post('/send', otpLimiter, sendOtp);
router.post('/verify', verifyOtp);

module.exports = router;
