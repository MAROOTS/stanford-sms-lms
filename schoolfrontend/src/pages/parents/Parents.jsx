import { useEffect, useState, useCallback } from 'react';
import { Plus, Users, Pencil, Trash2, KeyRound, Unlock } from 'lucide-react';
import axiosClient from '../../api/axiosClient';
import ParentModal from './ParentModal';
import ConfirmDialog from '../../components/shared/ConfirmDialog';
import EmptyState from '../../components/shared/EmptyState';
import { TableSkeleton } from '../../components/shared/LoadingSkeleton';
import { useToast } from '../../context/useToast';
import TempPasswordModal from '../../components/shared/TempPasswordModal';

export default function Parents() {
    const [parents, setParents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [modalOpen, setModalOpen] = useState(false);
    const [editingParent, setEditingParent] = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [resetCredentials, setResetCredentials] = useState(null);
    const toast = useToast();

    const load = useCallback(async () => {
        setLoading(true); setError('');
        try {
            const { data } = await axiosClient.get('/parents');
            setParents(data);
        } catch { setError('Could not load parents'); }
        finally { setLoading(false); }
    }, []);

    useEffect(() => { load(); }, [load]);

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

    const handleResetPassword = async (userId) => {
        if (!window.confirm('Generate a new temporary password for this parent?')) return;
        try {
            const { data } = await axiosClient.post(`/admin/users/${userId}/reset-password`);
            setResetCredentials(data);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Could not reset password');
        }
    };

    const handleUnlock = async (userId) => {
        try {
            await axiosClient.post(`/admin/users/${userId}/unlock`);
            toast.success('Account unlocked.');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Could not unlock account');
        }
    };

    const openAddModal = () => { setEditingParent(null); setModalOpen(true); };
    const openEditModal = (parent) => { setEditingParent(parent); setModalOpen(true); };
    const handleSaved = () => { setModalOpen(false); load(); toast.success('Parent saved successfully.'); };

    return (
        <div>
            <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Parents</h1>
                    <p className="text-sm text-slate-500 mt-1">Manage parent accounts and link them to students.</p>
                </div>
                <button onClick={openAddModal}
                        className="flex items-center gap-1.5 bg-navy-900 hover:bg-navy-800 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors">
                    <Plus size={16} /> Add parent
                </button>
            </div>

            {loading && <TableSkeleton columns={4} rows={5} />}

            {error && !loading && (
                <div className="bg-red-50 border border-red-100 rounded-xl p-6 text-center">
                    <p className="text-red-600 text-sm mb-3">{error}</p>
                    <button onClick={load} className="text-sm font-medium text-red-700 hover:text-red-800 underline">Try again</button>
                </div>
            )}

            {!loading && !error && parents.length === 0 && (
                <EmptyState
                    icon={Users}
                    title="No parents yet"
                    description="Add parent accounts to let them monitor their children's progress."
                    action={
                        <button onClick={openAddModal}
                                className="flex items-center gap-1.5 bg-navy-900 hover:bg-navy-800 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors">
                            <Plus size={16} /> Add parent
                        </button>
                    }
                />
            )}

            {!loading && !error && parents.length > 0 && (
                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                            <tr className="border-b border-slate-100 text-left text-[11px] font-semibold tracking-wider text-slate-400">
                                <th className="px-6 py-3">PARENT</th>
                                <th className="px-6 py-3">EMAIL</th>
                                <th className="px-6 py-3">USERNAME</th>
                                <th className="px-6 py-3">OCCUPATION</th>
                                <th className="px-6 py-3">CHILDREN</th>
                                <th className="px-6 py-3 text-right">ACTIONS</th>
                            </tr>
                            </thead>
                            <tbody>
                            {parents.map((p) => (
                                <tr key={p.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-semibold text-slate-600">
                                                {p.firstName?.[0]}{p.lastName?.[0]}
                                            </div>
                                            <span className="font-medium text-slate-800">{p.firstName} {p.lastName}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-slate-600">{p.email}</td>
                                    <td className="px-6 py-4">
                                        <span className="font-mono text-xs text-slate-500">{p.username}</span>
                                    </td>
                                    <td className="px-6 py-4 text-slate-600">{p.occupation || '—'}</td>
                                    <td className="px-6 py-4">
                                        {p.children && p.children.length > 0
                                            ? <span className="inline-block bg-teal-accent/10 text-teal-700 text-xs font-medium px-2 py-0.5 rounded-full">{p.children.length} linked</span>
                                            : <span className="text-slate-400 text-xs">None</span>}
                                    </td>
                                    <td className="px-6 py-4 text-right whitespace-nowrap">
                                        <div className="flex items-center justify-end gap-1">
                                            <button onClick={() => openEditModal(p)} title="Edit" className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-surface-100 transition-colors">
                                                <Pencil size={16} />
                                            </button>
                                            <button onClick={() => handleResetPassword(p.id)} title="Reset password" className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-surface-100 transition-colors">
                                                <KeyRound size={16} />
                                            </button>
                                            <button onClick={() => handleUnlock(p.id)} title="Unlock account" className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-surface-100 transition-colors">
                                                <Unlock size={16} />
                                            </button>
                                            <button onClick={() => setDeleteTarget(p)} title="Delete" className="p-2 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 transition-colors">
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