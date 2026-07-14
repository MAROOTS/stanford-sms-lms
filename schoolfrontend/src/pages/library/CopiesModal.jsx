import { useEffect, useState, useCallback } from 'react';
import { X, Plus } from 'lucide-react';
import axiosClient from '../../api/axiosClient';

const STATUS_STYLES = {
    AVAILABLE: 'bg-teal-accent/15 text-teal-700',
    BORROWED: 'bg-amber-50 text-amber-700',
    LOST: 'bg-red-50 text-red-600',
    DAMAGED: 'bg-slate-100 text-slate-600',
};

export default function CopiesModal({ book, onClose, onChanged }) {
    const [copies, setCopies] = useState([]);
    const [newCode, setNewCode] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const { data } = await axiosClient.get(`/library/books/${book.id}/copies`);
            setCopies(data);
        } catch { setError('Could not load copies'); }
        finally { setLoading(false); }
    }, [book.id]);

    useEffect(() => { load(); }, [load]);

    const handleAdd = async (e) => {
        e.preventDefault();
        if (!newCode.trim()) return;
        setError('');
        try {
            await axiosClient.post(`/library/books/${book.id}/copies`, { copyCode: newCode });
            setNewCode('');
            load(); onChanged();
        } catch (err) {
            setError(err.response?.data?.message || 'Could not add copy');
        }
    };

    const handleStatusChange = async (copyId, status) => {
        setError('');
        try {
            await axiosClient.patch(`/library/copies/${copyId}/status`, { status });
            load(); onChanged();
        } catch (err) {
            setError(err.response?.data?.message || 'Could not update status');
        }
    };

    const handleDelete = async (copyId) => {
        if (!window.confirm('Delete this copy?')) return;
        setError('');
        try {
            await axiosClient.delete(`/library/copies/${copyId}`);
            load(); onChanged();
        } catch (err) {
            setError(err.response?.data?.message || 'Could not delete this copy');
        }
    };

    return (
        <div className="fixed inset-0 bg-slate-900/40 flex items-center justify-center z-50 px-4 py-8 overflow-y-auto">
            <div className="bg-white rounded-xl w-full max-w-lg p-6 shadow-xl my-auto">
                <div className="flex items-center justify-between mb-1">
                    <h2 className="text-lg font-bold text-slate-900">Manage copies</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
                </div>
                <p className="text-sm text-slate-500 mb-5">{book.title}</p>

                <form onSubmit={handleAdd} className="flex gap-2 mb-4">
                    <input value={newCode} onChange={(e) => setNewCode(e.target.value)} placeholder="New copy code, e.g. LIB-0003"
                           className="flex-1 px-3 py-2.5 rounded-lg bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-accent" />
                    <button type="submit" className="flex items-center gap-1.5 bg-navy-900 hover:bg-navy-800 text-white text-sm font-medium px-3.5 py-2.5 rounded-lg">
                        <Plus size={16} /> Add
                    </button>
                </form>

                {error && <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2 mb-4">{error}</p>}
                {loading && <p className="text-sm text-slate-400">Loading copies...</p>}

                {!loading && (
                    <div className="border border-slate-200 rounded-lg overflow-hidden max-h-72 overflow-y-auto">
                        {copies.length === 0 && <p className="text-sm text-slate-400 px-4 py-6 text-center">No copies yet.</p>}
                        {copies.map((c) => (
                            <div key={c.id} className="flex items-center justify-between px-4 py-3 border-b border-slate-50 last:border-0">
                                <div className="flex items-center gap-3">
                                    <span className="font-medium text-slate-800 text-sm">{c.copyCode}</span>
                                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_STYLES[c.status]}`}>{c.status}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    {c.status !== 'BORROWED' && (
                                        <select value={c.status} onChange={(e) => handleStatusChange(c.id, e.target.value)}
                                                className="text-xs border border-slate-200 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-teal-accent">
                                            <option value="AVAILABLE">Available</option>
                                            <option value="LOST">Lost</option>
                                            <option value="DAMAGED">Damaged</option>
                                        </select>
                                    )}
                                    {c.status !== 'BORROWED' && (
                                        <button onClick={() => handleDelete(c.id)} className="text-red-500 hover:text-red-600 text-xs font-medium">Delete</button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}