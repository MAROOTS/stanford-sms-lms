import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import axiosClient from '../../api/axiosClient';
import TempPasswordModal from '../../components/shared/TempPasswordModal';

export default function EnrollModal({ application, onClose, onEnrolled }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [saving, setSaving] = useState(false);
    const [credentials, setCredentials] = useState(null);

    useEffect(() => {
        axiosClient.get('/admin/users/generate-username', { params: { role: 'STUDENT' } })
            .then((res) => setUsername(res.data.username));
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (password !== confirmPassword) { setError('Passwords do not match'); return; }
        setSaving(true);
        try {
            const { data } = await axiosClient.post(`/admissions/${application.id}/enroll`, {
                username, password, confirmPassword,
            });
            setCredentials(data);
        } catch (err) {
            setError(err.response?.data?.message || 'Could not enroll this applicant');
        } finally { setSaving(false); }
    };

    if (credentials) {
        return (
            <TempPasswordModal
                username={credentials.username}
                temporaryPassword={credentials.temporaryPassword}
                parentUsername={credentials.parentUsername}
                parentTemporaryPassword={credentials.parentTemporaryPassword}
                parentCreated={credentials.parentCreated}
                onClose={onEnrolled}
            />
        );
    }

    return (
        <div className="fixed inset-0 bg-slate-900/40 flex items-center justify-center z-50 px-4">
            <div className="bg-white rounded-xl w-full max-w-sm p-6 shadow-xl">
                <div className="flex items-center justify-between mb-1">
                    <h2 className="text-lg font-bold text-slate-900">Enroll student</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
                </div>
                <p className="text-sm text-slate-500 mb-5">{application.firstName} {application.lastName}</p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Username <span className="text-slate-400 font-normal">(editable)</span></label>
                        <input required value={username} onChange={(e) => setUsername(e.target.value)}
                               className="w-full px-3 py-2.5 rounded-lg bg-slate-50 border border-slate-200 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-teal-accent" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">Temp password</label>
                            <input type="text" required value={password} onChange={(e) => setPassword(e.target.value)}
                                   className="w-full px-3 py-2.5 rounded-lg bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-accent" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">Confirm</label>
                            <input type="text" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                                   className="w-full px-3 py-2.5 rounded-lg bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-accent" />
                        </div>
                    </div>

                    {error && <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</p>}

                    <div className="flex gap-3 pt-2">
                        <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50">Cancel</button>
                        <button type="submit" disabled={saving} className="flex-1 py-2.5 rounded-lg bg-navy-900 hover:bg-navy-800 text-white text-sm font-medium disabled:opacity-60">
                            {saving ? 'Enrolling...' : 'Create account'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}