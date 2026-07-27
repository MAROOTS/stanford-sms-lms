import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import axiosClient from '../../api/axiosClient';
import TempPasswordModal from '../../components/shared/TempPasswordModal';

export default function StudentModal({ initialData, classSections, readOnly, onClose, onSaved }) {
    const isEdit = Boolean(initialData) && !readOnly;

    const [firstName, setFirstName] = useState(initialData?.firstName || '');
    const [lastName, setLastName] = useState(initialData?.lastName || '');
    const [username, setUsername] = useState(initialData?.username || '');
    const [email, setEmail] = useState(initialData?.email || '');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [classSectionId, setClassSectionId] = useState(initialData?.classSectionId?.toString() || '');
    const [error, setError] = useState('');
    const [saving, setSaving] = useState(false);
    const [createdCredentials, setCreatedCredentials] = useState(null);

    useEffect(() => {
        if (!initialData && !readOnly) {
            axiosClient.get('/admin/users/generate-username', { params: { role: 'STUDENT' } })
                .then((res) => setUsername(res.data.username))
                .catch(() => setError('Could not generate a username'));
        }
    }, [initialData, readOnly]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!isEdit && password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setSaving(true);
        try {
            if (isEdit) {
                await axiosClient.put(`/students/${initialData.id}`, {
                    firstName, lastName, email,
                    classSectionId: classSectionId ? Number(classSectionId) : null,
                });
                onSaved();
            } else {
                const { data } = await axiosClient.post('/admin/users', {
                    firstName, lastName, username, email, password, confirmPassword, role: 'STUDENT',
                });
                if (classSectionId) {
                    await axiosClient.patch(`/students/${data.id}/section`, { classSectionId: Number(classSectionId) });
                }
                setCreatedCredentials({ username, temporaryPassword: password });
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Something went wrong');
        } finally {
            setSaving(false);
        }
    };

    if (createdCredentials) {
        return (
            <TempPasswordModal
                username={createdCredentials.username}
                temporaryPassword={createdCredentials.temporaryPassword}
                onClose={() => { onSaved(); }}
            />
        );
    }

    return (
        <div className="fixed inset-0 bg-slate-900/40 flex items-center justify-center z-50 px-4">
            <div className="bg-white rounded-xl w-full max-w-md p-6 shadow-xl">
                <div className="flex items-center justify-between mb-5">
                    <h2 className="text-lg font-bold text-slate-900">
                        {readOnly ? 'Student details' : isEdit ? 'Edit student' : 'Add student'}
                    </h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">First name</label>
                            <input required disabled={readOnly} value={firstName} onChange={(e) => setFirstName(e.target.value)}
                                   className="w-full px-3 py-2.5 rounded-lg bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-accent disabled:opacity-60" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">Last name</label>
                            <input required disabled={readOnly} value={lastName} onChange={(e) => setLastName(e.target.value)}
                                   className="w-full px-3 py-2.5 rounded-lg bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-accent disabled:opacity-60" />
                        </div>
                    </div>

                    {!isEdit && (
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">
                                Username <span className="text-slate-400 font-normal">(auto-generated, editable)</span>
                            </label>
                            <input required disabled={readOnly} value={username} onChange={(e) => setUsername(e.target.value)}
                                   className="w-full px-3 py-2.5 rounded-lg bg-slate-50 border border-slate-200 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-teal-accent disabled:opacity-60" />
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
                        <input type="email" required disabled={readOnly} value={email} onChange={(e) => setEmail(e.target.value)}
                               className="w-full px-3 py-2.5 rounded-lg bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-accent disabled:opacity-60" />
                    </div>

                    {!isEdit && !readOnly && (
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">Temporary password</label>
                                <input type="text" required value={password} onChange={(e) => setPassword(e.target.value)}
                                       className="w-full px-3 py-2.5 rounded-lg bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-accent" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">Confirm password</label>
                                <input type="text" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                                       className="w-full px-3 py-2.5 rounded-lg bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-accent" />
                            </div>
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">
                            Class <span className="text-slate-400 font-normal">(optional)</span>
                        </label>
                        <select disabled={readOnly} value={classSectionId} onChange={(e) => setClassSectionId(e.target.value)}
                                className="w-full px-3 py-2.5 rounded-lg bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-accent disabled:opacity-60">
                            <option value="">Unassigned</option>
                            {classSections.map((c) => <option key={c.id} value={c.id}>{c.name} ({c.gradeLevelName})</option>)}
                        </select>
                    </div>

                    {error && <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</p>}

                    {!readOnly && (
                        <div className="flex gap-3 pt-2">
                            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50">Cancel</button>
                            <button type="submit" disabled={saving} className="flex-1 py-2.5 rounded-lg bg-navy-900 hover:bg-navy-800 text-white text-sm font-medium disabled:opacity-60">
                                {saving ? 'Saving...' : isEdit ? 'Save changes' : 'Add student'}
                            </button>
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
}