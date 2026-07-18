import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import axiosClient from '../../api/axiosClient';

export default function IssueLoanModal({ book, onClose, onIssued }) {
    const [borrowers, setBorrowers] = useState([]);
    const [borrowerId, setBorrowerId] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [error, setError] = useState('');
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        Promise.all([axiosClient.get('/students'), axiosClient.get('/teachers')]).then(([studentsRes, teachersRes]) => {
            const students = studentsRes.data.map((s) => ({ id: s.id, name: `${s.firstName} ${s.lastName}`, role: 'Student' }));
            const teachers = teachersRes.data.map((t) => ({ id: t.id, name: `${t.firstName} ${t.lastName}`, role: 'Teacher' }));
            setBorrowers([...students, ...teachers]);
        }).catch(() => setError('Could not load students/teachers'));
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(''); setSaving(true);
        try {
            await axiosClient.post('/library/loans', {
                bookId: book.id, borrowerId: Number(borrowerId), dueDate: dueDate || null,
            });
            onIssued();
        } catch (err) {
            setError(err.response?.data?.message || 'Could not issue this loan');
        } finally { setSaving(false); }
    };

    return (
        <div className="fixed inset-0 bg-slate-900/40 flex items-center justify-center z-50 px-4">
            <div className="bg-white rounded-xl w-full max-w-sm p-6 shadow-xl">
                <div className="flex items-center justify-between mb-1">
                    <h2 className="text-lg font-bold text-slate-900">Issue loan</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
                </div>
                <p className="text-sm text-slate-500 mb-5">{book.title} · {book.availableCopies} available</p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Borrower</label>
                        <select required value={borrowerId} onChange={(e) => setBorrowerId(e.target.value)}
                                className="w-full px-3 py-2.5 rounded-lg bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-accent">
                            <option value="">Select borrower...</option>
                            {borrowers.map((b) => <option key={`${b.role}-${b.id}`} value={b.id}>{b.name} ({b.role})</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">
                            Due date <span className="text-slate-400 font-normal">(optional — defaults to 14 days)</span>
                        </label>
                        <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)}
                               className="w-full px-3 py-2.5 rounded-lg bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-accent" />
                    </div>
                    {error && <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</p>}
                    <div className="flex gap-3 pt-2">
                        <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50">Cancel</button>
                        <button type="submit" disabled={saving} className="flex-1 py-2.5 rounded-lg bg-navy-900 hover:bg-navy-800 text-white text-sm font-medium disabled:opacity-60">
                            {saving ? 'Issuing...' : 'Issue loan'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}