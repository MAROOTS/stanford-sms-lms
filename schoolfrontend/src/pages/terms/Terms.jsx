import { useEffect, useState, useCallback } from 'react';
import { Plus } from 'lucide-react';
import axiosClient from '../../api/axiosClient';
import TermModal from './TermModal';

export default function Terms() {
    const [terms, setTerms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState(null);

    const load = useCallback(async () => {
        setLoading(true); setError('');
        try {
            const { data } = await axiosClient.get('/terms');
            setTerms(data);
        } catch { setError('Could not load terms'); }
        finally { setLoading(false); }
    }, []);

    useEffect(() => { load(); }, [load]);

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this term?')) return;
        try {
            await axiosClient.delete(`/terms/${id}`);
            setTerms((prev) => prev.filter((t) => t.id !== id));
        } catch (err) {
            alert(err.response?.data?.message || 'Could not delete this term.');
        }
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Terms</h1>
                    <p className="text-sm text-slate-500 mt-1">Academic terms for the school calendar.</p>
                </div>
                <button onClick={() => { setEditing(null); setModalOpen(true); }}
                        className="flex items-center gap-1.5 bg-navy-900 hover:bg-navy-800 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors">
                    <Plus size={16} /> Add term
                </button>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <table className="w-full text-sm">
                    <thead>
                    <tr className="border-b border-slate-100 text-left text-[11px] font-semibold tracking-wider text-slate-400">
                        <th className="px-6 py-3">TERM</th>
                        <th className="px-6 py-3">DATES</th>
                        <th className="px-6 py-3">STATUS</th>
                        <th className="px-6 py-3 text-right">ACTIONS</th>
                    </tr>
                    </thead>
                    <tbody>
                    {loading && <tr><td colSpan={4} className="px-6 py-8 text-center text-slate-400">Loading...</td></tr>}
                    {error && !loading && <tr><td colSpan={4} className="px-6 py-8 text-center text-red-500">{error}</td></tr>}
                    {!loading && !error && terms.length === 0 && <tr><td colSpan={4} className="px-6 py-8 text-center text-slate-400">No terms yet.</td></tr>}
                    {terms.map((t) => (
                        <tr key={t.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50">
                            <td className="px-6 py-4 font-medium text-slate-800">{t.name}</td>
                            <td className="px-6 py-4 text-slate-600">{t.startDate || '—'} {t.endDate ? `– ${t.endDate}` : ''}</td>
                            <td className="px-6 py-4">
                                {t.isCurrent
                                    ? <span className="inline-block bg-teal-accent/15 text-teal-700 text-xs font-medium px-2.5 py-1 rounded-full">Current</span>
                                    : <span className="text-slate-400">—</span>}
                            </td>
                            <td className="px-6 py-4 text-right">
                                <button onClick={() => { setEditing(t); setModalOpen(true); }} className="text-slate-500 hover:text-slate-700 font-medium mr-4">Edit</button>
                                <button onClick={() => handleDelete(t.id)} className="text-red-500 hover:text-red-600 font-medium">Delete</button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>

            {modalOpen && <TermModal initialData={editing} onClose={() => setModalOpen(false)} onSaved={() => { setModalOpen(false); load(); }} />}
        </div>
    );
}