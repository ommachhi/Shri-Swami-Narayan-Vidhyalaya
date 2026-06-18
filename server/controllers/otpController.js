const OtpSession = require('../models/OtpSession');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Student = require('../models/Student');
const sendEmail = require('../utils/emailSender');

const sendOtp = async (req, res) => {
  const { mobile } = req.body;
  if (!mobile || mobile.length !== 10) {
    return res.status(400).json({ message: 'Valid 10-digit mobile number is required' });
  }

  try {
    const studentMatch = await Student.findOne({ mobile });
    if (!studentMatch) {
      return res.status(404).json({ message: 'No student found with this mobile number' });
    }

    if (!studentMatch.parentEmail) {
      return res.status(400).json({ message: 'Parent email not registered for this student' });
    }

    // Generate 6 digit OTP (use 123456 in dev/test mode for easy testing)
    const isDevMode = !process.env.EMAIL_PASS || process.env.EMAIL_PASS === 'GOOGLE_APP_PASSWORD';
    const otp = isDevMode ? '123456' : Math.floor(100000 + Math.random() * 900000).toString();
    
    // Hash the OTP
    const salt = await bcrypt.genSalt(10);
    const hashedOtp = await bcrypt.hash(otp, salt);
    
    // Set expiry to 5 mins
    const expiresAt = new Date(Date.now() + 5 * 60000);
    
    // Check for existing unexpired sessions
    await OtpSession.deleteMany({ mobile }); // Delete any older sessions first
    await OtpSession.create({ mobile, otp: hashedOtp, expiresAt });

    // Send Email OTP
    const emailBody = `Dear Parent,

Your OTP for result verification is:

${otp}

This OTP is valid for 5 minutes.

Thank You,
Shri Swami Narayana Vidhyalaya`;

    // Write OTP to a file for development testing
    try {
      const fs = require('fs');
      const path = require('path');
      fs.writeFileSync(path.join(__dirname, '..', 'otp.txt'), otp);
      console.log(`OTP written to otp.txt: ${otp}`);
    } catch (fsErr) {
      console.warn('Failed to write OTP to file:', fsErr.message);
    }

    // Send Email OTP with development console fallback
    try {
      if (process.env.EMAIL_PASS && process.env.EMAIL_PASS !== 'GOOGLE_APP_PASSWORD') {
        await sendEmail({
          email: studentMatch.parentEmail,
          subject: 'SSNV Result Verification OTP',
          message: emailBody
        });
        console.log(`[Email] OTP sent successfully to ${studentMatch.parentEmail}`);
      } else {
        console.log(`\n--- DEVELOPMENT MODE OTP LOG ---`);
        console.log(`OTP for mobile ${mobile} (${studentMatch.name}) is: ${otp}`);
        console.log(`---------------------------------\n`);
      }
    } catch (emailErr) {
      console.warn('Email delivery failed, falling back to console log:', emailErr.message);
      console.log(`\n--- DEVELOPMENT MODE OTP LOG ---`);
      console.log(`OTP for mobile ${mobile} (${studentMatch.name}) is: ${otp}`);
      console.log(`---------------------------------\n`);
    }

    res.json({ message: 'OTP sent successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to send OTP' });
  }
};

const verifyOtp = async (req, res) => {
  const { mobile, otp } = req.body;
  
  try {
    const session = await OtpSession.findOne({ mobile, expiresAt: { $gt: new Date() } });
    
    if (!session) {
      return res.status(400).json({ message: 'OTP expired or not requested' });
    }

    if (session.attempts >= 3) {
      await OtpSession.deleteOne({ _id: session._id }); // Delete if too many attempts
      return res.status(400).json({ message: 'Maximum attempts reached. Try again later.' });
    }

    const isMatch = await bcrypt.compare(otp, session.otp);
    if (!isMatch) {
      session.attempts += 1;
      await session.save();
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    // Delete session after successful verification
    await OtpSession.deleteOne({ _id: session._id });

    // Create a JWT token for the parent session (valid for 30 minutes)
    const token = jwt.sign({ mobile }, process.env.JWT_SECRET, { expiresIn: '30m' });
    
    res.json({ message: 'OTP verified successfully', token, mobile });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error during verification' });
  }
};

module.exports = { sendOtp, verifyOtp };
