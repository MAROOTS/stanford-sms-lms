import { useEffect, useState, useCallback } from 'react';
import { Plus, Calendar } from 'lucide-react';
import axiosClient from '../../api/axiosClient';
import TermModal from './TermModal';
import ConfirmDialog from '../../components/shared/ConfirmDialog';
import EmptyState from '../../components/shared/EmptyState';
import { TableSkeleton } from '../../components/shared/LoadingSkeleton';
import { useToast } from '../../context/ToastContext';

export default function Terms() {
    const [terms, setTerms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null);

    const toast = useToast();

    const load = useCallback(async () => {
        setLoading(true); setError('');
        try {
            const { data } = await axiosClient.get('/terms');
            setTerms(data);
        } catch { setError('Could not load terms'); }
        finally { setLoading(false); }
    }, []);

    useEffect(() => { load(); }, [load]);

    const handleDelete = async () => {
        if (!deleteTarget) return;
        const id = deleteTarget.id;
        const name = deleteTarget.name;
        setDeleteTarget(null);
        try {
            await axiosClient.delete(`/terms/${id}`);
            setTerms((prev) => prev.filter((t) => t.id !== id));
            toast.success(`${name} has been deleted.`);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Could not delete this term.');
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

            {loading && <TableSkeleton columns={4} rows={4} />}

            {error && !loading && (
                <div className="bg-red-50 border border-red-100 rounded-xl p-6 text-center">
                    <p className="text-red-600 text-sm mb-3">{error}</p>
                    <button onClick={load} className="text-sm font-medium text-red-700 hover:text-red-800 underline">Try again</button>
                </div>
            )}

            {!loading && !error && terms.length === 0 && (
                <EmptyState
                    icon={Calendar}
                    title="No terms yet"
                    description="Create the first academic term to organize exams and schedules."
                    action={
                        <button onClick={() => { setEditing(null); setModalOpen(true); }}
                                className="flex items-center gap-1.5 bg-navy-900 hover:bg-navy-800 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors">
                            <Plus size={16} /> Add term
                        </button>
                    }
                />
            )}

            {!loading && !error && terms.length > 0 && (
                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                    <div className="overflow-x-auto">
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
                            {terms.map((t) => (
                                <tr key={t.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-slate-800">{t.name}</td>
                                    <td className="px-6 py-4 text-slate-600">{t.startDate || '—'} {t.endDate ? `– ${t.endDate}` : ''}</td>
                                    <td className="px-6 py-4">
                                        {t.isCurrent
                                            ? <span className="inline-block bg-teal-accent/15 text-teal-700 text-xs font-medium px-2.5 py-1 rounded-full">Current</span>
                                            : <span className="text-slate-400 text-xs">—</span>}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button onClick={() => { setEditing(t); setModalOpen(true); }} className="text-slate-500 hover:text-slate-700 font-medium mr-4 transition-colors">Edit</button>
                                        <button onClick={() => setDeleteTarget(t)} className="text-red-500 hover:text-red-600 font-medium transition-colors">Delete</button>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {modalOpen && <TermModal initialData={editing} onClose={() => setModalOpen(false)} onSaved={() => { setModalOpen(false); load(); toast.success('Term saved successfully.'); }} />}

            <ConfirmDialog
                open={!!deleteTarget}
                title="Delete term"
                message={`Are you sure you want to delete "${deleteTarget?.name}"?`}
                confirmLabel="Delete"
                variant="danger"
                onConfirm={handleDelete}
                onCancel={() => setDeleteTarget(null)}
            />
        </div>
    );
}
