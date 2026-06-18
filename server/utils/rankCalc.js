const Student = require('../models/Student');

const calculateRanksForBatch = async (batchId) => {
  const students = await Student.find({ uploadBatchId: batchId }).sort({ percentage: -1 });

  let currentRank = 1;
  let skip = 0;
  let previousPercentage = null;

  for (let i = 0; i < students.length; i++) {
    const student = students[i];

    if (student.result === 'Fail') {
      student.rank = null; // Fails don't get a rank usually
    } else {
      if (previousPercentage === null) {
        student.rank = currentRank;
      } else if (student.percentage === previousPercentage) {
        student.rank = currentRank;
        skip++;
      } else {
        currentRank += skip + 1;
        student.rank = currentRank;
        skip = 0;
      }
      previousPercentage = student.percentage;
    }
    await student.save();
  }
};

module.exports = { calculateRanksForBatch };
