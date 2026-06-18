const PDFDocument = require('pdfkit');

const generatePdf = async (student) => {
  return new Promise((resolve) => {
    const doc = new PDFDocument({ 
      margin: 50,
      size: 'A4'
    });

    // Draw decorative border
    doc.rect(20, 20, doc.page.width - 40, doc.page.height - 40).strokeColor('#1e3a8a').lineWidth(2).stroke();
    doc.rect(25, 25, doc.page.width - 50, doc.page.height - 50).strokeColor('#3b82f6').lineWidth(0.5).stroke();

    // Reset stroke color and line width
    doc.strokeColor('#000000').lineWidth(1);

    // Header Banner Background
    doc.fillColor('#1e3a8a').rect(30, 30, doc.page.width - 60, 100).fill();

    // Document header text (White text over blue banner)
    doc.fillColor('#ffffff').font('Helvetica-Bold').fontSize(24).text('SHRI SWAMI NARAYANA VIDHYALAYA', 40, 50, { align: 'center' });
    doc.fontSize(12).font('Helvetica').text('Smart Result Management System', { align: 'center' });
    doc.moveDown(0.5);
    doc.fontSize(10).text(`Academic Year: ${student.academicYear} | Exam: ${student.examName}`, { align: 'center' });
    
    doc.fillColor('#000000'); // Reset text color
    doc.moveDown(3);

    // Student Information Section
    const infoTop = doc.y;
    doc.fontSize(12).font('Helvetica-Bold').text('STUDENT INFORMATION', 40, infoTop);
    doc.moveTo(40, infoTop + 15).lineTo(doc.page.width - 40, infoTop + 15).strokeColor('#e5e7eb').stroke();
    
    doc.fontSize(10).font('Helvetica').fillColor('#374151');
    
    // Left column
    doc.text(`Roll Number:`, 40, infoTop + 25);
    doc.font('Helvetica-Bold').fillColor('#111827').text(`${student.originalRollNo || student.rollNo}`, 120, infoTop + 25);
    
    doc.font('Helvetica').fillColor('#374151');
    doc.text(`Student Name:`, 40, infoTop + 45);
    doc.font('Helvetica-Bold').fillColor('#111827').text(`${student.name}`, 120, infoTop + 45);
    
    doc.font('Helvetica').fillColor('#374151');
    doc.text(`Date of Birth:`, 40, infoTop + 65);
    doc.font('Helvetica-Bold').fillColor('#111827').text(`${student.dateOfBirth || 'N/A'}`, 120, infoTop + 65);

    // Right column
    doc.font('Helvetica').fillColor('#374151');
    doc.text(`Class:`, 320, infoTop + 25);
    doc.font('Helvetica-Bold').fillColor('#111827').text(`${student.className}`, 400, infoTop + 25);
    
    doc.font('Helvetica').fillColor('#374151');
    doc.text(`Parent Name:`, 320, infoTop + 45);
    doc.font('Helvetica-Bold').fillColor('#111827').text(`${student.parentName || 'N/A'}`, 400, infoTop + 45);
    
    doc.font('Helvetica').fillColor('#374151');
    doc.text(`Parent Email:`, 320, infoTop + 65);
    doc.font('Helvetica-Bold').fillColor('#111827').text(`${student.parentEmail || 'N/A'}`, 400, infoTop + 65);

    doc.moveDown(4.5);

    // Table Header
    const tableTop = doc.y;
    doc.fillColor('#1e3a8a').rect(40, tableTop, doc.page.width - 80, 25).fill();
    
    doc.fillColor('#ffffff').font('Helvetica-Bold').fontSize(10);
    doc.text('SUBJECT', 50, tableTop + 8);
    doc.text('MARKS OBTAINED', 250, tableTop + 8);
    doc.text('MAX MARKS', 400, tableTop + 8);
    
    doc.font('Helvetica').fillColor('#111827');
    let y = tableTop + 25;
 
    student.subjects.forEach((sub, idx) => {
      // Row background zebra striping
      if (idx % 2 === 1) {
        doc.fillColor('#f9fafb').rect(40, y, doc.page.width - 80, 20).fill();
      }
      doc.fillColor('#111827');
      doc.text(sub.name, 50, y + 6);
      doc.text(sub.marks.toString(), 250, y + 6);
      doc.text(sub.maxMarks.toString(), 400, y + 6);
      y += 20;
    });
 
    // Total Row
    doc.fillColor('#f3f4f6').rect(40, y, doc.page.width - 80, 25).fill();
    doc.fillColor('#111827').font('Helvetica-Bold');
    doc.text('TOTAL', 50, y + 8);
    doc.text(student.total.toString(), 250, y + 8);
    doc.text(student.maxTotal.toString(), 400, y + 8);
    
    y += 40;

    // Summary Section
    doc.font('Helvetica-Bold').fontSize(11).fillColor('#1e3a8a').text('PERFORMANCE SUMMARY', 40, y);
    doc.moveTo(40, y + 15).lineTo(doc.page.width - 40, y + 15).strokeColor('#e5e7eb').stroke();
    
    doc.fontSize(10).font('Helvetica').fillColor('#374151');
    doc.text('Percentage:', 40, y + 25);
    doc.font('Helvetica-Bold').fillColor(student.result === 'Pass' ? '#059669' : '#dc2626').text(`${student.percentage.toFixed(2)}%`, 120, y + 25);

    doc.font('Helvetica').fillColor('#374151');
    doc.text('Grade:', 200, y + 25);
    doc.font('Helvetica-Bold').fillColor(student.result === 'Pass' ? '#059669' : '#dc2626').text(`${student.grade}`, 250, y + 25);

    doc.font('Helvetica').fillColor('#374151');
    doc.text('Status:', 350, y + 25);
    doc.font('Helvetica-Bold').fillColor(student.result === 'Pass' ? '#059669' : '#dc2626').text(`${student.result.toUpperCase()}`, 400, y + 25);

    y += 80;

    // Signature Area
    doc.strokeColor('#9ca3af').lineWidth(0.5);
    doc.moveTo(doc.page.width - 180, y).lineTo(doc.page.width - 40, y).stroke();
    doc.font('Helvetica-Bold').fontSize(10).fillColor('#111827').text('Principal Signature', doc.page.width - 180, y + 8, { align: 'center', width: 140 });

    // Footer
    doc.font('Helvetica').fontSize(8).fillColor('#9ca3af');
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 40, doc.page.height - 50, { align: 'center' });

    resolve(doc);
  });
};

module.exports = generatePdf;
