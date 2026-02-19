import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ShieldCheckIcon } from '@heroicons/react/24/outline';
import authApi from '../../api/auth.api';

const OTPPage = () => {
  const [otp, setOtp] = useState(['', '', '', '']);
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendDisabled, setResendDisabled] = useState(false);
  const [timer, setTimer] = useState(30);

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Get email from location state or local storage
    const stateEmail = location.state?.email;
    if (stateEmail) {
      setEmail(stateEmail);
    } else {
        // Fallback or redirect if no email found
        setError("Email not found. Please try registering again.");
    }
  }, [location]);

  useEffect(() => {
    let interval;
    if (resendDisabled && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (timer === 0) {
      setResendDisabled(false);
      setTimer(30);
    }
    return () => clearInterval(interval);
  }, [resendDisabled, timer]);

  const handleChange = (element, index) => {
    if (isNaN(element.value)) return false;

    setOtp([...otp.map((d, idx) => (idx === index ? element.value : d))]);

    // Focus next input
    if (element.value !== '' && element.nextSibling) {
      element.nextSibling.focus();
    }
  };
  
  const handleKeyDown = (e, index) => {
      // Handle backspace to focus previous input
      if (e.key === 'Backspace' && otp[index] === '' && e.target.previousSibling) {
          e.target.previousSibling.focus();
      }
  }

  const handlePaste = (e) => {
      e.preventDefault();
      const pastedData = e.clipboardData.getData('text').slice(0, 4).split('');
      if (pastedData.length > 0) {
          const newOtp = [...otp];
          pastedData.forEach((val, index) => {
              if (index < 4 && !isNaN(val)) newOtp[index] = val;
          });
          setOtp(newOtp);
      }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    const otpValue = otp.join('');
    if (otpValue.length !== 4) {
      setError('Please enter a valid 4-digit OTP');
      return;
    }

    setIsLoading(true);

    try {
      // Demo OTP validation
      if (otpValue === '1111') {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        alert('Email verified successfully!');
        navigate('/login');
      } else {
        throw new Error('Invalid OTP. Please try again.');
      }
    } catch (err) {
      console.error('OTP verification error:', err);
      setError(err.message || 'Invalid OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    setResendDisabled(true);
    setError('');
    try {
      await authApi.resendVerification(email);
      alert('OTP resent successfully!');
    } catch (err) {
      console.error('Resend error:', err);
      setError('Failed to resend OTP. Please try again.');
        setResendDisabled(false); // Enable retry if failed
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md">
        <div className="text-center">
            <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-blue-100">
            <ShieldCheckIcon className="h-6 w-6 text-blue-600" />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Verify your email
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            We sent a verification code to <span className="font-medium text-gray-900">{email}</span>
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="flex">
                <div className="ml-3">
                  <p className="text-sm font-medium text-red-800">{error}</p>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-center space-x-2">
            {otp.map((data, index) => (
              <input
                className="w-12 h-12 border border-gray-300 rounded text-center text-xl font-semibold focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition duration-200"
                type="text"
                name="otp"
                maxLength="1"
                key={index}
                value={data}
                onChange={(e) => handleChange(e.target, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                onPaste={handlePaste}
                onFocus={(e) => e.target.select()}
                disabled={isLoading}
              />
            ))}
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading || otp.join('').length !== 4}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Verifying...' : 'Verify Email'}
            </button>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              Didn't receive the code?{' '}
              <button
                type="button"
                onClick={handleResend}
                disabled={resendDisabled || isLoading}
                className="font-medium text-blue-600 hover:text-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {resendDisabled ? `Resend in ${timer}s` : 'Resend Code'}
              </button>
            </p>
          </div>
           <div className="text-center mt-2">
            <button
              type="button"
               onClick={() => navigate('/register')}
              className="text-sm font-medium text-gray-500 hover:text-gray-700"
            >
              Back to Registration
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OTPPage;
