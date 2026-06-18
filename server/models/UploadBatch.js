const mongoose = require('mongoose');

const uploadBatchSchema = new mongoose.Schema({
  batchId: { type: String, required: true, unique: true },
  fileName: { type: String, required: true },
  totalStudents: { type: Number, required: true },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
  uploadedAt: { type: Date, default: Date.now },
  examName: { type: String, required: true },
  className: { type: String, required: true },
  academicYear: { type: String, required: true },
  status: { type: String, enum: ['Processing', 'Completed', 'Failed'], default: 'Processing' }
});

module.exports = mongoose.model('UploadBatch', uploadBatchSchema);
