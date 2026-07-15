import { useEffect, useState, useCallback } from 'react';
import { Plus, ClipboardList, Eye, Pencil, Trash2 } from 'lucide-react';
import axiosClient from '../../api/axiosClient';
import ExamModal from './ExamModal';
import ConfirmDialog from '../../components/shared/ConfirmDialog';
import EmptyState from '../../components/shared/EmptyState';
import { TableSkeleton } from '../../components/shared/LoadingSkeleton';
import { useToast } from '../../context/useToast';

export default function Exams() {
    const [exams, setExams] = useState([]);
    const [terms, setTerms] = useState([]);
    const [classSections, setClassSections] = useState([]);
    const [subjects, setSubjects] = useState([]);
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
            const [examsRes, termsRes, sectionsRes, subjectsRes] = await Promise.all([
                axiosClient.get('/exams'),
                axiosClient.get('/terms'),
                axiosClient.get('/class-sections'),
                axiosClient.get('/subjects'),
            ]);
            setExams(examsRes.data);
            setTerms(termsRes.data);
            setClassSections(sectionsRes.data);
            setSubjects(subjectsRes.data);
        } catch { setError('Could not load exams'); }
        finally { setLoading(false); }
    }, []);

    useEffect(() => { load(); }, [load]);

    const handleDelete = async () => {
        if (!deleteTarget) return;
        const id = deleteTarget.id;
        const name = deleteTarget.name;
        setDeleteTarget(null);
        try {
            await axiosClient.delete(`/exams/${id}`);
            setExams((prev) => prev.filter((e) => e.id !== id));
            toast.success(`${name} has been deleted. Any marks will remain.`);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Could not delete this exam.');
        }
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Examinations</h1>
                    <p className="text-sm text-slate-500 mt-1">Exams scheduled per term, with the classes and subjects they cover.</p>
                </div>
                <button onClick={() => { setEditing(null); setViewing(null); setModalOpen(true); }}
                        className="flex items-center gap-1.5 bg-navy-900 hover:bg-navy-800 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors">
                    <Plus size={16} /> Add exam
                </button>
            </div>

            {loading && <TableSkeleton columns={6} rows={4} />}

            {error && !loading && (
                <div className="bg-red-50 border border-red-100 rounded-xl p-6 text-center">
                    <p className="text-red-600 text-sm mb-3">{error}</p>
                    <button onClick={load} className="text-sm font-medium text-red-700 hover:text-red-800 underline">Try again</button>
                </div>
            )}

            {!loading && !error && exams.length === 0 && (
                <EmptyState
                    icon={ClipboardList}
                    title="No exams yet"
                    description="Schedule your first exam by selecting a term, classes, and subjects."
                    action={
                        <button onClick={() => { setEditing(null); setModalOpen(true); }}
                                className="flex items-center gap-1.5 bg-navy-900 hover:bg-navy-800 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors">
                            <Plus size={16} /> Add exam
                        </button>
                    }
                />
            )}

            {!loading && !error && exams.length > 0 && (
                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                            <tr className="border-b border-slate-100 text-left text-[11px] font-semibold tracking-wider text-slate-400">
                                <th className="px-6 py-3">EXAM</th>
                                <th className="px-6 py-3">TYPE</th>
                                <th className="px-6 py-3">TERM</th>
                                <th className="px-6 py-3">CLASSES</th>
                                <th className="px-6 py-3">SUBJECTS</th>
                                <th className="px-6 py-3 text-right">ACTIONS</th>
                            </tr>
                            </thead>
                            <tbody>
                            {exams.map((e) => (
                                <tr key={e.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-slate-800">{e.name}</td>
                                    <td className="px-6 py-4">
                                        <span className="inline-block bg-slate-100 text-slate-600 text-xs font-medium px-2.5 py-1 rounded-full">{e.examType}</span>
                                    </td>
                                    <td className="px-6 py-4 text-slate-600">{e.termName}</td>
                                    <td className="px-6 py-4 text-slate-600">{e.classSections.length}</td>
                                    <td className="px-6 py-4 text-slate-600">{e.subjects.length}</td>
                                    <td className="px-6 py-4 text-right whitespace-nowrap">
                                        <div className="flex items-center justify-end gap-1">
                                            <button onClick={() => { setViewing(e); setEditing(null); setModalOpen(true); }} title="View" className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-surface-100 transition-colors">
                                                <Eye size={16} />
                                            </button>
                                            <button onClick={() => { setEditing(e); setViewing(null); setModalOpen(true); }} title="Edit" className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-surface-100 transition-colors">
                                                <Pencil size={16} />
                                            </button>
                                            <button onClick={() => setDeleteTarget(e)} title="Delete" className="p-2 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 transition-colors">
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
                <ExamModal
                    initialData={editing || viewing}
                    terms={terms}
                    classSections={classSections}
                    subjects={subjects}
                    readOnly={!!viewing}
                    onClose={() => setModalOpen(false)}
                    onSaved={() => { setModalOpen(false); load(); toast.success('Exam saved successfully.'); }}
                />
            )}

            <ConfirmDialog
                open={!!deleteTarget}
                title="Delete exam"
                message={`Are you sure you want to delete "${deleteTarget?.name}"? Any marks recorded against it will remain but become orphaned.`}
                confirmLabel="Delete"
                variant="danger"
                onConfirm={handleDelete}
                onCancel={() => setDeleteTarget(null)}
            />
        </div>
    );
}
