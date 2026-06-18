const xlsx = require('xlsx');
const path = require('path');

const data = [
  {
    'Roll Number': '101',
    'Student Name': 'Om Patel',
    'Parent Name': 'Rajesh Patel',
    'Mobile Number': '9157206758',
    'Parent Email': 'parent.om@example.com',
    'Date Of Birth': '15/08/2009',
    'Physics': 75,
    'Chemistry': 82,
    'Mathematics': 90,
    'English': 88,
    'Computer': 95
  },
  {
    'Roll Number': '102',
    'Student Name': 'Khushi Shah',
    'Parent Name': 'Anil Shah',
    'Mobile Number': '6351000248',
    'Parent Email': 'parent.khushi@example.com',
    'Date Of Birth': '22/11/2009',
    'Physics': 85,
    'Chemistry': 79,
    'Mathematics': 88,
    'English': 91,
    'Computer': 89
  },
  {
    'Roll Number': '103',
    'Student Name': 'Rohan Sharma',
    'Parent Name': 'Vijay Sharma',
    'Mobile Number': '9876543210',
    'Parent Email': 'parent.rohan@example.com',
    'Date Of Birth': '05/04/2009',
    'Physics': 30, // Failed subject
    'Chemistry': 55,
    'Mathematics': 42,
    'English': 60,
    'Computer': 65
  }
];

const ws = xlsx.utils.json_to_sheet(data);
const wb = xlsx.utils.book_new();
xlsx.utils.book_append_sheet(wb, ws, 'Results');

const outputPath = path.join(__dirname, 'sample_results.xlsx');
xlsx.writeFile(wb, outputPath);

console.log(`Sample Excel file created at: ${outputPath}`);
