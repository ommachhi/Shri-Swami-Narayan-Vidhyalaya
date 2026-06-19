const express = require('express');
const router = express.Router();
const upload = require('../middleware/uploadMiddleware');
const { uploadExcel, getBatches, deleteBatch, updateBatch, downloadBatchExcel, getBatchStudents, updateBatchInline } = require('../controllers/uploadController');
const { protect } = require('../middleware/authMiddleware');

router.post('/excel', protect, upload.single('file'), uploadExcel);
router.get('/batches', protect, getBatches);
router.delete('/batch/:id', protect, deleteBatch);
router.put('/batch/:id', protect, upload.single('file'), updateBatch);
router.get('/batch/:id/download', protect, downloadBatchExcel);
router.get('/batch/:id/students', protect, getBatchStudents);
router.put('/batch/:id/students', protect, updateBatchInline);

module.exports = router;
