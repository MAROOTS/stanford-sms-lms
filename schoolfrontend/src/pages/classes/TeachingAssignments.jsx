import { useEffect, useState, useCallback } from 'react';
import { Plus, BookOpen, Trash2 } from 'lucide-react';
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

    return (
        <div>
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-slate-900">Teaching assignments</h1>
                <p className="text-sm text-slate-500 mt-1">Who teaches which subject to which class. This controls who can enter marks.</p>
            </div>

            <form onSubmit={handleAdd} className="bg-white rounded-xl border border-slate-200 p-5 mb-6 grid grid-cols-1 sm:grid-cols-4 gap-4">
                <select value={teacherId} onChange={(e) => setTeacherId(e.target.value)}
                        className="px-3 py-2.5 rounded-lg bg-slate-50 border border-slate-200 text-sm">
                    <option value="">Teacher...</option>
                    {teachers.map((t) => (
                        <option key={t.id} value={t.id}>{t.firstName} {t.lastName}</option>
                    ))}
                </select>
                <select value={subjectId} onChange={(e) => setSubjectId(e.target.value)}
                        className="px-3 py-2.5 rounded-lg bg-slate-50 border border-slate-200 text-sm">
                    <option value="">Subject...</option>
                    {subjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
                <select value={classSectionId} onChange={(e) => setClassSectionId(e.target.value)}
                        className="px-3 py-2.5 rounded-lg bg-slate-50 border border-slate-200 text-sm">
                    <option value="">Class...</option>
                    {classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                <button type="submit" disabled={saving}
                        className="flex items-center justify-center gap-1.5 bg-navy-900 hover:bg-navy-800 text-white text-sm font-medium px-4 py-2.5 rounded-lg disabled:opacity-60">
                    <Plus size={16} /> {saving ? 'Saving...' : 'Assign'}
                </button>
            </form>

            {error && <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2 mb-4">{error}</p>}
            {loading && <TableSkeleton columns={4} rows={5} />}

            {!loading && rows.length === 0 && (
                <EmptyState icon={BookOpen} title="No assignments yet"
                            description="Assign a teacher to a subject and class so they can enter marks." />
            )}

            {!loading && rows.length > 0 && (
                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                    <table className="w-full text-sm">
                        <thead>
                        <tr className="border-b border-slate-100 text-left text-[11px] font-semibold tracking-wider text-slate-400">
                            <th className="px-6 py-3">TEACHER</th>
                            <th className="px-6 py-3">SUBJECT</th>
                            <th className="px-6 py-3">CLASS</th>
                            <th className="px-6 py-3" />
                        </tr>
                        </thead>
                        <tbody>
                        {rows.map((r) => (
                            <tr key={r.id} className="border-b border-slate-50 last:border-0">
                                <td className="px-6 py-3 font-medium text-slate-800">{r.teacherName}</td>
                                <td className="px-6 py-3 text-slate-600">{r.subjectName}</td>
                                <td className="px-6 py-3 text-slate-600">{r.classSectionName}</td>
                                <td className="px-6 py-3 text-right">
                                    <button onClick={() => setDeleteTarget(r)} className="text-slate-400 hover:text-red-600">
                                        <Trash2 size={16} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            )}

            <ConfirmDialog
                open={!!deleteTarget}
                title="Remove assignment?"
                message={deleteTarget ? `Remove ${deleteTarget.teacherName} from ${deleteTarget.subjectName} / ${deleteTarget.classSectionName}?` : ''}
                onConfirm={handleDelete}
                onCancel={() => setDeleteTarget(null)}
            />
        </div>
    );
}