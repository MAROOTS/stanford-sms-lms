import { useEffect, useState, useCallback } from 'react';
import { X, Plus } from 'lucide-react';
import axiosClient from '../../api/axiosClient';

export default function HoldsModal({ book, onClose, onChanged }) {
    const [holds, setHolds] = useState([]);
    const [borrowers, setBorrowers] = useState([]);
    const [borrowerId, setBorrowerId] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const { data } = await axiosClient.get(`/library/books/${book.id}/holds`);
            setHolds(data);
        } catch { setError('Could not load hold queue'); }
        finally { setLoading(false); }
    }, [book.id]);

    useEffect(() => { load(); }, [load]);

    useEffect(() => {
        Promise.all([axiosClient.get('/students'), axiosClient.get('/teachers')]).then(([s, t]) => {
            setBorrowers([
                ...s.data.map((x) => ({ id: x.id, name: `${x.firstName} ${x.lastName}`, role: 'Student' })),
                ...t.data.map((x) => ({ id: x.id, name: `${x.firstName} ${x.lastName}`, role: 'Teacher' })),
            ]);
        });
    }, []);

    const handlePlace = async (e) => {
        e.preventDefault();
        if (!borrowerId) return;
        setError('');
        try {
            await axiosClient.post(`/library/books/${book.id}/holds`, { borrowerId: Number(borrowerId) });
            setBorrowerId('');
            load(); onChanged();
        } catch (err) {
            setError(err.response?.data?.message || 'Could not place hold');
        }
    };

    const handleCancel = async (holdId) => {
        try {
            await axiosClient.delete(`/library/books/${book.id}/holds/${holdId}`);
            load(); onChanged();
        } catch (err) {
            setError(err.response?.data?.message || 'Could not cancel hold');
        }
    };

    return (
        <div className="fixed inset-0 bg-slate-900/40 flex items-center justify-center z-50 px-4 py-8 overflow-y-auto">
            <div className="bg-white rounded-xl w-full max-w-lg p-6 shadow-xl my-auto">
                <div className="flex items-center justify-between mb-1">
                    <h2 className="text-lg font-bold text-slate-900">Hold queue</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
                </div>
                <p className="text-sm text-slate-500 mb-5">{book.title}</p>

                <form onSubmit={handlePlace} className="flex gap-2 mb-4">
                    <select value={borrowerId} onChange={(e) => setBorrowerId(e.target.value)}
                            className="flex-1 px-3 py-2.5 rounded-lg bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-accent">
                        <option value="">Select borrower...</option>
                        {borrowers.map((b) => <option key={`${b.role}-${b.id}`} value={b.id}>{b.name} ({b.role})</option>)}
                    </select>
                    <button type="submit" className="flex items-center gap-1.5 bg-navy-900 hover:bg-navy-800 text-white text-sm font-medium px-3.5 py-2.5 rounded-lg">
                        <Plus size={16} /> Add
                    </button>
                </form>

                {error && <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2 mb-4">{error}</p>}
                {loading && <p className="text-sm text-slate-400">Loading queue...</p>}

                {!loading && (
                    <div className="border border-slate-200 rounded-lg overflow-hidden">
                        {holds.length === 0 && <p className="text-sm text-slate-400 px-4 py-6 text-center">No holds on this book.</p>}
                        {holds.map((h, index) => (
                            <div key={h.id} className="flex items-center justify-between px-4 py-3 border-b border-slate-50 last:border-0">
                                <div className="flex items-center gap-3">
                                    <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-600 text-xs font-semibold flex items-center justify-center">{index + 1}</span>
                                    <span className="text-sm text-slate-800">{h.borrowerName}</span>
                                    {h.notified && <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-teal-accent/15 text-teal-700">Notified</span>}
                                </div>
                                <button onClick={() => handleCancel(h.id)} className="text-red-500 hover:text-red-600 text-xs font-medium">Cancel</button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}