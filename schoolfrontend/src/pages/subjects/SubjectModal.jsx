import { useState } from 'react';
import { X } from 'lucide-react';
import axiosClient from '../../api/axiosClient';

export default function SubjectModal({ initialData, onClose, onSaved, readOnly }) {
    const isEdit = Boolean(initialData);
    const isView = readOnly && isEdit;
    const [name, setName] = useState(initialData?.name || '');
    const [code, setCode] = useState(initialData?.code || '');
    const [error, setError] = useState('');
    const [saving, setSaving] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(''); setSaving(true);
        try {
            const payload = { name, code };
            if (isEdit) await axiosClient.put(`/subjects/${initialData.id}`, payload);
            else await axiosClient.post('/subjects', payload);
            onSaved();
        } catch (err) {
            setError(err.response?.data?.message || 'Something went wrong');
        } finally { setSaving(false); }
    };

    return (
        <div className="fixed inset-0 bg-slate-900/40 flex items-center justify-center z-50 px-4" onClick={onClose}>
            <div className="bg-white rounded-xl w-full max-w-sm p-6 shadow-xl animate-fade-in" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-5">
                    <h2 className="text-lg font-bold text-slate-900">{isView ? 'View subject' : isEdit ? 'Edit subject' : 'Add subject'}</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Subject name</label>
                        <input required value={name} onChange={(e) => setName(e.target.value)} disabled={isView} placeholder="e.g. Mathematics"
                               className="w-full px-3 py-2.5 rounded-lg bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-accent" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Code <span className="text-slate-400 font-normal">(optional)</span></label>
                        <input value={code} onChange={(e) => setCode(e.target.value)} disabled={isView} placeholder="e.g. MATH"
                               className="w-full px-3 py-2.5 rounded-lg bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-accent" />
                    </div>
                    {error && <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</p>}
                    <div className="flex gap-3 pt-2">
                        <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50">{isView ? 'Close' : 'Cancel'}</button>
                        {!isView && (
                            <button type="submit" disabled={saving} className="flex-1 py-2.5 rounded-lg bg-navy-900 hover:bg-navy-800 text-white text-sm font-medium disabled:opacity-60">
                                {saving ? 'Saving...' : isEdit ? 'Save changes' : 'Add subject'}
                            </button>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
}