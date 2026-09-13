import { useEffect, useState, useCallback } from 'react';
import { Plus, BookOpen, Eye, Pencil, Trash2, Hash } from 'lucide-react';
import axiosClient from '../../api/axiosClient';
import SubjectModal from './SubjectModal';
import ConfirmDialog from '../../components/shared/ConfirmDialog';
import EmptyState from '../../components/shared/EmptyState';
import { TableSkeleton } from '../../components/shared/LoadingSkeleton';
import { useToast } from '../../context/useToast';

export default function Subjects() {
    const [subjects, setSubjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState(null);
    const [viewing, setViewing] = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null);

    const toast = useToast();

    const load = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const { data } = await axiosClient.get('/subjects');
            setSubjects(data || []);
        } catch {
            setError('Could not load subjects');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        let isMounted = true;
        load().catch(() => {
            if (isMounted) setError('Could not load subjects');
        });
        return () => {
            isMounted = false;
        };
    }, [load]);

    const handleDelete = async () => {
        if (!deleteTarget) return;
        const id = deleteTarget.id;
        const name = deleteTarget.name;
        setDeleteTarget(null);
        try {
            await axiosClient.delete(`/subjects/${id}`);
            setSubjects((prev) => prev.filter((s) => s.id !== id));
            toast.success(`${name} has been deleted.`);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Could not delete this subject.');
        }
    };

    const openAddModal = () => {
        setEditing(null);
        setViewing(null);
        setModalOpen(true);
    };

    const openEditModal = (subject) => {
        setEditing(subject);
        setViewing(null);
        setModalOpen(true);
    };

    const openViewModal = (subject) => {
        setViewing(subject);
        setEditing(null);
        setModalOpen(true);
    };

    const handleSaved = () => {
        setModalOpen(false);
        load();
        toast.success('Subject saved successfully.');
    };

    return (
        <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 animate-in fade-in duration-500">
            {/* HEADER & CONTROLS */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
                <div>
                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
                            Subjects
                        </h1>
                        {!loading && subjects.length > 0 && (
                            <span className="bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                                {subjects.length}
                            </span>
                        )}
                    </div>
                    <p className="text-sm text-slate-500 mt-1">
                        Manage academic subjects taught across your school curriculum.
                    </p>
                </div>

                <button
                    onClick={openAddModal}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 bg-navy-900 hover:bg-navy-800 text-white shadow-sm text-sm font-semibold px-5 py-2.5 rounded-xl transition-all active:scale-[0.98]"
                >
                    <Plus size={18} /> Add Subject
                </button>
            </div>

            {/* LOADING STATE */}
            {loading && <TableSkeleton columns={3} rows={5} />}

            {/* ERROR STATE */}
            {error && !loading && (
                <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 text-center shadow-sm">
                    <p className="text-rose-700 text-sm font-medium mb-3">{error}</p>
                    <button
                        onClick={load}
                        className="text-sm font-semibold text-rose-800 hover:text-rose-900 underline"
                    >
                        Try again
                    </button>
                </div>
            )}

            {/* EMPTY STATE */}
            {!loading && !error && subjects.length === 0 && (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 sm:p-12">
                    <EmptyState
                        icon={BookOpen}
                        title="No subjects yet"
                        description="Add your first subject to organize the curriculum and assign teachers."
                        action={
                            <button
                                onClick={openAddModal}
                                className="flex items-center gap-2 bg-navy-900 hover:bg-navy-800 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-all shadow-sm"
                            >
                                <Plus size={16} /> Add Subject
                            </button>
                        }
                    />
                </div>
            )}

            {/* DATA TABLE */}
            {!loading && !error && subjects.length > 0 && (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto custom-scrollbar">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-slate-50 border-b border-slate-200">
                            <tr className="text-[11px] font-bold tracking-wider text-slate-500 uppercase">
                                <th className="px-6 py-4">Subject</th>
                                <th className="px-6 py-4">Subject Code</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                            {subjects.map((s) => (
                                <tr
                                    key={s.id}
                                    className="hover:bg-slate-50/80 transition-colors"
                                >
                                    <td className="px-6 py-4 font-semibold text-slate-900 whitespace-nowrap">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 font-bold text-xs shrink-0">
                                                {s.name?.substring(0, 2).toUpperCase() || 'SB'}
                                            </div>
                                            {s.name}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {s.code ? (
                                            <span className="inline-flex items-center gap-1 bg-slate-100 border border-slate-200 text-slate-700 text-xs font-mono font-semibold px-2.5 py-1 rounded-lg">
                                                    <Hash size={13} className="text-slate-400" />
                                                {s.code}
                                                </span>
                                        ) : (
                                            <span className="text-slate-400">—</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-right whitespace-nowrap">
                                        <div className="flex items-center justify-end gap-1">
                                            <button
                                                onClick={() => openViewModal(s)}
                                                title="View Details"
                                                className="p-2 rounded-xl text-slate-500 hover:text-navy-900 hover:bg-slate-100 transition-colors"
                                            >
                                                <Eye size={16} />
                                            </button>
                                            <button
                                                onClick={() => openEditModal(s)}
                                                title="Edit Subject"
                                                className="p-2 rounded-xl text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                                            >
                                                <Pencil size={16} />
                                            </button>
                                            <button
                                                onClick={() => setDeleteTarget(s)}
                                                title="Delete Subject"
                                                className="p-2 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
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
                <SubjectModal
                    initialData={editing || viewing}
                    readOnly={!!viewing}
                    onClose={() => setModalOpen(false)}
                    onSaved={handleSaved}
                />
            )}

            {/* CONFIRMATION DIALOG */}
            <ConfirmDialog
                open={!!deleteTarget}
                title="Delete subject"
                message={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
                confirmLabel="Delete"
                variant="danger"
                onConfirm={handleDelete}
                onCancel={() => setDeleteTarget(null)}
            />
        </div>
    );
}