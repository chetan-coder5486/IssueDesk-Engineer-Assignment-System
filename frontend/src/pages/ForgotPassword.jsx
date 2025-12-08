import React, { useState } from 'react';
import api from '../utils/api';
import { Link } from 'react-router-dom';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');
    setMessage('');
    try {
      const { data } = await api.post('/api/v1/user/forgot-password', { email: email.trim().toLowerCase() });
      setStatus('succeeded');
      setMessage(data?.message || 'If an account exists for that email, a reset link has been sent.');
    } catch (err) {
      setStatus('failed');
      setMessage(err.response?.data?.message || 'Failed to send reset email.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#050505] text-white">
      <div className="w-full max-w-md bg-gray-900 p-6 rounded-lg">
        <h2 className="text-xl font-bold mb-4">Reset your password</h2>
        <p className="text-sm text-gray-400 mb-4">Enter your email and we'll send a secure link to reset your password.</p>

        {message && <div className="mb-4 p-3 bg-white/5 rounded">{message}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full p-3 rounded bg-black/50 border border-gray-700"
          />
          <div className="flex gap-2">
            <button type="submit" disabled={status === 'loading'} className="px-4 py-2 bg-purple-600 rounded">Send Reset Link</button>
            <Link to="/login" className="px-4 py-2 bg-white/5 rounded">Back to Login</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
