const Student = require('../models/Student');

const getStudents = async (req, res) => {
  try {
    const { className, section, examName, academicYear, grade, result, search, page = 1, limit = 20 } = req.query;
    
    let query = {};
    if (className) query.className = className;
    if (section) query.section = section;
    if (examName) query.examName = examName;
    if (academicYear) query.academicYear = academicYear;
    if (grade) query.grade = grade;
    if (result) query.result = result;
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { rollNo: { $regex: search, $options: 'i' } }
      ];
    }

    const students = await Student.find(query)
      .collation({ locale: 'en_US', numericOrdering: true })
      .sort({ originalRollNo: 1, rank: 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const count = await Student.countDocuments(query);

    res.json({
      students,
      totalPages: Math.ceil(count / limit),
      currentPage: Number(page),
      totalCount: count
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getStudentById = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id).populate('uploadBatchId');
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    res.json(student);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const updateStudent = async (req, res) => {
  try {
    const { subjects, ...otherData } = req.body;
    
    // We should ideally recalculate results if subjects change
    // Let's assume frontend sends recalculated total, percentage, grade, etc., or backend does it
    // For simplicity, we just update what is sent.
    // In a real app, we should import gradeCalc here.

    const student = await Student.findByIdAndUpdate(req.params.id, req.body, { new: true });
    
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    res.json(student);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const deleteStudent = async (req, res) => {
  try {
    const student = await Student.findByIdAndDelete(req.params.id);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    res.json({ message: 'Student deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const deleteStudents = async (req, res) => {
  try {
    const { studentIds } = req.body;
    if (!Array.isArray(studentIds) || studentIds.length === 0) {
      return res.status(400).json({ message: 'No student IDs provided' });
    }
    
    await Student.deleteMany({ _id: { $in: studentIds } });
    
    res.json({ message: `Successfully deleted ${studentIds.length} students` });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const togglePublish = async (req, res) => {
  try {
    const { studentIds, isPublished } = req.body;
    if (!Array.isArray(studentIds) || studentIds.length === 0) {
      return res.status(400).json({ message: 'No student IDs provided' });
    }
    
    await Student.updateMany(
      { _id: { $in: studentIds } },
      { $set: { isPublished: isPublished } }
    );
    
    res.json({ message: `Successfully ${isPublished ? 'published' : 'unpublished'} ${studentIds.length} results` });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  getStudents,
  getStudentById,
  updateStudent,
  deleteStudent,
  deleteStudents,
  togglePublish
};
