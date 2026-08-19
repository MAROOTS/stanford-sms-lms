import { useState } from 'react';
import { X } from 'lucide-react';
import axiosClient from '../../api/axiosClient';
import TempPasswordModal from '../../components/shared/TempPasswordModal';

export default function OnboardSchoolModal({ onClose, onOnboarded }) {
    const [schoolName, setSchoolName] = useState('');
    const [adminFirstName, setAdminFirstName] = useState('');
    const [adminLastName, setAdminLastName] = useState('');
    const [adminEmail, setAdminEmail] = useState('');
    const [error, setError] = useState('');
    const [saving, setSaving] = useState(false);
    const [credentials, setCredentials] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(''); setSaving(true);
        try {
            const { data } = await axiosClient.post('/platform/schools', { schoolName, adminFirstName, adminLastName, adminEmail });
            setCredentials({ username: data.adminUsername, temporaryPassword: data.adminTemporaryPassword });
        } catch (err) {
            setError(err.response?.data?.message || 'Could not onboard this school');
        } finally { setSaving(false); }
    };

    if (credentials) {
        return <TempPasswordModal username={credentials.username} temporaryPassword={credentials.temporaryPassword} onClose={onOnboarded} />;
    }

    return (
        <div className="fixed inset-0 bg-slate-900/40 flex items-center justify-center z-50 px-4">
            <div className="bg-white rounded-xl w-full max-w-md p-6 shadow-xl">
                <div className="flex items-center justify-between mb-5">
                    <h2 className="text-lg font-bold text-slate-900">Onboard a new school</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input required placeholder="School name" value={schoolName} onChange={(e) => setSchoolName(e.target.value)}
                           className="w-full px-3 py-2.5 rounded-lg bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-accent" />
                    <p className="text-xs font-semibold tracking-wider text-slate-400 pt-2">FIRST ADMIN ACCOUNT</p>
                    <div className="grid grid-cols-2 gap-3">
                        <input required placeholder="First name" value={adminFirstName} onChange={(e) => setAdminFirstName(e.target.value)}
                               className="w-full px-3 py-2.5 rounded-lg bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-accent" />
                        <input required placeholder="Last name" value={adminLastName} onChange={(e) => setAdminLastName(e.target.value)}
                               className="w-full px-3 py-2.5 rounded-lg bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-accent" />
                    </div>
                    <input required type="email" placeholder="Admin email" value={adminEmail} onChange={(e) => setAdminEmail(e.target.value)}
                           className="w-full px-3 py-2.5 rounded-lg bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-accent" />
                    {error && <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</p>}
                    <div className="flex gap-3 pt-2">
                        <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50">Cancel</button>
                        <button type="submit" disabled={saving} className="flex-1 py-2.5 rounded-lg bg-navy-900 hover:bg-navy-800 text-white text-sm font-medium disabled:opacity-60">
                            {saving ? 'Onboarding...' : 'Onboard school'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}