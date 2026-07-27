import { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';

export default function ResetPassword() {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const [newPassword, setNewPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(''); setLoading(true);
        try {
            await axiosClient.post('/auth/reset-password', { token, newPassword });
            setSuccess(true);
            setTimeout(() => navigate('/login'), 2000);
        } catch (err) {
            setError(err.response?.data?.message || 'Could not reset password');
        } finally { setLoading(false); }
    };

    if (!token) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 px-6">
                <p className="text-sm text-red-600">This link is invalid. <Link to="/forgot-password" className="underline">Request a new one</Link>.</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 px-6">
            <div className="w-full max-w-sm">
                {success ? (
                    <p className="text-center text-sm text-teal-700">Password reset — redirecting you to login...</p>
                ) : (
                    <>
                        <h1 className="text-2xl font-bold text-slate-900 mb-1 text-center">Set a new password</h1>
                        <p className="text-sm text-slate-500 mb-8 text-center">Choose a new password for your account.</p>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <input type="password" required minLength={6} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="New password"
                                   className="w-full px-3 py-2.5 rounded-lg bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-accent" />
                            {error && <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</p>}
                            <button type="submit" disabled={loading}
                                    className="w-full bg-navy-900 hover:bg-navy-800 text-white font-medium py-2.5 rounded-lg transition-colors disabled:opacity-60">
                                {loading ? 'Saving...' : 'Reset password'}
                            </button>
                        </form>
                    </>
                )}
            </div>
        </div>
    );
}