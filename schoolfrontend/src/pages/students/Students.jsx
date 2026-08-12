import { useEffect, useState, useCallback } from 'react';
import {Users, Eye, Pencil, Trash2, Unlock, KeyRound} from 'lucide-react';
import axiosClient from '../../api/axiosClient';
import StudentModal from './StudentModal';
import ConfirmDialog from '../../components/shared/ConfirmDialog';
import EmptyState from '../../components/shared/EmptyState';
import { TableSkeleton } from '../../components/shared/LoadingSkeleton';
import { useToast } from '../../context/useToast';
import {useAuth} from "../../context/useAuth.js";
import TempPasswordModal from "../../components/shared/TempPasswordModal";
import {useAccountActions} from "../../hooks/useAccountActions";

export default function Students() {
    const [students, setStudents] = useState([]);
    const [classSections, setClassSections] = useState([]);
    const [classFilter, setClassFilter] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [modalOpen, setModalOpen] = useState(false);
    const [editingStudent, setEditingStudent] = useState(null);
    const [viewingStudent, setViewingStudent] = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null);

    const toast = useToast();
    const {user} = useAuth();
    const loadAll = useCallback(async (currentClassFilter) => {
        setLoading(true);
        setError('');
        try {
            const [studentsRes, sectionsRes] = await Promise.all([
                axiosClient.get('/students', {
                    params: currentClassFilter ? { classSectionId: currentClassFilter } : {},
                }),
                axiosClient.get('/class-sections'),
            ]);
            setStudents(studentsRes.data);
            setClassSections(sectionsRes.data);
        } catch {
            setError('Could not load students');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {queueMicrotask(() => loadAll(classFilter)); }, [classFilter, loadAll]);

    const handleDelete = async () => {
        if (!deleteTarget) return;
        const id = deleteTarget.id;
        const name = `${deleteTarget.firstName} ${deleteTarget.lastName}`;
        setDeleteTarget(null);
        try {
            await axiosClient.delete(`/students/${id}`);
            setStudents((prev) => prev.filter((s) => s.id !== id));
            toast.success(`${name} has been deleted.`);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Could not delete this student.');
        }
    };

    const { resetCredentials, setResetCredentials, handleResetPassword, handleUnlock } =
        useAccountActions(toast, { entityLabel: 'student' });

    const openEditModal = (student) => { setEditingStudent(student); setViewingStudent(null); setModalOpen(true); };
    const openViewModal = (student) => { setViewingStudent(student); setEditingStudent(null); setModalOpen(true); };
    const handleSaved = () => { setModalOpen(false); loadAll(classFilter); toast.success('Student saved successfully.'); };

    return (
        <div>
            <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Students</h1>
                    <p className="text-sm text-slate-500 mt-1">
                        {classFilter
                            ? `Showing students in ${classSections.find((c) => c.id === Number(classFilter))?.name || 'selected class'}.`
                            : 'All students enrolled at your school.'}
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <select
                        value={classFilter}
                        onChange={(e) => setClassFilter(e.target.value)}
                        className="px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm font-medium text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-teal-accent"
                    >
                        <option value="">All classes</option>
                        {classSections.map((c) => (
                            <option key={c.id} value={c.id}>{c.name} ({c.gradeLevelName})</option>
                        ))}
                    </select>

                </div>
            </div>

            {loading && <TableSkeleton columns={4} rows={6} />}

            {error && !loading && (
                <div className="bg-red-50 border border-red-100 rounded-xl p-6 text-center">
                    <p className="text-red-600 text-sm mb-3">{error}</p>
                    <button onClick={() => loadAll(classFilter)} className="text-sm font-medium text-red-700 hover:text-red-800 underline">Try again</button>
                </div>
            )}

            {!loading && !error && students.length === 0 && (
                <EmptyState
                    icon={Users}
                    title={classFilter ? 'No students in this class' : 'No students yet'}
                    description={
                        classFilter
                            ? 'Try selecting a different class, or clear the filter.'
                            : user?.role === 'ADMIN'
                                ? 'Add your first student to get started.'
                                : "You don't have any students in your homeroom class yet."
                    }

                />
            )}

            {!loading && !error && students.length > 0 && (
                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                            <tr className="border-b border-slate-100 text-left text-[11px] font-semibold tracking-wider text-slate-400">
                                <th className="px-6 py-3">STUDENT</th>
                                <th className="px-6 py-3">EMAIL</th>
                                <th className="px-6 py-3">CLASS</th>
                                <th className="px-6 py-3 text-right">ACTIONS</th>
                            </tr>
                            </thead>
                            <tbody>
                            {students.map((s) => (
                                <tr key={s.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-semibold text-slate-600">
                                                {s.firstName?.[0]}{s.lastName?.[0]}
                                            </div>
                                            <span className="font-medium text-slate-800">{s.firstName} {s.lastName}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-slate-600">{s.email}</td>
                                    <td className="px-6 py-4">
                                        {s.classSectionName
                                            ? <span className="inline-block bg-teal-accent/10 text-teal-700 text-xs font-medium px-2.5 py-1 rounded-full">{s.classSectionName}</span>
                                            : <span className="text-slate-400 text-xs">Unassigned</span>}
                                    </td>
                                    <td className="px-6 py-4 text-right whitespace-nowrap">
                                        <div className="flex items-center justify-end gap-1">
                                            <button onClick={() => openViewModal(s)} title="View" className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-surface-100 transition-colors">
                                                <Eye size={16} />
                                            </button>
                                            {user?.role === 'ADMIN' && (
                                                <>
                                                    <button onClick={() => handleResetPassword(s.id)} title="Reset password" className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-surface-100 transition-colors">
                                                        <KeyRound size={16} />
                                                    </button>
                                                    <button onClick={() => handleUnlock(s.id)} title="Unlock account" className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-surface-100 transition-colors">
                                                        <Unlock size={16} />
                                                    </button>
                                                    <button onClick={() => openEditModal(s)} title="Edit" className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-surface-100 transition-colors">
                                                        <Pencil size={16} />
                                                    </button>
                                                    <button onClick={() => setDeleteTarget(s)} title="Delete" className="p-2 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 transition-colors">
                                                        <Trash2 size={16} />
                                                    </button>
                                                </>
                                            )}
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
                <StudentModal
                    initialData={editingStudent || viewingStudent}
                    classSections={classSections}
                    readOnly={!!viewingStudent}
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
                title="Delete student"
                message={`Are you sure you want to delete ${deleteTarget?.firstName} ${deleteTarget?.lastName}? This action cannot be undone.`}
                confirmLabel="Delete"
                variant="danger"
                onConfirm={handleDelete}
                onCancel={() => setDeleteTarget(null)}
            />
        </div>
    );
}