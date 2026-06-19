const calculateResult = (subjects, maxMarksConfig) => {
  let total = 0;
  let maxTotal = 0;
  let hasFailedSubject = false;

  const processedSubjects = subjects.map(sub => {
    const maxMarks = (maxMarksConfig && maxMarksConfig[sub.name]) || sub.maxMarks || 100;
    const marks = Number(sub.marks) || 0;
    
    total += marks;
    maxTotal += maxMarks;

    // Assuming passing marks is 35%
    const passingMarks = maxMarks * 0.35;
    if (marks < passingMarks) {
      hasFailedSubject = true;
    }

    return { ...sub, maxMarks, marks };
  });

  const percentage = maxTotal > 0 ? (total / maxTotal) * 100 : 0;
  
  let grade = 'F';
  if (!hasFailedSubject && percentage >= 35) {
    if (percentage >= 90) grade = 'A+';
    else if (percentage >= 80) grade = 'A';
    else if (percentage >= 70) grade = 'B+';
    else if (percentage >= 60) grade = 'B';
    else if (percentage >= 50) grade = 'C';
    else if (percentage >= 35) grade = 'D';
  }

  const result = (hasFailedSubject || percentage < 35) ? 'Fail' : 'Pass';
  if (result === 'Fail') grade = 'F';

  return {
    total,
    maxTotal,
    percentage: parseFloat(percentage.toFixed(2)),
    grade,
    result,
    subjects: processedSubjects
  };
};

module.exports = { calculateResult };
