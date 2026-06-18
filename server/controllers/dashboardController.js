const Student = require('../models/Student');
const UploadBatch = require('../models/UploadBatch');

const getDashboardStats = async (req, res) => {
  try {
    const totalStudents = await Student.countDocuments();
    const totalPassed = await Student.countDocuments({ result: 'Pass' });
    const totalFailed = await Student.countDocuments({ result: 'Fail' });
    const publishedResults = await Student.countDocuments({ isPublished: { $ne: false } });

    const topper = await Student.findOne().sort({ percentage: -1 });
    const latestBatch = await UploadBatch.findOne().sort({ uploadedAt: -1 });

    res.json({
      totalStudents,
      totalPassed,
      totalFailed,
      publishedResults,
      topperName: topper ? topper.name : 'N/A',
      topperPercentage: topper ? topper.percentage : 0,
      latestUploadDate: latestBatch ? latestBatch.uploadedAt : null,
      latestAcademicYear: latestBatch ? latestBatch.academicYear : 'N/A'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to fetch dashboard stats' });
  }
};

module.exports = { getDashboardStats };
