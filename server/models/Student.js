const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  rollNo: { type: String, required: true },
  originalRollNo: { type: String },
  name: { type: String, required: true },
  parentName: { type: String },
  mobile: { type: String, required: true },
  parentEmail: { type: String },
  dateOfBirth: { type: String },
  className: { type: String, required: true },
  section: { type: String },
  examName: { type: String, required: true },
  academicYear: { type: String, required: true },
  subjects: [{
    name: { type: String, required: true },
    marks: { type: Number, required: true },
    maxMarks: { type: Number, required: true }
  }],
  total: { type: Number, required: true },
  maxTotal: { type: Number, required: true },
  percentage: { type: Number, required: true },
  grade: { type: String, required: true },
  rank: { type: Number },
  result: { type: String, enum: ['Pass', 'Fail'], required: true },
  uploadedAt: { type: Date, default: Date.now },
  uploadBatchId: { type: mongoose.Schema.Types.ObjectId, ref: 'UploadBatch' },
  isPublished: { type: Boolean, default: true }
});

module.exports = mongoose.model('Student', studentSchema);
