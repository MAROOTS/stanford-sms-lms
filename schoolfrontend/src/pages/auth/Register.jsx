import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock } from 'lucide-react';
import axiosClient from '../../api/axiosClient';

export default function Register() {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(''); setLoading(true);
        try {
            await axiosClient.post('/auth/register', { firstName, lastName, email, password, role: 'STUDENT' });
            setSubmitted(true);
        } catch (err) {
            setError(err.response?.data?.message || 'Something went wrong');
        } finally { setLoading(false); }
    };

    if (submitted) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 px-6">
                <div className="w-full max-w-sm text-center">
                    <h1 className="text-xl font-bold text-slate-900 mb-2">Check your email</h1>
                    <p className="text-sm text-slate-500 mb-6">
                        We've sent a verification link to <strong>{email}</strong>. Click it to activate your account before logging in.
                    </p>
                    <Link to="/login" className="text-teal-600 font-medium hover:text-teal-700 text-sm">Back to login</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 px-6 py-10">
            <div className="w-full max-w-sm">
                <h1 className="text-2xl font-bold text-slate-900 mb-1 text-center">Create your account</h1>
                <p className="text-sm text-slate-500 mb-8 text-center">Student registration for SchoolOS.</p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                        <input required value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="First name"
                               className="w-full px-3 py-2.5 rounded-lg bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-accent" />
                        <input required value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Last name"
                               className="w-full px-3 py-2.5 rounded-lg bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-accent" />
                    </div>
                    <div className="relative">
                        <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email"
                               className="w-full pl-10 pr-3 py-2.5 rounded-lg bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-accent" />
                    </div>
                    <div className="relative">
                        <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password"
                               className="w-full pl-10 pr-3 py-2.5 rounded-lg bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-accent" />
                    </div>

                    {error && <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</p>}

                    <button type="submit" disabled={loading}
                            className="w-full bg-navy-900 hover:bg-navy-800 text-white font-medium py-2.5 rounded-lg transition-colors disabled:opacity-60">
                        {loading ? 'Creating account...' : 'Create account'}
                    </button>
                </form>

                <p className="text-center text-sm text-slate-500 mt-6">
                    Already have an account?{' '}
                    <button onClick={() => navigate('/login')} className="text-teal-600 font-medium hover:text-teal-700">Sign in</button>
                </p>
            </div>
        </div>
    );
}