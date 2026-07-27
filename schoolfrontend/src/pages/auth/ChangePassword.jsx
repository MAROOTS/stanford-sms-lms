import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock } from 'lucide-react';
import axiosClient from '../../api/axiosClient';
import { useAuth } from '../../context/useAuth';

export default function ChangePassword() {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { clearMustChangePassword } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (newPassword !== confirmNewPassword) {
            setError('New passwords do not match');
            return;
        }

        setLoading(true);
        try {
            await axiosClient.put('/auth/change-password', { currentPassword, newPassword });
            clearMustChangePassword();
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Could not change password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 px-6">
            <div className="w-full max-w-sm">
                <h1 className="text-2xl font-bold text-slate-900 mb-1 text-center">Set a new password</h1>
                <p className="text-sm text-slate-500 mb-8 text-center">
                    Your account has a temporary password. Please set a new one to continue.
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="relative">
                        <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input type="password" required value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)}
                               placeholder="Current (temporary) password"
                               className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-accent" />
                    </div>
                    <div className="relative">
                        <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input type="password" required minLength={6} value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                               placeholder="New password"
                               className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-accent" />
                    </div>
                    <div className="relative">
                        <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input type="password" required value={confirmNewPassword} onChange={(e) => setConfirmNewPassword(e.target.value)}
                               placeholder="Confirm new password"
                               className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-accent" />
                    </div>

                    {error && <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</p>}

                    <button type="submit" disabled={loading}
                            className="w-full bg-navy-900 hover:bg-navy-800 text-white font-medium py-2.5 rounded-xl transition-colors disabled:opacity-60">
                        {loading ? 'Saving...' : 'Set new password'}
                    </button>
                </form>
            </div>
        </div>
    );
}