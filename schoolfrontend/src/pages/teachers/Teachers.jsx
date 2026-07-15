import { useEffect, useState, useCallback } from 'react';
import { Plus, GraduationCap, Eye, Pencil, Trash2 } from 'lucide-react';
import axiosClient from '../../api/axiosClient';
import TeacherModal from './TeacherModal';
import ConfirmDialog from '../../components/shared/ConfirmDialog';
import EmptyState from '../../components/shared/EmptyState';
import { TableSkeleton } from '../../components/shared/LoadingSkeleton';
import { useToast } from '../../context/useToast';

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

    useEffect(() => { loadAll(); }, [loadAll]);

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

    const openAddModal = () => { setEditingTeacher(null); setViewingTeacher(null); setModalOpen(true); };
    const openEditModal = (teacher) => { setEditingTeacher(teacher); setViewingTeacher(null); setModalOpen(true); };
    const openViewModal = (teacher) => { setViewingTeacher(teacher); setEditingTeacher(null); setModalOpen(true); };
    const handleSaved = () => { setModalOpen(false); loadAll(); toast.success('Teacher saved successfully.'); };

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Teachers</h1>
                    <p className="text-sm text-slate-500 mt-1">All teaching staff at your school.</p>
                </div>
                <button
                    onClick={openAddModal}
                    className="flex items-center gap-1.5 bg-navy-900 hover:bg-navy-800 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors"
                >
                    <Plus size={16} /> Add teacher
                </button>
            </div>

            {loading && <TableSkeleton columns={3} rows={5} />}

            {error && !loading && (
                <div className="bg-red-50 border border-red-100 rounded-xl p-6 text-center">
                    <p className="text-red-600 text-sm mb-3">{error}</p>
                    <button onClick={loadAll} className="text-sm font-medium text-red-700 hover:text-red-800 underline">Try again</button>
                </div>
            )}

            {!loading && !error && teachers.length === 0 && (
                <EmptyState
                    icon={GraduationCap}
                    title="No teachers yet"
                    description="Add your first teacher to get started."
                    action={
                        <button onClick={openAddModal}
                                className="flex items-center gap-1.5 bg-navy-900 hover:bg-navy-800 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors">
                            <Plus size={16} /> Add teacher
                        </button>
                    }
                />
            )}

            {!loading && !error && teachers.length > 0 && (
                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                            <tr className="border-b border-slate-100 text-left text-[11px] font-semibold tracking-wider text-slate-400">
                                <th className="px-6 py-3">TEACHER</th>
                                <th className="px-6 py-3">EMAIL</th>
                                <th className="px-6 py-3 text-right">ACTIONS</th>
                            </tr>
                            </thead>
                            <tbody>
                            {teachers.map((t) => (
                                <tr key={t.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-teal-accent/15 flex items-center justify-center text-xs font-semibold text-teal-700">
                                                {t.firstName?.[0]}{t.lastName?.[0]}
                                            </div>
                                            <span className="font-medium text-slate-800">{t.firstName} {t.lastName}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-slate-600">{t.email}</td>
                                    <td className="px-6 py-4 text-right whitespace-nowrap">
                                        <div className="flex items-center justify-end gap-1">
                                            <button onClick={() => openViewModal(t)} title="View" className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-surface-100 transition-colors">
                                                <Eye size={16} />
                                            </button>
                                            <button onClick={() => openEditModal(t)} title="Edit" className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-surface-100 transition-colors">
                                                <Pencil size={16} />
                                            </button>
                                            <button onClick={() => setDeleteTarget(t)} title="Delete" className="p-2 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 transition-colors">
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
                <TeacherModal
                    initialData={editingTeacher || viewingTeacher}
                    readOnly={!!viewingTeacher}
                    onClose={() => setModalOpen(false)}
                    onSaved={handleSaved}
                />
            )}

            <ConfirmDialog
                open={!!deleteTarget}
                title="Delete teacher"
                message={`Are you sure you want to delete ${deleteTarget?.firstName} ${deleteTarget?.lastName}? This action cannot be undone.`}
                confirmLabel="Delete"
                variant="danger"
                onConfirm={handleDelete}
                onCancel={() => setDeleteTarget(null)}
            />
        </div>
    );
}
