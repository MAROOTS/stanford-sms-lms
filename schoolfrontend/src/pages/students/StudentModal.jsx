import { useState } from 'react';
import { X } from 'lucide-react';
import axiosClient from '../../api/axiosClient';

export default function StudentModal({ initialData, classSections, readOnly, onClose, onSaved }) {
    const [firstName, setFirstName] = useState(initialData?.firstName || '');
    const [lastName, setLastName] = useState(initialData?.lastName || '');
    const [email, setEmail] = useState(initialData?.email || '');
    const [classSectionId, setClassSectionId] = useState(initialData?.classSectionId?.toString() || '');
    const [error, setError] = useState('');
    const [saving, setSaving] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(''); setSaving(true);
        try {
            await axiosClient.put(`/students/${initialData.id}`, {
                firstName, lastName, email,
                classSectionId: classSectionId ? Number(classSectionId) : null,
            });
            onSaved();
        } catch (err) {
            setError(err.response?.data?.message || 'Something went wrong');
        } finally { setSaving(false); }
    };

    return (
        <div className="fixed inset-0 bg-slate-900/40 flex items-center justify-center z-50 px-4">
            <div className="bg-white rounded-xl w-full max-w-md p-6 shadow-xl">
                <div className="flex items-center justify-between mb-5">
                    <h2 className="text-lg font-bold text-slate-900">{readOnly ? 'Student details' : 'Edit student'}</h2>
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

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
                        <input type="email" required disabled={readOnly} value={email} onChange={(e) => setEmail(e.target.value)}
                               className="w-full px-3 py-2.5 rounded-lg bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-accent disabled:opacity-60" />
                    </div>

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
                                {saving ? 'Saving...' : 'Save changes'}
                            </button>
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
}