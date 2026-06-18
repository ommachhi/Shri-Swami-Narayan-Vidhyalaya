const express = require('express');
const router = express.Router();
const { getStudents, getStudentById, updateStudent, deleteStudent, deleteStudents } = require('../controllers/studentController');
const { uploadExcel } = require('../controllers/uploadController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.get('/', protect, getStudents);
router.post('/upload', protect, upload.single('file'), uploadExcel);
router.put('/publish', protect, require('../controllers/studentController').togglePublish);
router.delete('/bulk', protect, deleteStudents);
router.get('/:id', protect, getStudentById);
router.put('/:id', protect, updateStudent);
router.delete('/:id', protect, deleteStudent);

module.exports = router;
