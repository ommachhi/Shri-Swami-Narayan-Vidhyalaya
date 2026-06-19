import React, { useState } from 'react';
import api from '../../services/api';
import { toast } from 'react-toastify';
import { FiUploadCloud, FiFileText, FiTrash2 } from 'react-icons/fi';

const Upload = () => {
  const [file, setFile] = useState(null);
  const [formData, setFormData] = useState({
    examName: '',
    className: '',
    academicYear: '2025-2026',
  });
  const [loading, setLoading] = useState(false);
  const [uploadReport, setUploadReport] = useState(null);
  const [batches, setBatches] = useState([]);
  const [fetchingBatches, setFetchingBatches] = useState(false);
  
  // States for inline editing
  const [editingBatchId, setEditingBatchId] = useState(null);
  const [editingStudents, setEditingStudents] = useState([]);
  const [batchSubjectsTemplate, setBatchSubjectsTemplate] = useState([]);
  const [loadingEdit, setLoadingEdit] = useState(false);
  const [savingEdit, setSavingEdit] = useState(false);

  // Ref for hidden input for updating
  const fileInputRef = React.useRef(null);
  const [updatingBatchId, setUpdatingBatchId] = useState(null);

  const fetchBatches = async () => {
    setFetchingBatches(true);
    try {
      const res = await api.get('/upload/batches');
      setBatches(res.data);
    } catch (error) {
      toast.error('Failed to load batches');
    } finally {
      setFetchingBatches(false);
    }
  };

  React.useEffect(() => {
    fetchBatches();
  }, []);

  const handleDeleteBatch = async (id) => {
    if (!window.confirm('Are you sure you want to delete this file and all its students?')) return;
    try {
      await api.delete(`/upload/batch/${id}`);
      toast.success('File deleted successfully');
      fetchBatches();
    } catch (error) {
      toast.error('Failed to delete file');
    }
  };

  const handleEditInlineClick = async (id) => {
    setEditingBatchId(id);
    setLoadingEdit(true);
    try {
      const res = await api.get(`/upload/batch/${id}/students`);
      setEditingStudents(res.data);
      if (res.data.length > 0) {
        setBatchSubjectsTemplate(res.data[0].subjects.map(s => ({ name: s.name, maxMarks: s.maxMarks, marks: 0 })));
      }
    } catch (error) {
      toast.error('Failed to load students for editing');
      setEditingBatchId(null);
    } finally {
      setLoadingEdit(false);
    }
  };

  const handleStudentFieldChange = (index, field, value) => {
    const updated = [...editingStudents];
    updated[index] = { ...updated[index], [field]: value };
    setEditingStudents(updated);
  };

  const handleStudentSubjectChange = (studentIndex, subjectIndex, value) => {
    const updated = [...editingStudents];
    const newSubjects = [...updated[studentIndex].subjects];
    newSubjects[subjectIndex] = { ...newSubjects[subjectIndex], marks: value };
    updated[studentIndex] = { ...updated[studentIndex], subjects: newSubjects };
    setEditingStudents(updated);
  };

  const handleRemoveStudent = (index) => {
    if (window.confirm("Are you sure you want to remove this student row?")) {
      const updated = [...editingStudents];
      updated.splice(index, 1);
      setEditingStudents(updated);
    }
  };

  const handleAddStudent = () => {
    const batch = batches.find(b => b._id === editingBatchId);
    const newStudent = {
      _id: null,
      originalRollNo: '',
      name: '',
      subjects: batchSubjectsTemplate,
      academicYear: batch?.academicYear || formData.academicYear,
      className: batch?.className || formData.className,
      examName: batch?.examName || formData.examName
    };
    setEditingStudents([...editingStudents, newStudent]);
  };

  const handleSaveInlineEdits = async () => {
    setSavingEdit(true);
    try {
      await api.put(`/upload/batch/${editingBatchId}/students`, { students: editingStudents });
      toast.success('Batch updated successfully');
      setEditingBatchId(null);
      fetchBatches();
    } catch (error) {
      toast.error('Failed to save changes');
    } finally {
      setSavingEdit(false);
    }
  };

  const handleUpdateClick = (id) => {
    setUpdatingBatchId(id);
    fileInputRef.current.click();
  };

  const handleUpdateFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file || !updatingBatchId) return;

    const data = new FormData();
    data.append('file', file);

    const loadingToast = toast.loading('Updating file...');
    try {
      const res = await api.put(`/upload/batch/${updatingBatchId}`, data);
      toast.update(loadingToast, { render: res.data.message, type: 'success', isLoading: false, autoClose: 3000 });
      setUploadReport(res.data.report);
      fetchBatches();
    } catch (error) {
      toast.update(loadingToast, { render: error.response?.data?.message || 'Failed to update file', type: 'error', isLoading: false, autoClose: 3000 });
    } finally {
      // Reset input
      e.target.value = '';
      setUpdatingBatchId(null);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return toast.error('Please select an Excel file');
    
    const data = new FormData();
    data.append('file', file);
    data.append('examName', formData.examName);
    data.append('className', formData.className);
    data.append('academicYear', formData.academicYear);

    setLoading(true);
    setUploadReport(null);
    try {
      const res = await api.post('/students/upload', data);
      toast.success(res.data.message);
      setUploadReport(res.data.report);
      setFile(null);
      setFormData({ ...formData, examName: '', className: '' });
      // Reset file input
      document.getElementById('file-upload').value = '';
      fetchBatches();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Upload failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <div className="mb-8 border-b border-gray-100 pb-6">
          <h2 className="text-2xl font-bold text-gray-800">Upload Exam Results</h2>
          <p className="text-gray-500 mt-2">Import student marks using a standard Excel (.xlsx) file.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Exam Name</label>
              <input
                type="text"
                name="examName"
                value={formData.examName}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                placeholder="e.g. Mid Term Exam 2025"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Class Name</label>
              <input
                type="text"
                name="className"
                value={formData.className}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                placeholder="e.g. Standard 10"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Academic Year</label>
              <select
                name="academicYear"
                value={formData.academicYear}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
              >
                <option value="2024-2025">2024-2025</option>
                <option value="2025-2026">2025-2026</option>
                <option value="2026-2027">2026-2027</option>
              </select>
            </div>
          </div>

          <div className="mt-8">
            <label className="block text-sm font-medium text-gray-700 mb-2">Excel File</label>
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-10 flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer" onClick={() => document.getElementById('file-upload').click()}>
              {file ? (
                <div className="flex flex-col items-center text-primary">
                  <FiFileText className="text-5xl mb-3" />
                  <span className="font-medium">{file.name}</span>
                  <span className="text-sm text-gray-500 mt-1">{(file.size / 1024).toFixed(2)} KB</span>
                </div>
              ) : (
                <div className="flex flex-col items-center text-gray-500">
                  <FiUploadCloud className="text-5xl mb-3 text-gray-400" />
                  <span className="font-medium">Click to browse or drag and drop</span>
                  <span className="text-sm mt-1">Supported formats: .xlsx, .xls</span>
                </div>
              )}
              <input
                id="file-upload"
                type="file"
                accept=".xlsx, .xls"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>
          </div>

          <div className="flex justify-end pt-6">
            <button
              type="submit"
              disabled={loading}
              className="bg-primary hover:bg-primary-light text-white px-8 py-3 rounded-lg font-medium shadow-lg shadow-primary/30 transition-all flex items-center space-x-2 disabled:opacity-70"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <FiUploadCloud />
                  <span>Upload & Process</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {uploadReport && (
        <div className="mt-8 bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <h3 className="text-xl font-bold text-gray-800 mb-6">Upload Summary</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
              <p className="text-gray-500 text-sm">Total Rows</p>
              <p className="text-2xl font-bold text-gray-800">{uploadReport.totalRows}</p>
            </div>
            <div className="bg-green-50 p-4 rounded-xl border border-green-100">
              <p className="text-green-600 text-sm">Imported</p>
              <p className="text-2xl font-bold text-green-700">{uploadReport.imported}</p>
            </div>
            <div className="bg-red-50 p-4 rounded-xl border border-red-100">
              <p className="text-red-600 text-sm">Failed</p>
              <p className="text-2xl font-bold text-red-700">{uploadReport.failed}</p>
            </div>
            <div className="bg-orange-50 p-4 rounded-xl border border-orange-100">
              <p className="text-orange-600 text-sm">Duplicates Skipped</p>
              <p className="text-2xl font-bold text-orange-700">{uploadReport.duplicates}</p>
            </div>
          </div>
        </div>
      )}

      <div className="mt-8 bg-blue-50 border border-blue-100 rounded-2xl p-6 text-blue-800">
        <h3 className="font-semibold mb-2 flex items-center"><FiFileText className="mr-2" /> Required Excel Columns:</h3>
        <p className="text-sm text-blue-700 leading-relaxed">
          Roll Number, Student Name, Parent Name, Mobile Number, Parent Email, Date Of Birth, 
          followed by Subject Names (e.g., Gujarati, English, Mathematics, Science, Social Science).
        </p>
      </div>

      <div className="mt-8 bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <h3 className="text-xl font-bold text-gray-800 mb-6">Uploaded Files (Batches)</h3>
        {fetchingBatches ? (
          <div className="text-center text-gray-500 py-4">Loading...</div>
        ) : batches.length === 0 ? (
          <div className="text-center text-gray-500 py-4 border-2 border-dashed border-gray-200 rounded-xl">
            No files uploaded yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200 text-sm text-gray-500">
                  <th className="pb-3 px-4 font-medium">File Name</th>
                  <th className="pb-3 px-4 font-medium">Exam Name</th>
                  <th className="pb-3 px-4 font-medium">Class / Year</th>
                  <th className="pb-3 px-4 font-medium">Students</th>
                  <th className="pb-3 px-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {batches.map((batch) => (
                  <tr key={batch._id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4 text-primary font-medium">{batch.fileName}</td>
                    <td className="py-3 px-4 text-gray-700">{batch.examName}</td>
                    <td className="py-3 px-4 text-gray-600">
                      <div>{batch.className}</div>
                      <div className="text-xs text-gray-400">{batch.academicYear}</div>
                    </td>
                    <td className="py-3 px-4 text-gray-700">{batch.totalStudents}</td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <button
                        onClick={() => handleEditInlineClick(batch._id)}
                        className="text-green-500 hover:text-white hover:bg-green-500 px-3 py-1 rounded transition-colors border border-green-200 mr-2"
                        title="Edit Data Inline"
                      >
                        Edit Data
                      </button>
                      <button
                        onClick={() => handleUpdateClick(batch._id)}
                        className="text-blue-500 hover:text-white hover:bg-blue-500 px-3 py-1 rounded transition-colors border border-blue-200 mr-2"
                        title="Upload Updated File"
                      >
                        Update
                      </button>
                      <button
                        onClick={() => handleDeleteBatch(batch._id)}
                        className="text-red-500 hover:text-white hover:bg-red-500 px-3 py-1 rounded transition-colors border border-red-200"
                        title="Delete File & Students"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      {/* Inline Edit Modal */}
      {editingBatchId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-6xl max-h-[95vh] flex flex-col overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <div>
                <h3 className="text-xl font-bold text-gray-800">Edit Batch Data</h3>
                <p className="text-sm text-gray-500">Modify student marks and details directly</p>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => setEditingBatchId(null)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveInlineEdits}
                  disabled={savingEdit || loadingEdit}
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-light transition-colors flex items-center"
                >
                  {savingEdit ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
            <div className="p-0 overflow-auto flex-1">
              {loadingEdit ? (
                <div className="flex justify-center items-center h-40">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : (
                <table className="w-full text-left border-collapse min-w-max">
                  <thead className="bg-gray-50 sticky top-0 shadow-sm z-10">
                    <tr className="text-sm text-gray-600">
                      <th className="p-3 border-b font-medium">Roll No</th>
                      <th className="p-3 border-b font-medium">Name</th>
                      <th className="p-3 border-b font-medium text-center">Mobile No</th>
                      <th className="p-3 border-b font-medium text-center">Email ID</th>
                      {editingStudents[0]?.subjects.map((sub, idx) => (
                        <th key={idx} className="p-3 border-b font-medium text-center">{sub.name}</th>
                      ))}
                      <th className="p-3 border-b font-medium text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {editingStudents.map((st, sIdx) => (
                      <tr key={sIdx} className="border-b border-gray-100 hover:bg-gray-50/50">
                        <td className="p-2">
                          <input
                            type="text"
                            value={st.originalRollNo || ''}
                            onChange={(e) => handleStudentFieldChange(sIdx, 'originalRollNo', e.target.value)}
                            className="w-20 px-2 py-1 border border-gray-200 rounded text-sm outline-none focus:border-primary"
                          />
                        </td>
                        <td className="p-2">
                          <input
                            type="text"
                            value={st.name || ''}
                            onChange={(e) => handleStudentFieldChange(sIdx, 'name', e.target.value)}
                            className="w-40 px-2 py-1 border border-gray-200 rounded text-sm outline-none focus:border-primary"
                          />
                        </td>
                        <td className="p-2">
                          <input
                            type="text"
                            value={st.mobile || ''}
                            onChange={(e) => handleStudentFieldChange(sIdx, 'mobile', e.target.value)}
                            className="w-28 px-2 py-1 border border-gray-200 rounded text-sm outline-none focus:border-primary text-center"
                          />
                        </td>
                        <td className="p-2">
                          <input
                            type="text"
                            value={st.parentEmail || ''}
                            onChange={(e) => handleStudentFieldChange(sIdx, 'parentEmail', e.target.value)}
                            className="w-40 px-2 py-1 border border-gray-200 rounded text-sm outline-none focus:border-primary text-center"
                          />
                        </td>
                        {st.subjects.map((sub, subIdx) => (
                          <td key={subIdx} className="p-2 text-center">
                            <input
                              type="number"
                              value={sub.marks !== undefined ? sub.marks : ''}
                              onChange={(e) => handleStudentSubjectChange(sIdx, subIdx, e.target.value)}
                              className="w-16 px-2 py-1 border border-gray-200 rounded text-sm text-center outline-none focus:border-primary"
                            />
                          </td>
                        ))}
                        <td className="p-2 text-center">
                          <button onClick={() => handleRemoveStudent(sIdx)} className="text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 p-1.5 rounded" title="Remove Row">
                            <FiTrash2 />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
              {!loadingEdit && editingBatchId && (
                <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-center">
                   <button onClick={handleAddStudent} className="px-4 py-2 border border-dashed border-primary text-primary hover:bg-blue-50 rounded-lg flex items-center transition-colors">
                     + Add New Student Row
                   </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <input
        type="file"
        accept=".xlsx, .xls"
        className="hidden"
        ref={fileInputRef}
        onChange={handleUpdateFileChange}
      />
    </div>
  );
};

export default Upload;
