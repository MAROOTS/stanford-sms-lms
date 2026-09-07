import { useEffect, useState, useCallback } from 'react';
import { Plus, Users, Pencil, Trash2, KeyRound, Unlock, RotateCcw, Sparkles } from 'lucide-react';
import axiosClient from '../../api/axiosClient';
import ParentModal from './ParentModal';
import ConfirmDialog from '../../components/shared/ConfirmDialog';
import EmptyState from '../../components/shared/EmptyState';
import { TableSkeleton } from '../../components/shared/LoadingSkeleton';
import { useToast } from '../../context/useToast';
import TempPasswordModal from '../../components/shared/TempPasswordModal';
import { useAccountActions } from "../../hooks/useAccountActions";

export default function Parents() {
    const [parents, setParents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [modalOpen, setModalOpen] = useState(false);
    const [editingParent, setEditingParent] = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const toast = useToast();

    const load = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const { data } = await axiosClient.get('/parents');
            setParents(data || []);
        } catch {
            setError('Could not load parent accounts. Please try again.');
        } flex: {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        load();
    }, [load]);

    const handleDelete = async () => {
        if (!deleteTarget) return;
        const id = deleteTarget.id;
        const name = `${deleteTarget.firstName} ${deleteTarget.lastName}`;
        setDeleteTarget(null);
        try {
            await axiosClient.delete(`/parents/${id}`);
            setParents((prev) => prev.filter((p) => p.id !== id));
            toast.success(`${name} has been deleted.`);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Could not delete this parent.');
        }
    };

    const { resetCredentials, setResetCredentials, handleResetPassword, handleUnlock } =
        useAccountActions(toast, { entityLabel: 'parent' });

    const openAddModal = () => {
        setEditingParent(null);
        setModalOpen(true);
    };

    const openEditModal = (parent) => {
        setEditingParent(parent);
        setModalOpen(true);
    };

    const handleSaved = () => {
        setModalOpen(false);
        load();
        toast.success('Parent saved successfully.');
    };

    return (
        <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 animate-in fade-in duration-500">
            {/* HEADER */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-navy-900/5 text-navy-900 text-xs font-semibold mb-2">

                        Account Management
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">Parents</h1>
                    <p className="text-sm text-slate-500 mt-1.5">
                        Manage parent accounts and link them to student profiles.
                    </p>
                </div>
                <button
                    type="button"
                    onClick={openAddModal}
                    className="flex items-center justify-center gap-2 bg-navy-900 hover:bg-navy-800 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-all shadow-sm active:scale-[0.98] cursor-pointer self-start sm:self-auto"
                >
                    <Plus size={18} /> Add Parent
                </button>
            </div>

            {/* LOADING SKELETON */}
            {loading && <TableSkeleton columns={6} rows={6} />}

            {/* ERROR STATE */}
            {error && !loading && (
                <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 text-center shadow-2xs mb-6">
                    <p className="text-rose-700 font-medium text-sm mb-3">{error}</p>
                    <button
                        type="button"
                        onClick={load}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-800 hover:text-rose-900 underline underline-offset-4 cursor-pointer"
                    >
                        <RotateCcw size={14} /> Try again
                    </button>
                </div>
            )}

            {/* EMPTY STATE */}
            {!loading && !error && parents.length === 0 && (
                <EmptyState
                    icon={Users}
                    title="No parents found"
                    description="Get started by adding parent accounts to let them monitor student progress."
                    action={
                        <button
                            type="button"
                            onClick={openAddModal}
                            className="flex items-center justify-center gap-2 bg-navy-900 hover:bg-navy-800 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-all shadow-sm active:scale-[0.98] cursor-pointer"
                        >
                            <Plus size={18} /> Add Parent
                        </button>
                    }
                />
            )}

            {/* TABLE CONTAINER */}
            {!loading && !error && parents.length > 0 && (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-6">
                    <div className="overflow-x-auto custom-scrollbar">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-slate-50/50 border-b border-slate-200">
                            <tr className="text-[11px] font-bold tracking-wider text-slate-500 uppercase">
                                <th className="px-6 py-4">Parent</th>
                                <th className="px-6 py-4">Email</th>
                                <th className="px-6 py-4">Username</th>
                                <th className="px-6 py-4">Occupation</th>
                                <th className="px-6 py-4">Children</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                            {parents.map((p) => {
                                const childrenCount = p.children?.length || 0;
                                return (
                                    <tr
                                        key={p.id}
                                        className="group bg-white hover:bg-slate-50/80 transition-colors"
                                    >
                                        <td className="px-6 py-4 font-semibold text-slate-900 whitespace-nowrap">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200/80 flex items-center justify-center text-xs font-bold text-slate-600 shrink-0">
                                                    {p.firstName?.[0]}
                                                    {p.lastName?.[0]}
                                                </div>
                                                <div>
                                                        <span className="font-semibold text-slate-900 group-hover:text-navy-900 transition-colors">
                                                            {p.firstName} {p.lastName}
                                                        </span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-slate-600 whitespace-nowrap">
                                            {p.email}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="font-mono text-xs text-slate-500 bg-slate-100 border border-slate-200/60 px-2.5 py-1 rounded-md">
                                                    {p.username}
                                                </span>
                                        </td>
                                        <td className="px-6 py-4 text-slate-600 whitespace-nowrap">
                                            {p.occupation || '—'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {childrenCount > 0 ? (
                                                <span className="inline-flex items-center bg-teal-50 text-teal-700 border border-teal-200 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                                                        {childrenCount} linked
                                                    </span>
                                            ) : (
                                                <span className="text-slate-400 text-xs font-medium">None</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right whitespace-nowrap">
                                            <div className="flex items-center justify-end gap-1">
                                                <button
                                                    type="button"
                                                    onClick={() => openEditModal(p)}
                                                    title="Edit Parent"
                                                    className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                                                >
                                                    <Pencil size={16} />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => handleResetPassword(p.id)}
                                                    title="Reset Password"
                                                    className="p-2 rounded-xl text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-colors cursor-pointer"
                                                >
                                                    <KeyRound size={16} />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => handleUnlock(p.id)}
                                                    title="Unlock Account"
                                                    className="p-2 rounded-xl text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors cursor-pointer"
                                                >
                                                    <Unlock size={16} />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setDeleteTarget(p)}
                                                    title="Delete Parent"
                                                    className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* MODALS & DIALOGS */}
            {modalOpen && (
                <ParentModal
                    initialData={editingParent}
                    onClose={() => setModalOpen(false)}
                    onSaved={handleSaved}
                />
            )}

            {resetCredentials && (
                <TempPasswordModal
                    username={resetCredentials.username}
                    temporaryPassword={resetCredentials.temporaryPassword}
                    onClose={() => setResetCredentials(null)}
                />
            )}

            <ConfirmDialog
                open={!!deleteTarget}
                title="Delete parent"
                message={`Are you sure you want to delete ${deleteTarget?.firstName} ${deleteTarget?.lastName}? This action cannot be undone.`}
                confirmLabel="Delete"
                variant="danger"
                onConfirm={handleDelete}
                onCancel={() => setDeleteTarget(null)}
            />
        </div>
    );
}