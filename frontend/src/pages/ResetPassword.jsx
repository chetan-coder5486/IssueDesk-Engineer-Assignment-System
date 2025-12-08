import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../utils/api';

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState('idle');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setMessage('Passwords do not match');
      return;
    }
    setStatus('loading');
    try {
      const url = `/api/v1/user/reset-password/${token}`;
      const { data } = await api.post(url, { password, confirmPassword });
      setMessage(data?.message || 'Password reset successful');
      setStatus('succeeded');
      // Redirect to login after short delay
      setTimeout(() => navigate('/login'), 1200);
    } catch (err) {
      setStatus('failed');
      setMessage(err.response?.data?.message || 'Failed to reset password');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#050505] text-white">
      <div className="w-full max-w-md bg-gray-900 p-6 rounded-lg">
        <h2 className="text-xl font-bold mb-4">Set a new password</h2>
        <p className="text-sm text-gray-400 mb-4">Choose a strong password (8+ chars). The link expires in 1 hour.</p>

        {message && <div className="mb-4 p-3 bg-white/5 rounded">{message}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="password" placeholder="New password" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full p-3 rounded bg-black/50 border border-gray-700" />
          <input type="password" placeholder="Confirm new password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required className="w-full p-3 rounded bg-black/50 border border-gray-700" />
          <div className="flex gap-2">
            <button type="submit" disabled={status === 'loading'} className="px-4 py-2 bg-green-600 rounded">Reset Password</button>
            <Link to="/login" className="px-4 py-2 bg-white/5 rounded">Back to Login</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
