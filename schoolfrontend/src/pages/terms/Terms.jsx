import { useEffect, useState, useCallback } from 'react';
import { Plus, Calendar, Eye, Pencil, Trash2, Clock, CheckCircle2 } from 'lucide-react';
import axiosClient from '../../api/axiosClient';
import TermModal from './TermModal';
import ConfirmDialog from '../../components/shared/ConfirmDialog';
import EmptyState from '../../components/shared/EmptyState';
import { TableSkeleton } from '../../components/shared/LoadingSkeleton';
import { useToast } from '../../context/useToast';

export default function Terms() {
    const [terms, setTerms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState(null);
    const [viewing, setViewing] = useState(null);
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

    useEffect(() => { queueMicrotask(() => load()); }, [load]);

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
        <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 animate-in fade-in duration-500">
            {/* HEADER & CONTROLS */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">Terms</h1>
                    <p className="text-sm text-slate-500 mt-1.5">Manage academic terms and schedule milestones for the school calendar.</p>
                </div>
                <button
                    onClick={() => { setEditing(null); setViewing(null); setModalOpen(true); }}
                    className="flex items-center justify-center gap-2 bg-navy-900 hover:bg-navy-800 text-white shadow-sm text-sm font-semibold px-5 py-2.5 rounded-xl transition-all active:scale-[0.98]"
                >
                    <Plus size={18} /> Add Term
                </button>
            </div>

            {/* LOADING STATE */}
            {loading && <TableSkeleton columns={4} rows={4} />}

            {/* ERROR STATE */}
            {error && !loading && (
                <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 text-center shadow-sm">
                    <p className="text-rose-700 text-sm font-medium mb-3">{error}</p>
                    <button onClick={load} className="text-sm font-semibold text-rose-800 hover:text-rose-900 underline">Try again</button>
                </div>
            )}

            {/* EMPTY STATE */}
            {!loading && !error && terms.length === 0 && (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-12">
                    <EmptyState
                        icon={Calendar}
                        title="No terms yet"
                        description="Create the first academic term to organize exams, billing cycles, and schedules."
                        action={
                            <button
                                onClick={() => { setEditing(null); setViewing(null); setModalOpen(true); }}
                                className="flex items-center gap-2 bg-navy-900 hover:bg-navy-800 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-all shadow-sm"
                            >
                                <Plus size={16} /> Add Term
                            </button>
                        }
                    />
                </div>
            )}

            {/* DATA TABLE */}
            {!loading && !error && terms.length > 0 && (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto custom-scrollbar">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-slate-50 border-b border-slate-200">
                            <tr className="text-[11px] font-bold tracking-wider text-slate-500 uppercase">
                                <th className="px-6 py-4">Term</th>
                                <th className="px-6 py-4">Dates</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                            {terms.map((t) => (
                                <tr key={t.id} className="group bg-white hover:bg-slate-50/80 transition-colors">
                                    <td className="px-6 py-4 font-semibold text-slate-900">
                                        <div className="flex items-center gap-2.5">
                                            <div className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600">
                                                <Calendar size={16} />
                                            </div>
                                            {t.name}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-slate-600 font-medium">
                                        {t.startDate ? (
                                            <div className="flex items-center gap-1.5 text-xs text-slate-600 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-lg w-fit">
                                                <Clock size={12} className="text-slate-400" />
                                                {t.startDate} {t.endDate ? `– ${t.endDate}` : ''}
                                            </div>
                                        ) : (
                                            <span className="text-slate-400">—</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        {t.isCurrent ? (
                                            <span className="inline-flex items-center gap-1 bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-bold px-2.5 py-1 rounded-full">
                                                <CheckCircle2 size={12} /> Current
                                            </span>
                                        ) : (
                                            <span className="text-slate-400 text-xs font-normal">—</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-right whitespace-nowrap">
                                        <div className="flex items-center justify-end gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => { setViewing(t); setEditing(null); setModalOpen(true); }}
                                                title="View Details"
                                                className="p-2 rounded-xl text-slate-400 hover:text-navy-900 hover:bg-slate-100 transition-colors"
                                            >
                                                <Eye size={16} />
                                            </button>
                                            <button
                                                onClick={() => { setEditing(t); setViewing(null); setModalOpen(true); }}
                                                title="Edit Term"
                                                className="p-2 rounded-xl text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                                            >
                                                <Pencil size={16} />
                                            </button>
                                            <button
                                                onClick={() => setDeleteTarget(t)}
                                                title="Delete Term"
                                                className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* MODAL */}
            {modalOpen && (
                <TermModal
                    initialData={editing || viewing}
                    readOnly={!!viewing}
                    onClose={() => setModalOpen(false)}
                    onSaved={() => { setModalOpen(false); load(); toast.success('Term saved successfully.'); }}
                />
            )}

            {/* CONFIRMATION DIALOG */}
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