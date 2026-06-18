import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { toast } from 'react-toastify';
import { FiDownload, FiPrinter, FiLogOut } from 'react-icons/fi';

const Result = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchResults = async () => {
      const mobile = localStorage.getItem('studentMobile');
      if (!mobile) {
        navigate('/');
        return;
      }

      try {
        const res = await api.get(`/result/${mobile}`);
        if (Array.isArray(res.data)) {
          setResults(res.data);
        } else {
          setResults([]);
          toast.error('Invalid data format received from server');
        }
      } catch (error) {
        toast.error('Session expired or unauthorized');
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [navigate]);

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

  const handleLogout = () => {
    localStorage.removeItem('studentToken');
    localStorage.removeItem('studentMobile');
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex justify-between items-center mb-6 print:hidden">
          <h1 className="text-2xl font-bold text-gray-800">Your Results</h1>
          <button 
            onClick={handleLogout}
            className="flex items-center text-red-500 hover:text-red-700 bg-red-50 px-4 py-2 rounded-lg font-medium transition-colors"
          >
            <FiLogOut className="mr-2" /> Logout
          </button>
        </div>

        {results.map((result) => (
          <div key={result._id} className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden mb-12 relative print:shadow-none print:border-none print:m-0">
            {/* Header Section */}
            <div className="bg-primary p-8 text-center text-white rounded-t-2xl">
              <div className="flex justify-center mb-4">
                <div className="h-20 w-20 bg-white rounded-full flex items-center justify-center text-primary text-2xl font-bold shadow-lg">
                  SSNV
                </div>
              </div>
              <h1 className="text-3xl font-extrabold tracking-wide uppercase">Shri Swami Narayana Vidhyalaya</h1>
              <p className="text-primary-light mt-2 text-lg">Academic Year: {result.academicYear}</p>
              <div className="absolute top-4 right-4 print:hidden flex gap-2">
                <button 
                  onClick={() => handleDownloadPDF(result._id, result.rollNo)}
                  className="bg-white/20 hover:bg-white/30 p-2 rounded-full backdrop-blur-sm transition-all"
                  title="Download PDF"
                >
                  <FiDownload className="text-xl" />
                </button>
                <button 
                  onClick={() => window.print()}
                  className="bg-white/20 hover:bg-white/30 p-2 rounded-full backdrop-blur-sm transition-all"
                  title="Print Result"
                >
                  <FiPrinter className="text-xl" />
                </button>
              </div>
            </div>

            <div className="p-8">
              <h2 className="text-xl font-bold text-gray-800 border-b pb-2 mb-6 uppercase text-center">{result.examName}</h2>
              
              {/* Student Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8 mb-8 bg-gray-50 p-6 rounded-xl border border-gray-100">
                <div className="flex justify-between border-b border-gray-200 pb-2">
                  <span className="text-gray-500 font-medium">Student Name</span>
                  <span className="font-semibold text-gray-800">{result.name}</span>
                </div>
                <div className="flex justify-between border-b border-gray-200 pb-2">
                  <span className="text-gray-500 font-medium">Roll Number</span>
                  <span className="font-semibold text-gray-800">{result.originalRollNo || result.rollNo}</span>
                </div>
                <div className="flex justify-between border-b border-gray-200 pb-2">
                  <span className="text-gray-500 font-medium">Class</span>
                  <span className="font-semibold text-gray-800">{result.className}</span>
                </div>
                <div className="flex justify-between border-b border-gray-200 pb-2">
                  <span className="text-gray-500 font-medium">Mobile Number</span>
                  <span className="font-semibold text-gray-800">+91 {result.mobile}</span>
                </div>
                {result.parentName && (
                  <div className="flex justify-between border-b border-gray-200 pb-2 md:col-span-2">
                    <span className="text-gray-500 font-medium">Parent Name</span>
                    <span className="font-semibold text-gray-800">{result.parentName}</span>
                  </div>
                )}
              </div>

              {/* Marks Table */}
              <div className="overflow-x-auto rounded-xl border border-gray-200">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-primary/5">
                      <th className="px-6 py-4 font-bold text-gray-700 uppercase tracking-wider text-sm border-b border-gray-200">Subject</th>
                      <th className="px-6 py-4 font-bold text-gray-700 uppercase tracking-wider text-sm border-b border-gray-200 text-center">Marks Obtained</th>
                      <th className="px-6 py-4 font-bold text-gray-700 uppercase tracking-wider text-sm border-b border-gray-200 text-center">Max Marks</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {result.subjects.map((sub, idx) => (
                      <tr key={idx} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 text-gray-800 font-medium">{sub.name}</td>
                        <td className="px-6 py-4 text-center font-semibold text-primary">{sub.marks}</td>
                        <td className="px-6 py-4 text-center text-gray-500">{sub.maxMarks}</td>
                      </tr>
                    ))}
                    <tr className="bg-gray-50 font-bold border-t-2 border-gray-200">
                      <td className="px-6 py-4 text-gray-800 uppercase">Total</td>
                      <td className="px-6 py-4 text-center text-primary text-lg">{result.total}</td>
                      <td className="px-6 py-4 text-center text-gray-800 text-lg">{result.maxTotal}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Summary Area */}
              <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-between items-center bg-blue-50/50 p-6 rounded-xl border border-blue-100">
                <div className="text-center sm:text-left">
                  <p className="text-sm text-gray-500 uppercase tracking-wider font-semibold">Percentage</p>
                  <p className="text-3xl font-extrabold text-blue-800">{result.percentage.toFixed(2)}%</p>
                </div>
                <div className="h-12 w-px bg-blue-200 hidden sm:block"></div>
                <div className="text-center">
                  <p className="text-sm text-gray-500 uppercase tracking-wider font-semibold">Grade</p>
                  <p className="text-3xl font-extrabold text-primary">{result.grade}</p>
                </div>
                <div className="h-12 w-px bg-blue-200 hidden sm:block"></div>
                <div className="text-center sm:text-right">
                  <p className="text-sm text-gray-500 uppercase tracking-wider font-semibold">Status</p>
                  <p className={`text-3xl font-extrabold ${result.result === 'Pass' ? 'text-green-600' : 'text-red-600'}`}>
                    {result.result}
                  </p>
                </div>
              </div>

              {/* Footer Signature block for print */}
              <div className="mt-16 pt-8 border-t border-gray-200 flex justify-between items-end px-4 print:flex text-gray-600 font-medium hidden">
                <div className="text-center">
                  <div className="w-40 border-b border-gray-400 mb-2"></div>
                  <p>Class Teacher</p>
                </div>
                <div className="text-center">
                  <div className="w-40 border-b border-gray-400 mb-2"></div>
                  <p>Principal</p>
                </div>
              </div>
              <div className="text-center text-xs text-gray-400 mt-8 hidden print:block">
                Generated on: {new Date().toLocaleDateString()} by SSNV Digital Result System
              </div>

            </div>
          </div>
        ))}

        {results.length === 0 && (
          <div className="bg-white p-12 text-center rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold text-gray-800 mb-2">No Results Found</h2>
            <p className="text-gray-500">We couldn't find any results associated with your number.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Result;
