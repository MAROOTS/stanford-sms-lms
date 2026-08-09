import { useState } from 'react';
import { X } from 'lucide-react';
import axiosClient from '../../api/axiosClient';

const DECISIONS = [
    { value: 'UNDER_REVIEW', label: 'Mark under review', style: 'text-slate-700 border-slate-300' },
    { value: 'ACCEPTED', label: 'Accept', style: 'text-teal-700 border-teal-300' },
    { value: 'WAITLISTED', label: 'Waitlist', style: 'text-amber-700 border-amber-300' },
    { value: 'REJECTED', label: 'Reject', style: 'text-red-700 border-red-300' },
];

export default function DecisionModal({ application, onClose, onSaved }) {
    const [status, setStatus] = useState(application.status === 'SUBMITTED' ? 'UNDER_REVIEW' : application.status);
    const [notes, setNotes] = useState(application.notes || '');
    const [error, setError] = useState('');
    const [saving, setSaving] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(''); setSaving(true);
        try {
            await axiosClient.patch(`/admissions/${application.id}/decision`, { status, notes: notes || null });
            onSaved();
        } catch (err) {
            setError(err.response?.data?.message || 'Could not update decision');
        } finally { setSaving(false); }
    };

    return (
        <div className="fixed inset-0 bg-slate-900/40 flex items-center justify-center z-50 px-4">
            <div className="bg-white rounded-xl w-full max-w-sm p-6 shadow-xl">
                <div className="flex items-center justify-between mb-1">
                    <h2 className="text-lg font-bold text-slate-900">Review application</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
                </div>
                <p className="text-sm text-slate-500 mb-5">{application.firstName} {application.lastName}</p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-2">
                        {DECISIONS.map((d) => (
                            <button key={d.value} type="button" onClick={() => setStatus(d.value)}
                                    className={`text-sm font-medium py-2.5 rounded-lg border-2 transition-colors ${
                                        status === d.value ? `${d.style} bg-slate-50` : 'text-slate-400 border-slate-200 hover:border-slate-300'
                                    }`}>
                                {d.label}
                            </button>
                        ))}
                    </div>

                    <textarea rows={3} placeholder="Notes (optional)" value={notes} onChange={(e) => setNotes(e.target.value)}
                              className="w-full px-3 py-2.5 rounded-lg bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-accent resize-none" />

                    {error && <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</p>}

                    <div className="flex gap-3 pt-2">
                        <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50">Cancel</button>
                        <button type="submit" disabled={saving} className="flex-1 py-2.5 rounded-lg bg-navy-900 hover:bg-navy-800 text-white text-sm font-medium disabled:opacity-60">
                            {saving ? 'Saving...' : 'Save decision'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}