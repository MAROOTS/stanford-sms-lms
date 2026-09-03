import { useEffect, useState, useCallback } from 'react';
import {
    Plus,
    BookOpen,
    Trash2,
    AlertTriangle,
    ChevronDown
} from 'lucide-react';
import axiosClient from '../../api/axiosClient';
import ConfirmDialog from '../../components/shared/ConfirmDialog';
import EmptyState from '../../components/shared/EmptyState';
import { TableSkeleton } from '../../components/shared/LoadingSkeleton';
import { useToast } from '../../context/useToast';

export default function TeachingAssignments() {
    const [rows, setRows] = useState([]);
    const [teachers, setTeachers] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [classes, setClasses] = useState([]);
    const [teacherId, setTeacherId] = useState('');
    const [subjectId, setSubjectId] = useState('');
    const [classSectionId, setClassSectionId] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [deleteTarget, setDeleteTarget] = useState(null);
    const toast = useToast();

    const loadAll = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const [a, t, s, c] = await Promise.all([
                axiosClient.get('/teaching-assignments'),
                axiosClient.get('/teachers'),
                axiosClient.get('/subjects'),
                axiosClient.get('/class-sections'),
            ]);
            setRows(a.data);
            setTeachers(t.data);
            setSubjects(s.data);
            setClasses(c.data);
        } catch {
            setError('Could not load teaching assignments');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { queueMicrotask(() => loadAll()); }, [loadAll]);

    const handleAdd = async (e) => {
        e.preventDefault();
        if (!teacherId || !subjectId || !classSectionId) return;
        setSaving(true);
        setError('');
        try {
            await axiosClient.post('/teaching-assignments', {
                teacherId: Number(teacherId),
                subjectId: Number(subjectId),
                classSectionId: Number(classSectionId),
            });
            setTeacherId('');
            setSubjectId('');
            setClassSectionId('');
            toast.success('Assignment saved');
            await loadAll();
        } catch (err) {
            setError(err.response?.data?.message || 'Could not save — that class may already have a teacher for this subject');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteTarget) return;
        const id = deleteTarget.id;
        setDeleteTarget(null);
        try {
            await axiosClient.delete(`/teaching-assignments/${id}`);
            setRows((prev) => prev.filter((r) => r.id !== id));
            toast.success('Assignment removed');
        } catch {
            toast.error('Could not delete assignment');
        }
    };

    const handleChangeTeacher = async (id, newTeacherId) => {
        try {
            const { data } = await axiosClient.put(`/teaching-assignments/${id}`, { teacherId: newTeacherId });
            setRows((prev) => prev.map((row) => (row.id === id ? data : row)));
            toast.success('Teacher updated');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Could not change teacher');
        }
    };

    return (
        <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 animate-in fade-in duration-500">
            {/* HEADER */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">Teaching Assignments</h1>
                <p className="text-sm text-slate-500 mt-1.5">
                    Manage who teaches which subject to which class. This controls who can enter marks.
                </p>
            </div>

            {/* ERROR ALERT */}
            {error && (
                <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700 shadow-sm animate-in fade-in">
                    <AlertTriangle size={20} className="shrink-0 mt-0.5" />
                    <div>
                        <h4 className="font-semibold text-sm">Action Failed</h4>
                        <p className="text-sm mt-1 opacity-90">{error}</p>
                    </div>
                </div>
            )}

            {/* ASSIGNMENT FORM */}
            <form
                onSubmit={handleAdd}
                className="bg-white rounded-2xl border border-slate-200 p-6 mb-8 shadow-sm flex flex-col md:flex-row gap-4 items-end"
            >
                <div className="w-full flex-1">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Teacher</label>
                    <div className="relative">
                        <select
                            value={teacherId}
                            onChange={(e) => setTeacherId(e.target.value)}
                            className="w-full appearance-none px-4 py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-navy-900 focus:border-transparent text-sm font-medium text-slate-700 transition-all cursor-pointer"
                        >
                            <option value="">Select a teacher...</option>
                            {teachers.map((t) => (
                                <option key={t.id} value={t.id}>{t.firstName} {t.lastName}</option>
                            ))}
                        </select>
                        <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>
                </div>

                <div className="w-full flex-1">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Subject</label>
                    <div className="relative">
                        <select
                            value={subjectId}
                            onChange={(e) => setSubjectId(e.target.value)}
                            className="w-full appearance-none px-4 py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-navy-900 focus:border-transparent text-sm font-medium text-slate-700 transition-all cursor-pointer"
                        >
                            <option value="">Select a subject...</option>
                            {subjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>
                        <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>
                </div>

                <div className="w-full flex-1">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Class</label>
                    <div className="relative">
                        <select
                            value={classSectionId}
                            onChange={(e) => setClassSectionId(e.target.value)}
                            className="w-full appearance-none px-4 py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-navy-900 focus:border-transparent text-sm font-medium text-slate-700 transition-all cursor-pointer"
                        >
                            <option value="">Select a class...</option>
                            {classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                        <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={saving || !teacherId || !subjectId || !classSectionId}
                    className="w-full md:w-auto h-11 flex items-center justify-center gap-2 bg-navy-900 hover:bg-navy-800 text-white shadow-sm text-sm font-semibold px-6 py-2.5 rounded-xl transition-all active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
                >
                    <Plus size={18} /> {saving ? 'Assigning...' : 'Assign'}
                </button>
            </form>

            {/* CONTENT AREA */}
            {loading && <TableSkeleton columns={4} rows={5} />}

            {!loading && rows.length === 0 && (
                <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
                    <EmptyState
                        icon={BookOpen}
                        title="No assignments yet"
                        description="Assign a teacher to a subject and class above to allow them to enter marks."
                    />
                </div>
            )}

            {!loading && rows.length > 0 && (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto custom-scrollbar">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-slate-50 border-b border-slate-200">
                            <tr className="text-[11px] font-bold tracking-wider text-slate-500 uppercase">
                                <th className="px-6 py-4 w-1/3">Teacher</th>
                                <th className="px-6 py-4 w-1/4">Subject</th>
                                <th className="px-6 py-4 w-1/4">Class</th>
                                <th className="px-6 py-4 text-right w-32">Action</th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                            {rows.map((r) => (
                                <tr
                                    key={r.id}
                                    className="group bg-white hover:bg-slate-50/80 transition-colors"
                                >
                                    <td className="px-6 py-3 relative">
                                        <div className="relative inline-block w-full max-w-[240px]">
                                            <select
                                                value={r.teacherId}
                                                onChange={(e) => handleChangeTeacher(r.id, Number(e.target.value))}
                                                className="w-full appearance-none pl-3 pr-8 py-2 rounded-lg bg-transparent hover:bg-white border border-gray-300 hover:border-slate-200 focus:bg-white focus:border-navy-900 focus:ring-1 focus:ring-navy-900 focus:outline-none text-sm font-semibold text-slate-900 transition-all cursor-pointer"
                                            >
                                                {teachers.map((t) => (
                                                    <option key={t.id} value={t.id}>{t.firstName} {t.lastName}</option>
                                                ))}
                                            </select>
                                            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </div>
                                    </td>
                                    <td className="px-6 py-3">
                                        <span className="font-medium text-slate-700">{r.subjectName}</span>
                                    </td>
                                    <td className="px-6 py-3">
                                            <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-600 text-xs font-semibold">
                                                {r.classSectionName}
                                            </span>
                                    </td>
                                    <td className="px-6 py-3 text-right">
                                        <button
                                            onClick={() => setDeleteTarget(r)}
                                            title="Remove Assignment"
                                            className="p-2 rounded-lg text-slate-400 opacity-60 group-hover:opacity-100 hover:text-red-600 hover:bg-red-50 transition-all"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* CONFIRMATION DIALOG */}
            <ConfirmDialog
                open={!!deleteTarget}
                title="Remove Assignment"
                message={
                    deleteTarget ? (
                        <>
                            Are you sure you want to remove <strong className="text-slate-900">{deleteTarget.teacherName}</strong>'s assignment for <strong className="text-slate-900">{deleteTarget.subjectName} / {deleteTarget.classSectionName}</strong>?
                        </>
                    ) : ''
                }
                confirmLabel="Remove"
                variant="danger"
                onConfirm={handleDelete}
                onCancel={() => setDeleteTarget(null)}
            />
        </div>
    );
}