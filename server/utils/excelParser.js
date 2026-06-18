const xlsx = require('xlsx');

const parseExcel = (filePath) => {
  const workbook = xlsx.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  
  // Convert sheet to JSON
  const data = xlsx.utils.sheet_to_json(worksheet);
  
  if (!data || data.length === 0) {
    throw new Error('Excel file is empty');
  }

  // Required standard student fields (case-insensitive checks)
  const standardFieldsMap = {
    rollNo: ['roll number', 'roll no', 'roll no.'],
    name: ['student name', 'name'],
    parentName: ['parent name', 'father name', 'mother name'],
    mobile: ['mobile number', 'mobile', 'phone'],
    parentEmail: ['parent email', 'email'],
    dateOfBirth: ['date of birth', 'date of birth (dd/mm/yyyy)', 'dob']
  };

  const columns = Object.keys(data[0]);

  // Find actual column names in the excel row
  const findColumn = (keys) => {
    return columns.find(col => keys.includes(col.toLowerCase().trim()));
  };

  const rollNoCol = findColumn(standardFieldsMap.rollNo);
  const nameCol = findColumn(standardFieldsMap.name);
  const parentNameCol = findColumn(standardFieldsMap.parentName);
  const mobileCol = findColumn(standardFieldsMap.mobile);
  const parentEmailCol = findColumn(standardFieldsMap.parentEmail);
  const dobCol = findColumn(standardFieldsMap.dateOfBirth);

  if (!rollNoCol || !nameCol || !mobileCol) {
    throw new Error('Excel is missing required student columns (Roll Number, Student Name, Mobile Number)');
  }

  // Non-subject columns to ignore
  const ignoredCols = [
    's.no', 's. no.', 'sr. no.', 'sr.no.', 'serial no', 'serial number',
    'class', 'section', 'exam name', 'academic year',
    rollNoCol.toLowerCase().trim(),
    nameCol.toLowerCase().trim(),
    parentNameCol ? parentNameCol.toLowerCase().trim() : '',
    mobileCol.toLowerCase().trim(),
    parentEmailCol ? parentEmailCol.toLowerCase().trim() : '',
    dobCol ? dobCol.toLowerCase().trim() : ''
  ];

  // Identify subjects dynamically
  const subjectColumns = columns.filter(col => !ignoredCols.includes(col.toLowerCase().trim()));

  if (subjectColumns.length === 0) {
    throw new Error('No subject columns found in the Excel sheet');
  }

  const parsedStudents = data.map(row => {
    const subjects = subjectColumns.map(subCol => ({
      name: subCol,
      marks: row[subCol] !== undefined ? Number(row[subCol]) : 0
    }));

    return {
      rollNo: String(row[rollNoCol] || '').trim(),
      name: row[nameCol],
      parentName: parentNameCol ? row[parentNameCol] : 'N/A',
      mobile: String(row[mobileCol] || '').replace(/[^0-9]/g, '').slice(-10),
      parentEmail: parentEmailCol ? row[parentEmailCol] : '',
      dateOfBirth: dobCol ? row[dobCol] : '',
      subjects
    };
  });

  return { parsedStudents, subjectColumns };
};

module.exports = { parseExcel };
