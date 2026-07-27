import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';

export default function VerifyEmail() {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const [status, setStatus] = useState('loading'); // loading | success | error

    useEffect(() => {
        if (!token) { setStatus('error'); return; }
        axiosClient.get('/auth/verify-email', { params: { token } })
            .then(() => setStatus('success'))
            .catch(() => setStatus('error'));
    }, [token]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 px-6 text-center">
            <div className="w-full max-w-sm">
                {status === 'loading' && <p className="text-sm text-slate-400">Verifying your email...</p>}
                {status === 'success' && (
                    <>
                        <h1 className="text-xl font-bold text-slate-900 mb-2">Email verified!</h1>
                        <p className="text-sm text-slate-500 mb-6">You can now log in to your account.</p>
                        <Link to="/login" className="text-teal-600 font-medium hover:text-teal-700">Go to login</Link>
                    </>
                )}
                {status === 'error' && (
                    <>
                        <h1 className="text-xl font-bold text-slate-900 mb-2">Verification failed</h1>
                        <p className="text-sm text-slate-500">This link may be invalid or expired. Try logging in — you'll get an option to resend it.</p>
                    </>
                )}
            </div>
        </div>
    );
}