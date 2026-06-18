import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { toast } from 'react-toastify';
import { FiLock, FiArrowLeft } from 'react-icons/fi';

const VerifyOTP = () => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  
  const mobile = location.state?.mobile;

  useEffect(() => {
    if (!mobile) {
      navigate('/');
    }
  }, [mobile, navigate]);

  const handleChange = (element, index) => {
    if (isNaN(element.value)) return false;

    setOtp([...otp.map((d, idx) => (idx === index ? element.value : d))]);

    // Focus next input
    if (element.nextSibling) {
      element.nextSibling.focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace') {
      if (otp[index] === '' && e.target.previousSibling) {
        e.target.previousSibling.focus();
      }
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    const otpValue = otp.join('');
    if (otpValue.length !== 6) {
      toast.error('Please enter complete 6-digit OTP');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/auth/verify-otp', { mobile, otp: otpValue });
      toast.success('Verified Successfully');
      localStorage.setItem('studentToken', res.data.token);
      localStorage.setItem('studentMobile', mobile);
      navigate('/result');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden p-8 border border-gray-100 relative">
        <button 
          onClick={() => navigate('/')}
          className="absolute top-6 left-6 text-gray-400 hover:text-gray-800 transition-colors"
        >
          <FiArrowLeft className="text-2xl" />
        </button>

        <div className="text-center mb-8 mt-4">
          <div className="mx-auto h-16 w-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
            <FiLock className="text-3xl text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Verify OTP</h1>
          <p className="text-gray-500">We sent a 6-digit code to the parent's email associated with +91 {mobile}</p>
        </div>

        <form onSubmit={handleVerify} className="space-y-8">
          <div className="flex justify-center gap-2 sm:gap-4">
            {otp.map((data, index) => {
              return (
                <input
                  className="w-12 h-14 text-center text-2xl font-semibold border border-gray-300 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                  type="text"
                  name="otp"
                  maxLength="1"
                  key={index}
                  value={data}
                  onChange={e => handleChange(e.target, index)}
                  onKeyDown={e => handleKeyDown(e, index)}
                  onFocus={e => e.target.select()}
                />
              );
            })}
          </div>

          <button
            type="submit"
            disabled={loading || otp.join('').length !== 6}
            className={`w-full h-12 bg-primary hover:bg-primary-light text-white font-medium rounded-xl flex justify-center items-center text-lg shadow-lg shadow-primary/30 transition-all ${
              (loading || otp.join('').length !== 6) ? 'opacity-70 cursor-not-allowed' : ''
            }`}
          >
            {loading ? 'Verifying...' : 'Verify & View Result'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default VerifyOTP;
