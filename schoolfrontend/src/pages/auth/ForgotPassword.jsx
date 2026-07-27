import { useState } from 'react';
import { Link } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';

export default function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await axiosClient.post('/auth/forgot-password', { email });
        } finally {
            setSubmitted(true); // always show the same message, regardless of outcome
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 px-6">
            <div className="w-full max-w-sm">
                {submitted ? (
                    <div className="text-center">
                        <h1 className="text-xl font-bold text-slate-900 mb-2">Check your email</h1>
                        <p className="text-sm text-slate-500 mb-6">
                            If an account exists for <strong>{email}</strong>, a reset link has been sent.
                        </p>
                        <Link to="/login" className="text-teal-600 font-medium hover:text-teal-700 text-sm">Back to login</Link>
                    </div>
                ) : (
                    <>
                        <h1 className="text-2xl font-bold text-slate-900 mb-1 text-center">Forgot password?</h1>
                        <p className="text-sm text-slate-500 mb-8 text-center">Enter your email and we'll send you a reset link.</p>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email"
                                   className="w-full px-3 py-2.5 rounded-lg bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-accent" />
                            <button type="submit" disabled={loading}
                                    className="w-full bg-navy-900 hover:bg-navy-800 text-white font-medium py-2.5 rounded-lg transition-colors disabled:opacity-60">
                                {loading ? 'Sending...' : 'Send reset link'}
                            </button>
                        </form>
                        <p className="text-center text-sm text-slate-500 mt-6">
                            <Link to="/login" className="text-teal-600 font-medium hover:text-teal-700">Back to login</Link>
                        </p>
                    </>
                )}
            </div>
        </div>
    );
}