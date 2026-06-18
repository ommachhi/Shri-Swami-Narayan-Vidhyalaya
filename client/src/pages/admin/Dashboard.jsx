import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { toast } from 'react-toastify';
import { FiUsers, FiCheckCircle, FiXCircle, FiAward, FiClock } from 'react-icons/fi';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/dashboard/stats');
        setStats(res.data);
      } catch (error) {
        toast.error('Failed to load dashboard statistics');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="p-8 text-center text-gray-500">
        No dashboard data available.
      </div>
    );
  }

  return (
    <div className="p-8 h-full overflow-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
        <p className="mt-2 text-gray-500">Overview of Shri Swami Narayana Vidhyalaya Results</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex items-center space-x-4">
          <div className="bg-blue-50 text-blue-600 p-4 rounded-xl">
            <FiUsers className="text-2xl" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Total Students</p>
            <h3 className="text-2xl font-bold text-gray-800">{stats.totalStudents || 0}</h3>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex items-center space-x-4">
          <div className="bg-green-50 text-green-600 p-4 rounded-xl">
            <FiCheckCircle className="text-2xl" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Total Passed</p>
            <h3 className="text-2xl font-bold text-gray-800">{stats.totalPassed || 0}</h3>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex items-center space-x-4">
          <div className="bg-red-50 text-red-600 p-4 rounded-xl">
            <FiXCircle className="text-2xl" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Total Failed</p>
            <h3 className="text-2xl font-bold text-gray-800">{stats.totalFailed || 0}</h3>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex items-center space-x-4">
          <div className="bg-purple-50 text-purple-600 p-4 rounded-xl">
            <FiAward className="text-2xl" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Published Batches</p>
            <h3 className="text-2xl font-bold text-gray-800">{stats.publishedResults || 0}</h3>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-primary to-primary-light rounded-2xl p-6 shadow-md text-white relative overflow-hidden">
          <div className="absolute -right-6 -top-6 text-white/10">
            <FiAward className="text-9xl" />
          </div>
          <h3 className="text-lg font-medium text-white/80 mb-2">Topper Student</h3>
          <p className="text-3xl font-bold mb-1">{stats.topperName}</p>
          <p className="text-xl font-medium text-white/90">
            {stats.topperPercentage ? `${stats.topperPercentage}%` : 'N/A'}
          </p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col justify-center">
          <div className="flex items-center space-x-3 mb-4">
            <div className="bg-orange-50 text-orange-500 p-3 rounded-lg">
              <FiClock className="text-xl" />
            </div>
            <h3 className="text-lg font-bold text-gray-800">Latest Upload</h3>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-500">Academic Year</span>
              <span className="font-medium text-gray-800">{stats.latestAcademicYear}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Date</span>
              <span className="font-medium text-gray-800">
                {stats.latestUploadDate ? new Date(stats.latestUploadDate).toLocaleDateString() : 'N/A'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
