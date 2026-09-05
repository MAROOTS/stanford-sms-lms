import { useEffect, useState, useCallback } from 'react';
import { Plus, ClipboardList, Eye, Pencil, Trash2, Calendar, FileText } from 'lucide-react';
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

    useEffect(() => { queueMicrotask(() => load()); }, [load]);

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
        <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 animate-in fade-in duration-500">
            {/* HEADER & CONTROLS */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">Examinations</h1>
                    <p className="text-sm text-slate-500 mt-1.5">Manage scheduled exams per term, tracking assigned classes and subjects.</p>
                </div>
                <button
                    onClick={() => { setEditing(null); setViewing(null); setModalOpen(true); }}
                    className="flex items-center justify-center gap-2 bg-navy-900 hover:bg-navy-800 text-white shadow-sm text-sm font-semibold px-5 py-2.5 rounded-xl transition-all active:scale-[0.98]"
                >
                    <Plus size={18} /> Add Exam
                </button>
            </div>

            {/* LOADING STATE */}
            {loading && <TableSkeleton columns={6} rows={4} />}

            {/* ERROR STATE */}
            {error && !loading && (
                <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 text-center shadow-sm">
                    <p className="text-rose-700 text-sm font-medium mb-3">{error}</p>
                    <button onClick={load} className="text-sm font-semibold text-rose-800 hover:text-rose-900 underline">Try again</button>
                </div>
            )}

            {/* EMPTY STATE */}
            {!loading && !error && exams.length === 0 && (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-12">
                    <EmptyState
                        icon={ClipboardList}
                        title="No exams yet"
                        description="Schedule your first exam by selecting a term, target classes, and covered subjects."
                        action={
                            <button
                                onClick={() => { setEditing(null); setViewing(null); setModalOpen(true); }}
                                className="flex items-center gap-2 bg-navy-900 hover:bg-navy-800 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-all shadow-sm"
                            >
                                <Plus size={16} /> Add Exam
                            </button>
                        }
                    />
                </div>
            )}

            {/* DATA TABLE */}
            {!loading && !error && exams.length > 0 && (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto custom-scrollbar">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-slate-50 border-b border-slate-200">
                            <tr className="text-[11px] font-bold tracking-wider text-slate-500 uppercase">
                                <th className="px-6 py-4">Exam</th>
                                <th className="px-6 py-4">Type</th>
                                <th className="px-6 py-4">Term</th>
                                <th className="px-6 py-4">Classes</th>
                                <th className="px-6 py-4">Subjects</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                            {exams.map((e) => (
                                <tr key={e.id} className="group bg-white hover:bg-slate-50/80 transition-colors">
                                    <td className="px-6 py-4 font-semibold text-slate-900">
                                        <div className="flex items-center gap-2.5">
                                            <div className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600">
                                                <ClipboardList size={16} />
                                            </div>
                                            {e.name}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="inline-flex items-center gap-1 bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold px-2.5 py-1 rounded-lg">
                                            <FileText size={12} className="text-slate-400" />
                                            {e.examType}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-slate-600 font-medium">
                                        <div className="flex items-center gap-1.5 w-fit">
                                            <Calendar size={14} className="text-slate-400" />
                                            {e.termName}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="inline-flex items-center bg-blue-50 border border-blue-100 text-blue-700 text-xs font-bold px-2.5 py-1 rounded-full">
                                            {e.classSections.length} {e.classSections.length === 1 ? 'class' : 'classes'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="inline-flex items-center bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-bold px-2.5 py-1 rounded-full">
                                            {e.subjects.length} {e.subjects.length === 1 ? 'subject' : 'subjects'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right whitespace-nowrap">
                                        <div className="flex items-center justify-end gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => { setViewing(e); setEditing(null); setModalOpen(true); }}
                                                title="View Details"
                                                className="p-2 rounded-xl text-slate-400 hover:text-navy-900 hover:bg-slate-100 transition-colors"
                                            >
                                                <Eye size={16} />
                                            </button>
                                            <button
                                                onClick={() => { setEditing(e); setViewing(null); setModalOpen(true); }}
                                                title="Edit Exam"
                                                className="p-2 rounded-xl text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                                            >
                                                <Pencil size={16} />
                                            </button>
                                            <button
                                                onClick={() => setDeleteTarget(e)}
                                                title="Delete Exam"
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

            {/* CONFIRMATION DIALOG */}
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