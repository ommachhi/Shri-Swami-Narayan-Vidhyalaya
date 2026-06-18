const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Student = require('../models/Student');
const Admin = require('../models/Admin');

// Middleware to verify parent token OR admin token
const protectResultAccess = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      if (decoded.id) {
        // It's an admin, verify they exist
        const admin = await Admin.findById(decoded.id);
        if (admin) {
          req.isAdmin = true;
          return next();
        }
      } else if (decoded.mobile) {
        // It's a parent
        req.parentMobile = decoded.mobile;
        return next();
      }
      return res.status(401).json({ message: 'Not authorized' });
    } catch (error) {
      return res.status(401).json({ message: 'Not authorized, session expired' });
    }
  }
  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
};

const generatePdf = require('../utils/pdfGenerator');

router.get('/pdf/:id', protectResultAccess, async (req, res) => {
  try {
    const student = await Student.findById(req.params.id).populate('uploadBatchId');
    if (!student) {
      return res.status(404).json({ message: 'Result not found' });
    }

    // Check published status for parents
    if (!req.isAdmin && !student.isPublished) {
      return res.status(403).json({ message: 'Result is not published yet' });
    }

    // Parents can only access their own student's PDF. Admins can access all.
    if (!req.isAdmin && student.mobile !== req.parentMobile) {
      return res.status(401).json({ message: 'Unauthorized access' });
    }

    const doc = await generatePdf(student);
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=Result_${student.rollNo}.pdf`);
    
    doc.pipe(res);
    doc.end();
  } catch (error) {
    res.status(500).json({ message: 'Failed to generate PDF', error: error.message });
  }
});

// Route to get results for parent mobile
router.get('/:mobile', protectResultAccess, async (req, res) => {
  const { mobile } = req.params;
  
  // Parents can only access their own results. Admins can access all.
  if (!req.isAdmin && req.parentMobile !== mobile) {
    return res.status(401).json({ message: 'Unauthorized access' });
  }
  
  try {
    const query = { mobile };
    if (!req.isAdmin) {
      query.isPublished = { $ne: false };
    }

    const results = await Student.find(query).populate('uploadBatchId', 'examName academicYear');
    
    if (!results || results.length === 0) {
      return res.status(404).json({ message: 'No published result found for this mobile number' });
    }

    res.json(results);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
