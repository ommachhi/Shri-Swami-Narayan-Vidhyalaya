const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const UploadBatch = require('../models/UploadBatch');
const Student = require('../models/Student');
const { parseExcel } = require('../utils/excelParser');
const { calculateResult } = require('../utils/gradeCalc');
const { calculateRanksForBatch } = require('../utils/rankCalc');
const xlsx = require('xlsx');

const uploadExcel = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Please upload an Excel file' });
    }

    const { examName, className, academicYear, maxMarksConfig } = req.body;
    let parsedMaxMarksConfig = {};
    try {
      if (maxMarksConfig) {
         parsedMaxMarksConfig = JSON.parse(maxMarksConfig);
      }
    } catch (e) {
      // Ignored
    }

    if (!examName || !className || !academicYear) {
      return res.status(400).json({ message: 'Exam Name, Class Name, and Academic Year are required' });
    }

    const { parsedStudents, subjectColumns } = parseExcel(req.file.path);

    const batch = await UploadBatch.create({
      batchId: uuidv4(),
      fileName: req.file.originalname,
      totalStudents: parsedStudents.length,
      uploadedBy: req.admin._id,
      examName,
      className,
      academicYear,
      status: 'Processing'
    });

    const studentsToSave = [];

    for (const studentData of parsedStudents) {
      const { rollNo, name, mobile, parentName, parentEmail, dateOfBirth, subjects } = studentData;

      const resultData = calculateResult(subjects, parsedMaxMarksConfig);

      studentsToSave.push({
        rollNo: `${academicYear}-${className}-${examName}-${rollNo}`, // To ensure uniqueness across years/classes/exams
        originalRollNo: rollNo, // we might want to store original but keeping it simple
        name,
        parentName,
        parentEmail,
        dateOfBirth,
        mobile,
        className,
        examName,
        academicYear,
        ...resultData,
        uploadBatchId: batch._id
      });
    }

    // Since rollNo must be unique, we might have conflicts if same student is uploaded for different exam
    // Wait, the schema says `rollNo` is unique, but a student can have multiple exams.
    // Actually, MongoDB unique index on rollNo might conflict if the same student has multiple results.
    // Let's modify schema later if needed, or assume rollNo + examName is unique.
    
    // For now, we will do a loop and upsert or just insert
    let imported = 0;
    let failed = 0;
    let duplicates = 0;

    for (const st of studentsToSave) {
        try {
            const existing = await Student.findOne({ rollNo: st.rollNo });
            if (existing) {
                duplicates++;
                continue; // Skip duplicate
            }
            await Student.create(st);
            imported++;
        } catch (err) {
            console.log('Error saving student:', err.message);
            failed++;
        }
    }

    await calculateRanksForBatch(batch._id);

    batch.status = 'Completed';
    await batch.save();

    // Clean up file
    fs.unlinkSync(req.file.path);

    res.status(200).json({ 
        message: 'Upload and processing successful', 
        batch,
        report: {
            totalRows: parsedStudents.length,
            imported,
            failed,
            duplicates
        }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error during upload', error: error.message });
  }
};

const getBatches = async (req, res) => {
    try {
        const batches = await UploadBatch.find().sort({ uploadedAt: -1 }).populate('uploadedBy', 'username');
        res.json(batches);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

const deleteBatch = async (req, res) => {
    try {
        const batchId = req.params.id;
        await Student.deleteMany({ uploadBatchId: batchId });
        await UploadBatch.findByIdAndDelete(batchId);
        res.json({ message: 'Batch and associated students deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

const updateBatch = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'Please upload a new Excel file to replace' });
        }

        const batchId = req.params.id;
        const batch = await UploadBatch.findById(batchId);
        
        if (!batch) {
            return res.status(404).json({ message: 'Batch not found' });
        }

        const { parsedStudents } = parseExcel(req.file.path);
        
        // Delete existing students for this batch
        await Student.deleteMany({ uploadBatchId: batchId });

        const studentsToSave = [];
        for (const studentData of parsedStudents) {
            const { rollNo, name, mobile, parentName, parentEmail, dateOfBirth, subjects } = studentData;
            const resultData = calculateResult(subjects, {}); // Assuming default max marks if none provided in update
            
            studentsToSave.push({
                rollNo: `${batch.academicYear}-${batch.className}-${batch.examName}-${rollNo}`,
                originalRollNo: rollNo,
                name,
                parentName,
                parentEmail,
                dateOfBirth,
                mobile,
                className: batch.className,
                examName: batch.examName,
                academicYear: batch.academicYear,
                ...resultData,
                uploadBatchId: batch._id
            });
        }

        let imported = 0;
        let failed = 0;
        let duplicates = 0;

        for (const st of studentsToSave) {
            try {
                // Should not have duplicates now as we deleted the old ones, but just in case
                const existing = await Student.findOne({ rollNo: st.rollNo });
                if (existing) {
                    duplicates++;
                    continue;
                }
                await Student.create(st);
                imported++;
            } catch (err) {
                console.log('Error saving student during update:', err.message);
                failed++;
            }
        }

        await calculateRanksForBatch(batch._id);

        batch.fileName = req.file.originalname;
        batch.totalStudents = parsedStudents.length;
        batch.status = 'Completed';
        await batch.save();

        fs.unlinkSync(req.file.path);

        res.status(200).json({ 
            message: 'Batch updated successfully', 
            batch,
            report: {
                totalRows: parsedStudents.length,
                imported,
                failed,
                duplicates
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error during batch update', error: error.message });
    }
};

const downloadBatchExcel = async (req, res) => {
    try {
        const batchId = req.params.id;
        const batch = await UploadBatch.findById(batchId);
        if (!batch) return res.status(404).json({ message: 'Batch not found' });

        const students = await Student.find({ uploadBatchId: batchId }).sort({ originalRollNo: 1 });
        
        const data = students.map(st => {
            const row = {
                'Roll Number': st.originalRollNo || st.rollNo,
                'Student Name': st.name,
                'Parent Name': st.parentName || '',
                'Mobile Number': st.mobile,
                'Parent Email': st.parentEmail || '',
                'Date Of Birth': st.dateOfBirth || ''
            };
            st.subjects.forEach(sub => {
                row[sub.name] = sub.marks;
            });
            return row;
        });

        const ws = xlsx.utils.json_to_sheet(data);
        const wb = xlsx.utils.book_new();
        xlsx.utils.book_append_sheet(wb, ws, 'Results');

        const buffer = xlsx.write(wb, { type: 'buffer', bookType: 'xlsx' });
        
        res.setHeader('Content-Disposition', `attachment; filename="Edit_${batch.fileName}"`);
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.send(buffer);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const getBatchStudents = async (req, res) => {
    try {
        const batchId = req.params.id;
        const students = await Student.find({ uploadBatchId: batchId })
            .collation({ locale: 'en_US', numericOrdering: true })
            .sort({ originalRollNo: 1 });
        res.json(students);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

const updateBatchInline = async (req, res) => {
    try {
        const batchId = req.params.id;
        const { students } = req.body;
        
        const batch = await UploadBatch.findById(batchId);
        if (!batch) return res.status(404).json({ message: 'Batch not found' });

        // Find existing students in DB
        const existingStudents = await Student.find({ uploadBatchId: batchId });
        
        // Find which ones to delete
        const incomingIds = students.filter(s => s._id).map(s => s._id.toString());
        const studentsToDelete = existingStudents.filter(s => !incomingIds.includes(s._id.toString()));
        
        for (const st of studentsToDelete) {
            await Student.findByIdAndDelete(st._id);
        }
        
        for (const st of students) {
            const resultData = calculateResult(st.subjects, {});
            
            const rollNo = `${st.academicYear || batch.academicYear}-${st.className || batch.className}-${st.examName || batch.examName}-${st.originalRollNo}`;
            
            const studentData = {
                name: st.name,
                originalRollNo: st.originalRollNo,
                rollNo: rollNo,
                parentName: st.parentName || '',
                mobile: st.mobile || '',
                parentEmail: st.parentEmail || '',
                dateOfBirth: st.dateOfBirth || '',
                className: st.className || batch.className,
                examName: st.examName || batch.examName,
                academicYear: st.academicYear || batch.academicYear,
                uploadBatchId: batchId,
                ...resultData
            };

            if (st._id) {
                await Student.findByIdAndUpdate(st._id, studentData);
            } else {
                // For new student rows
                const existing = await Student.findOne({ rollNo });
                if (!existing) {
                    await Student.create(studentData);
                }
            }
        }
        
        const newCount = await Student.countDocuments({ uploadBatchId: batchId });
        batch.totalStudents = newCount;
        await batch.save();

        await calculateRanksForBatch(batchId);
        
        res.json({ message: 'Batch updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { uploadExcel, getBatches, deleteBatch, updateBatch, downloadBatchExcel, getBatchStudents, updateBatchInline };
