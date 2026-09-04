import { useEffect, useState, useCallback } from 'react';
import {
    Plus,
    GraduationCap,
    Eye,
    Pencil,
    Trash2,
    Unlock,
    KeyRound,
    UserX
} from 'lucide-react';
import axiosClient from '../../api/axiosClient';
import TeacherModal from './TeacherModal';
import ConfirmDialog from '../../components/shared/ConfirmDialog';
import EmptyState from '../../components/shared/EmptyState';
import { TableSkeleton } from '../../components/shared/LoadingSkeleton';
import { useToast } from '../../context/useToast';
import TempPasswordModal from "../../components/shared/TempPasswordModal";
import { useAccountActions } from '../../hooks/useAccountActions';

const getAvatarStyle = (name) => {
    const colors = [
        'bg-blue-100 text-blue-700', 'bg-emerald-100 text-emerald-700',
        'bg-violet-100 text-violet-700', 'bg-amber-100 text-amber-700',
        'bg-pink-100 text-pink-700', 'bg-rose-100 text-rose-700',
        'bg-indigo-100 text-indigo-700', 'bg-cyan-100 text-cyan-700'
    ];
    if (!name) return colors[0];
    const charCode = name.charCodeAt(0);
    return colors[charCode % colors.length];
};

export default function Teachers() {
    const [teachers, setTeachers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [modalOpen, setModalOpen] = useState(false);
    const [editingTeacher, setEditingTeacher] = useState(null);
    const [viewingTeacher, setViewingTeacher] = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const toast = useToast();

    const loadAll = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const { data } = await axiosClient.get('/teachers');
            setTeachers(data);
        } catch {
            setError('Could not load teachers');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { queueMicrotask(() => loadAll()); }, [loadAll]);

    const handleDelete = async () => {
        if (!deleteTarget) return;
        const id = deleteTarget.id;
        const name = `${deleteTarget.firstName} ${deleteTarget.lastName}`;
        setDeleteTarget(null);
        try {
            await axiosClient.delete(`/teachers/${id}`);
            setTeachers((prev) => prev.filter((t) => t.id !== id));
            toast.success(`${name} has been deleted.`);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Could not delete this teacher.');
        }
    };

    const { resetCredentials, setResetCredentials, handleResetPassword, handleUnlock } =
        useAccountActions(toast, { entityLabel: 'teacher' });

    const openAddModal = () => { setEditingTeacher(null); setViewingTeacher(null); setModalOpen(true); };
    const openEditModal = (teacher) => { setEditingTeacher(teacher); setViewingTeacher(null); setModalOpen(true); };
    const openViewModal = (teacher) => { setViewingTeacher(teacher); setEditingTeacher(null); setModalOpen(true); };
    const handleSaved = () => { setModalOpen(false); loadAll(); toast.success('Teacher saved successfully.'); };

    return (
        <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 animate-in fade-in duration-500">
            {/* HEADER SECTION */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">Teachers</h1>
                    <p className="text-sm text-slate-500 mt-1.5">Manage all teaching staff at your school.</p>
                </div>
                <button
                    onClick={openAddModal}
                    className="flex items-center gap-2 bg-navy-900 hover:bg-navy-800 text-white shadow-sm text-sm font-semibold px-4 py-2.5 rounded-xl transition-all active:scale-[0.98]"
                >
                    <Plus size={16} /> Add Teacher
                </button>
            </div>

            {/* CONTENT AREA */}
            {loading && <TableSkeleton columns={3} rows={5} />}

            {error && !loading && (
                <div className="bg-red-50 border border-red-100 rounded-2xl p-8 text-center animate-in zoom-in-95">
                    <UserX size={40} className="mx-auto text-red-400 mb-3" />
                    <p className="text-red-700 font-medium mb-3">{error}</p>
                    <button
                        onClick={loadAll}
                        className="text-sm font-bold text-red-700 hover:text-red-900 bg-red-100/50 hover:bg-red-100 px-4 py-2 rounded-lg transition-colors"
                    >
                        Try again
                    </button>
                </div>
            )}

            {!loading && !error && teachers.length === 0 && (
                <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
                    <EmptyState
                        icon={GraduationCap}
                        title="No teachers yet"
                        description="Add your first teacher to get started building your faculty roster."
                        action={
                            <button
                                onClick={openAddModal}
                                className="flex items-center gap-2 bg-navy-900 hover:bg-navy-800 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-all active:scale-[0.98]"
                            >
                                <Plus size={16} /> Add Teacher
                            </button>
                        }
                    />
                </div>
            )}

            {!loading && !error && teachers.length > 0 && (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto custom-scrollbar">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-slate-50 border-b border-slate-200">
                            <tr className="text-[11px] font-bold tracking-wider text-slate-500 uppercase">
                                <th className="px-6 py-4">Teacher</th>
                                <th className="px-6 py-4">Email</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                            {teachers.map((t) => (
                                <tr
                                    key={t.id}
                                    className="group bg-white hover:bg-slate-50/80 transition-colors"
                                >
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shadow-sm border border-black/5 ${getAvatarStyle(t.firstName)}`}>
                                                {t.firstName?.[0]}{t.lastName?.[0]}
                                            </div>
                                            <span className="font-semibold text-slate-900">
                                                    {t.firstName} {t.lastName}
                                                </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                            <span className="text-slate-600 font-medium">
                                                {t.email || <span className="text-slate-400 italic font-normal">No email</span>}
                                            </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-1.5 opacity-60 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => openViewModal(t)}
                                                title="View Profile"
                                                className="p-2 rounded-lg text-slate-400 hover:text-navy-600 hover:bg-navy-50 transition-colors"
                                            >
                                                <Eye size={18} />
                                            </button>
                                            <div className="w-px h-4 bg-slate-200 mx-1"></div>
                                            <button
                                                onClick={() => handleResetPassword(t.id)}
                                                title="Reset Password"
                                                className="p-2 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                                            >
                                                <KeyRound size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleUnlock(t.id)}
                                                title="Unlock Account"
                                                className="p-2 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                                            >
                                                <Unlock size={18} />
                                            </button>
                                            <button
                                                onClick={() => openEditModal(t)}
                                                title="Edit Teacher"
                                                className="p-2 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                                            >
                                                <Pencil size={18} />
                                            </button>
                                            <button
                                                onClick={() => setDeleteTarget(t)}
                                                title="Delete Teacher"
                                                className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                                            >
                                                <Trash2 size={18} />
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

            {/* MODALS & DIALOGS */}
            {modalOpen && (
                <TeacherModal
                    initialData={editingTeacher || viewingTeacher}
                    readOnly={!!viewingTeacher}
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
                title="Delete Teacher"
                message={
                    <>
                        Are you sure you want to delete <strong className="text-slate-900">{deleteTarget?.firstName} {deleteTarget?.lastName}</strong>?
                        This action cannot be undone and will remove all their associated data.
                    </>
                }
                confirmLabel="Delete Teacher"
                variant="danger"
                onConfirm={handleDelete}
                onCancel={() => setDeleteTarget(null)}
            />
        </div>
    );
}