import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircleIcon, XCircleIcon, EnvelopeIcon } from '@heroicons/react/24/outline';
import authApi from '../../api/auth.api';

const VerifyEmail = () => {
  const { token } = useParams();
  const [status, setStatus] = useState('verifying'); // verifying, success, error
  const [message, setMessage] = useState('Verifying your email address...');

  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setStatus('error');
        setMessage('Invalid verification link.');
        return;
      }

      try {
        await authApi.verifyEmail(token);
        setStatus('success');
        setMessage('Your email has been successfully verified! You can now log in.');
      } catch (err) {
        setStatus('error');
        setMessage(err.response?.data?.message || 'Verification failed. The link may be invalid or expired.');
      }
    };

    verifyToken();
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-xl text-center">
        {status === 'verifying' && (
          <div className="flex flex-col items-center">
            <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-blue-100 mb-6">
              <EnvelopeIcon className="h-8 w-8 text-blue-600 animate-pulse" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Verifying Email</h2>
            <p className="text-gray-600 animate-pulse">{message}</p>
          </div>
        )}

        {status === 'success' && (
          <div className="flex flex-col items-center">
            <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-green-100 mb-6">
              <CheckCircleIcon className="h-10 w-10 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Verified!</h2>
            <p className="text-gray-600 mb-8">{message}</p>
            <Link
              to="/login"
              className="w-full inline-flex justify-center items-center px-4 py-3 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              Go to Login
            </Link>
          </div>
        )}

        {status === 'error' && (
          <div className="flex flex-col items-center">
            <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-red-100 mb-6">
              <XCircleIcon className="h-10 w-10 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Verification Failed</h2>
            <p className="text-red-600 mb-8">{message}</p>
            <Link
              to="/login"
              className="w-full inline-flex justify-center items-center px-4 py-3 border border-gray-300 text-sm font-medium rounded-lg shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              Back to Login
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;
