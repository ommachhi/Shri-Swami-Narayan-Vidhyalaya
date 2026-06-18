import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { toast } from 'react-toastify';
import { FiSearch, FiEdit2, FiTrash2, FiEye, FiCheckSquare, FiSquare, FiShare2, FiCopy, FiDownload, FiPrinter } from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';

const Students = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterClass, setFilterClass] = useState('');
  const [selectedIds, setSelectedIds] = useState([]);
  
  const [viewStudent, setViewStudent] = useState(null);
  const [isViewing, setIsViewing] = useState(false);

  const handleViewResult = async (id) => {
    try {
      const res = await api.get(`/students/${id}`);
      setViewStudent(res.data);
      setIsViewing(true);
    } catch (error) {
      toast.error('Failed to load student result details');
    }
  };

  const handleDownloadPDF = async (id, rollNo) => {
    try {
      toast.info('Generating PDF...');
      const response = await api.get(`/result/pdf/${id}`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Result_${rollNo}.pdf`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('Downloaded Successfully');
    } catch (error) {
      toast.error('Failed to download PDF');
    }
  };

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const res = await api.get('/students');
      if (res.data && Array.isArray(res.data.students)) {
        setStudents(res.data.students);
      } else {
        setStudents([]);
        toast.error('Invalid data format received from server');
      }
    } catch (error) {
      toast.error('Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this student?')) return;
    try {
      await api.delete(`/students/${id}`);
      toast.success('Student deleted successfully');
      fetchStudents();
    } catch (error) {
      toast.error('Failed to delete student');
    }
  };

  const handleTogglePublish = async (studentIds, isPublished) => {
    if (studentIds.length === 0) return;
    try {
      const res = await api.put('/students/publish', { studentIds, isPublished });
      toast.success(res.data.message || 'Status updated successfully');
      fetchStudents();
      setSelectedIds([]);
    } catch (error) {
      toast.error('Failed to update publish status');
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (!window.confirm(`Are you sure you want to delete ${selectedIds.length} selected students?`)) return;
    try {
      const res = await api.delete('/students/bulk', { data: { studentIds: selectedIds } });
      toast.success(res.data.message || 'Students deleted successfully');
      fetchStudents();
      setSelectedIds([]);
    } catch (error) {
      toast.error('Failed to delete selected students');
    }
  };

  const generateWhatsAppLink = () => {
    const resultLink = window.location.origin;
    const message = `Dear Parent,\n\nYour child's result has been published.\n\nClick the link below to view and download the result:\n${resultLink}\n\nRegards,\nShri Swami Narayana Vidhyalaya`;
    return `https://wa.me/?text=${encodeURIComponent(message)}`;
  };

  const handleShareWhatsApp = () => {
    window.open(generateWhatsAppLink(), '_blank');
  };

  const handleBulkWhatsApp = () => {
    // Sharing the exact same portal link, so we just open it once
    if (selectedIds.length === 0) return toast.info('No students selected');
    handleShareWhatsApp();
  };

  const handleCopyLink = () => {
    const resultLink = window.location.origin;
    navigator.clipboard.writeText(resultLink);
    toast.success('Result portal link copied to clipboard');
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(filteredStudents.map(s => s._id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelect = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(selectedId => selectedId !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const filteredStudents = students.filter(student => {
    const nameMatch = student.name ? String(student.name).toLowerCase().includes(searchTerm.toLowerCase()) : false;
    const rollMatch = student.rollNo ? String(student.rollNo).toLowerCase().includes(searchTerm.toLowerCase()) : false;
    const originalRollMatch = student.originalRollNo ? String(student.originalRollNo).toLowerCase().includes(searchTerm.toLowerCase()) : false;
    const mobileMatch = student.mobile ? String(student.mobile).toLowerCase().includes(searchTerm.toLowerCase()) : false;
    const emailMatch = student.parentEmail ? String(student.parentEmail).toLowerCase().includes(searchTerm.toLowerCase()) : false;
    
    const matchesSearch = nameMatch || rollMatch || originalRollMatch || mobileMatch || emailMatch;
    const matchesClass = filterClass ? student.className === filterClass : true;
    return matchesSearch && matchesClass;
  });

  const uniqueClasses = [...new Set(students.map(s => s.className))];

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 h-full flex flex-col">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Student Management</h2>
          <p className="text-gray-500 mt-1">Manage and view student records</p>
        </div>
        {selectedIds.length > 0 && (
          <div className="flex gap-2">
            <button 
              onClick={() => handleTogglePublish(selectedIds, true)}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Publish Selected
            </button>
            <button 
              onClick={() => handleTogglePublish(selectedIds, false)}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Unpublish Selected
            </button>
            <button 
              onClick={handleBulkWhatsApp}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors"
            >
              <FaWhatsapp /> Share Selected
            </button>
            <button 
              onClick={handleBulkDelete}
              className="bg-red-800 hover:bg-red-900 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors"
            >
              <FiTrash2 /> Remove Selected
            </button>
          </div>
        )}
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
          <input
            type="text"
            placeholder="Search by name, roll number, mobile, email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
          />
        </div>
        <select
          value={filterClass}
          onChange={(e) => setFilterClass(e.target.value)}
          className="px-4 py-3 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all min-w-[200px]"
        >
          <option value="">All Classes</option>
          {uniqueClasses.map(cls => (
            <option key={cls} value={cls}>{cls}</option>
          ))}
        </select>
      </div>

      <div className="flex-1 overflow-auto rounded-xl border border-gray-100">
        {loading ? (
          <div className="h-full flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 sticky top-0">
              <tr>
                <th className="px-6 py-4 border-b">
                  <input 
                    type="checkbox" 
                    onChange={handleSelectAll}
                    checked={filteredStudents.length > 0 && selectedIds.length === filteredStudents.length}
                    className="w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary"
                  />
                </th>
                <th className="px-6 py-4 font-semibold text-gray-600 text-sm border-b">Roll No</th>
                <th className="px-6 py-4 font-semibold text-gray-600 text-sm border-b">Name</th>
                <th className="px-6 py-4 font-semibold text-gray-600 text-sm border-b">Class / Exam</th>
                <th className="px-6 py-4 font-semibold text-gray-600 text-sm border-b">Status</th>
                <th className="px-6 py-4 font-semibold text-gray-600 text-sm border-b text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredStudents.length > 0 ? (
                filteredStudents.map((student) => (
                  <tr key={student._id} className={`hover:bg-gray-50/50 transition-colors ${selectedIds.includes(student._id) ? 'bg-blue-50/50' : ''}`}>
                    <td className="px-6 py-4">
                      <input 
                        type="checkbox" 
                        checked={selectedIds.includes(student._id)}
                        onChange={() => handleSelect(student._id)}
                        className="w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary"
                      />
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-800">{student.originalRollNo || student.rollNo}</td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-800">{student.name}</div>
                      <div className="text-xs text-gray-500">{student.mobile}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-800">{student.className}</div>
                      <div className="text-xs text-gray-500">{student.examName}</div>
                    </td>
                    <td className="px-6 py-4 text-sm flex gap-2 flex-col items-start">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        student.result === 'Pass' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {student.result}
                      </span>
                      <span className={`px-2 py-1 rounded text-xs font-medium cursor-pointer ${
                        student.isPublished ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
                      }`} onClick={() => handleTogglePublish([student._id], !student.isPublished)} title="Click to toggle publish status">
                        {student.isPublished ? 'Published' : 'Unpublished'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button onClick={() => handleViewResult(student._id)} className="text-gray-400 hover:text-blue-500 transition-colors p-1" title="View Result">
                        <FiEye />
                      </button>
                      <button onClick={() => handleCopyLink()} className="text-gray-400 hover:text-primary transition-colors p-1" title="Copy Result Portal Link">
                        <FiCopy />
                      </button>
                      <button onClick={() => handleShareWhatsApp()} className="text-gray-400 hover:text-green-500 transition-colors p-1" title="Share Portal on WhatsApp">
                        <FaWhatsapp className="text-lg" />
                      </button>
                      <button onClick={() => handleDelete(student._id)} className="text-gray-400 hover:text-red-500 transition-colors p-1" title="Delete Student">
                        <FiTrash2 />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                    No students found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Result View Modal */}
      {isViewing && viewStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto relative print:w-full print:h-full print:absolute print:inset-0 print:m-0 print:bg-white print:overflow-visible">
            {/* Header Section */}
            <div className="sticky top-0 bg-primary p-6 text-center text-white rounded-t-2xl z-10 print:static print:rounded-none">
              <button 
                onClick={() => setIsViewing(false)}
                className="absolute top-4 left-4 bg-white/20 hover:bg-white/30 px-3 py-1 rounded text-sm backdrop-blur-sm transition-all print:hidden"
              >
                Close
              </button>
              <div className="absolute top-4 right-4 print:hidden flex gap-2">
                <button 
                  onClick={() => handleDownloadPDF(viewStudent._id, viewStudent.rollNo)}
                  className="bg-white/20 hover:bg-white/30 p-2 rounded-full backdrop-blur-sm transition-all"
                  title="Download PDF"
                >
                  <FiDownload className="text-xl" />
                </button>
                <button 
                  onClick={() => {
                    const printContents = document.getElementById('printable-result').innerHTML;
                    const originalContents = document.body.innerHTML;
                    document.body.innerHTML = printContents;
                    window.print();
                    document.body.innerHTML = originalContents;
                    window.location.reload();
                  }}
                  className="bg-white/20 hover:bg-white/30 p-2 rounded-full backdrop-blur-sm transition-all"
                  title="Print Result"
                >
                  <FiPrinter className="text-xl" />
                </button>
              </div>

              <div className="flex justify-center mb-2 mt-6">
                <div className="h-16 w-16 bg-white rounded-full flex items-center justify-center text-primary text-xl font-bold shadow-lg">
                  SSNV
                </div>
              </div>
              <h1 className="text-2xl font-extrabold tracking-wide uppercase">Shri Swami Narayana Vidhyalaya</h1>
              <p className="text-primary-light mt-1 text-base">Academic Year: {viewStudent.academicYear}</p>
            </div>

            <div id="printable-result" className="p-8">
              {/* For print layout, copy the header inside */}
              <div className="hidden print:block text-center text-primary mb-6 border-b-4 border-primary pb-4">
                <h1 className="text-3xl font-extrabold uppercase">Shri Swami Narayana Vidhyalaya</h1>
                <p className="text-lg font-semibold">Academic Year: {viewStudent.academicYear}</p>
              </div>

              <h2 className="text-xl font-bold text-gray-800 border-b pb-2 mb-6 uppercase text-center">{viewStudent.examName}</h2>
              
              <div className="grid grid-cols-2 gap-y-4 gap-x-8 mb-8 bg-gray-50 p-6 rounded-xl border border-gray-100 print:bg-white print:border-gray-300">
                <div className="flex justify-between border-b border-gray-200 pb-2">
                  <span className="text-gray-500 font-medium">Student Name</span>
                  <span className="font-semibold text-gray-800">{viewStudent.name}</span>
                </div>
                <div className="flex justify-between border-b border-gray-200 pb-2">
                  <span className="text-gray-500 font-medium">Roll Number</span>
                  <span className="font-semibold text-gray-800">{viewStudent.originalRollNo || viewStudent.rollNo}</span>
                </div>
                <div className="flex justify-between border-b border-gray-200 pb-2">
                  <span className="text-gray-500 font-medium">Class</span>
                  <span className="font-semibold text-gray-800">{viewStudent.className}</span>
                </div>
                <div className="flex justify-between border-b border-gray-200 pb-2">
                  <span className="text-gray-500 font-medium">Mobile Number</span>
                  <span className="font-semibold text-gray-800">+91 {viewStudent.mobile}</span>
                </div>
              </div>

              <div className="overflow-x-auto rounded-xl border border-gray-200 print:border-gray-400">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-primary/5 print:bg-gray-100">
                      <th className="px-6 py-4 font-bold text-gray-700 uppercase tracking-wider text-sm border-b border-gray-200 print:border-gray-400">Subject</th>
                      <th className="px-6 py-4 font-bold text-gray-700 uppercase tracking-wider text-sm border-b border-gray-200 text-center print:border-gray-400">Marks Obtained</th>
                      <th className="px-6 py-4 font-bold text-gray-700 uppercase tracking-wider text-sm border-b border-gray-200 text-center print:border-gray-400">Max Marks</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 print:divide-gray-300">
                    {viewStudent.subjects.map((sub, idx) => (
                      <tr key={idx} className="hover:bg-gray-50 transition-colors print:bg-white">
                        <td className="px-6 py-4 text-gray-800 font-medium">{sub.name}</td>
                        <td className="px-6 py-4 text-center font-semibold text-primary print:text-black">{sub.marks}</td>
                        <td className="px-6 py-4 text-center text-gray-500 print:text-gray-700">{sub.maxMarks}</td>
                      </tr>
                    ))}
                    <tr className="bg-gray-50 font-bold border-t-2 border-gray-200 print:border-gray-400">
                      <td className="px-6 py-4 text-gray-800 uppercase">Total</td>
                      <td className="px-6 py-4 text-center text-primary text-lg print:text-black">{viewStudent.total}</td>
                      <td className="px-6 py-4 text-center text-gray-800 text-lg">{viewStudent.maxTotal}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="mt-8 flex gap-4 justify-between items-center bg-blue-50/50 p-6 rounded-xl border border-blue-100 print:bg-white print:border-gray-400">
                <div className="text-center">
                  <p className="text-sm text-gray-500 uppercase tracking-wider font-semibold">Percentage</p>
                  <p className="text-3xl font-extrabold text-blue-800 print:text-black">{viewStudent.percentage.toFixed(2)}%</p>
                </div>
                <div className="h-12 w-px bg-blue-200 print:bg-gray-300"></div>
                <div className="text-center">
                  <p className="text-sm text-gray-500 uppercase tracking-wider font-semibold">Grade</p>
                  <p className="text-3xl font-extrabold text-primary print:text-black">{viewStudent.grade}</p>
                </div>
                <div className="h-12 w-px bg-blue-200 print:bg-gray-300"></div>
                <div className="text-center">
                  <p className="text-sm text-gray-500 uppercase tracking-wider font-semibold">Status</p>
                  <p className={`text-3xl font-extrabold print:text-black ${viewStudent.result === 'Pass' ? 'text-green-600' : 'text-red-600'}`}>
                    {viewStudent.result}
                  </p>
                </div>
              </div>

              <div className="mt-16 pt-8 border-t border-gray-200 flex justify-between items-end px-4 text-gray-600 font-medium">
                <div className="text-center">
                  <div className="w-40 border-b border-gray-400 mb-2"></div>
                  <p>Class Teacher</p>
                </div>
                <div className="text-center">
                  <div className="w-40 border-b border-gray-400 mb-2"></div>
                  <p>Principal</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Students;
