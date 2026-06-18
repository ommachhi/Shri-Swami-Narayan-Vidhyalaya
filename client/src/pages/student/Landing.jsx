import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { toast } from 'react-toastify';

const Landing = () => {
  const [mobile, setMobile] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSendOTP = async (e) => {
    e.preventDefault();
    if (mobile.length !== 10) {
      toast.error('Please enter a valid 10-digit mobile number');
      return;
    }

    setLoading(true);
    try {
      await api.post('/auth/send-otp', { mobile });
      toast.success('OTP sent successfully');
      navigate('/verify', { state: { mobile } });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden p-8 border border-gray-100">
        <div className="text-center mb-8">
          <div className="mx-auto h-20 w-20 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            {/* Logo Placeholder */}
            <span className="text-3xl text-primary font-bold">SS</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Shri Swami Narayana Vidhyalaya</h1>
          <p className="text-gray-500">Student Result Portal</p>
        </div>

        <form onSubmit={handleSendOTP} className="space-y-6">
          <div>
            <label htmlFor="mobile" className="block text-sm font-medium text-gray-700 mb-2">
              Mobile Number / मोबाइल नंबर
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-gray-500 font-medium">
                +91
              </span>
              <input
                id="mobile"
                type="tel"
                maxLength="10"
                pattern="[0-9]{10}"
                value={mobile}
                onChange={(e) => setMobile(e.target.value.replace(/\D/g, ''))}
                className="input-field pl-12 h-12 text-lg"
                placeholder="Enter 10 digit number"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || mobile.length !== 10}
            className={`w-full h-12 btn-primary flex justify-center items-center text-lg shadow-lg shadow-primary/30 ${
              (loading || mobile.length !== 10) ? 'opacity-70 cursor-not-allowed' : ''
            }`}
          >
            {loading ? 'Sending...' : 'Send OTP'}
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-gray-500">
          <p>For school administration, <a href="/admin/login" className="text-accent hover:underline">login here</a></p>
        </div>
      </div>
    </div>
  );
};

export default Landing;
