import { useEffect, useState, useCallback, useMemo } from 'react';
import { ClipboardCheck, BookOpen, FileText, CheckCircle2, Clock, BarChart3, AlertCircle, Loader2 } from 'lucide-react';
import axiosClient from '../../api/axiosClient';
import { useAuth } from '../../context/useAuth';
import GradeSubmissionModal from './GradeSubmissionModal';
import EmptyState from '../../components/shared/EmptyState';
import { TableSkeleton } from '../../components/shared/LoadingSkeleton';

export default function Grading() {
    const { user } = useAuth();
    const [courses, setCourses] = useState([]);
    const [courseId, setCourseId] = useState('');
    const [assignments, setAssignments] = useState([]);
    const [assignmentId, setAssignmentId] = useState('');
    const [selectedAssignment, setSelectedAssignment] = useState(null);
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [gradingSubmission, setGradingSubmission] = useState(null);

    useEffect(() => {
        axiosClient.get('/courses').then((res) => {
            const mine =
                user?.role === 'ADMIN'
                    ? res.data
                    : res.data.filter((c) => c.teacherId === user?.userId);
            setCourses(mine);
        });
    }, [user]);

    useEffect(() => {
        if (!courseId) {
            setAssignments([]);
            return;
        }
        axiosClient.get(`/courses/${courseId}/assignments`).then((res) => setAssignments(res.data));
        setAssignmentId('');
        setSubmissions([]);
    }, [courseId]);

    useEffect(() => {
        setSelectedAssignment(assignments.find((a) => a.id === Number(assignmentId)) || null);
    }, [assignmentId, assignments]);

    const loadSubmissions = useCallback(async () => {
        if (!assignmentId) return;
        setLoading(true);
        setError('');
        try {
            const { data } = await axiosClient.get(`/assignments/${assignmentId}/submissions`);
            setSubmissions(data);
        } catch {
            setError('Could not load submissions');
        } finally {
            setLoading(false);
        }
    }, [assignmentId]);

    useEffect(() => {
        loadSubmissions();
    }, [loadSubmissions]);

    // --- Computed stats ---
    const stats = useMemo(() => {
        const total = submissions.length;
        const graded = submissions.filter((s) => s.grade !== null && s.grade !== undefined).length;
        const pending = total - graded;
        const gradedSubs = submissions.filter((s) => s.grade !== null && s.grade !== undefined);
        const avg =
            gradedSubs.length > 0 && selectedAssignment
                ? Math.round(
                      (gradedSubs.reduce((sum, s) => sum + Number(s.grade), 0) / gradedSubs.length) *
                          100
                  ) / (selectedAssignment.maxScore ?? 100) * 100
                : 0;
        return { total, graded, pending, avg };
    }, [submissions, selectedAssignment]);

    return (
        <div className="animate-fade-in">
            {/* Page header */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-slate-900">Grading</h1>
                <p className="text-sm text-slate-500 mt-1">Review and grade student submissions.</p>
            </div>

            {/* Filter card */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 mb-6 shadow-sm">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5 flex items-center gap-1.5">
                            <BookOpen size={14} className="text-slate-400" />
                            Course
                        </label>
                        <select
                            value={courseId}
                            onChange={(e) => setCourseId(e.target.value)}
                            className="w-full px-4 py-3 rounded-lg bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-accent focus:border-teal-400 transition-all duration-200"
                        >
                            <option value="">Select course...</option>
                            {courses.map((c) => (
                                <option key={c.id} value={c.id}>
                                    {c.title}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5 flex items-center gap-1.5">
                            <FileText size={14} className="text-slate-400" />
                            Assignment
                        </label>
                        <select
                            value={assignmentId}
                            onChange={(e) => setAssignmentId(e.target.value)}
                            disabled={!courseId}
                            className="w-full px-4 py-3 rounded-lg bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-accent focus:border-teal-400 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <option value="">Select assignment...</option>
                            {assignments.map((a) => (
                                <option key={a.id} value={a.id}>
                                    {a.title}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Stats row */}
            {!loading && submissions.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6 animate-fade-in">
                    <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
                        <div className="flex items-center gap-2 mb-1">
                            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                                <FileText size={14} className="text-slate-500" />
                            </div>
                            <span className="text-xs font-semibold tracking-wider text-slate-400 uppercase">Total</span>
                        </div>
                        <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
                    </div>
                    <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
                        <div className="flex items-center gap-2 mb-1">
                            <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
                                <CheckCircle2 size={14} className="text-emerald-600" />
                            </div>
                            <span className="text-xs font-semibold tracking-wider text-slate-400 uppercase">Graded</span>
                        </div>
                        <p className="text-2xl font-bold text-emerald-700">{stats.graded}</p>
                    </div>
                    <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
                        <div className="flex items-center gap-2 mb-1">
                            <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
                                <Clock size={14} className="text-amber-600" />
                            </div>
                            <span className="text-xs font-semibold tracking-wider text-slate-400 uppercase">Pending</span>
                        </div>
                        <p className="text-2xl font-bold text-amber-700">{stats.pending}</p>
                    </div>
                    <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
                        <div className="flex items-center gap-2 mb-1">
                            <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center">
                                <BarChart3 size={14} className="text-teal-600" />
                            </div>
                            <span className="text-xs font-semibold tracking-wider text-slate-400 uppercase">Avg %</span>
                        </div>
                        <p className="text-2xl font-bold text-teal-700">{Math.round(stats.avg)}%</p>
                    </div>
                </div>
            )}

            {/* Error state */}
            {error && !loading && (
                <div className="flex items-center gap-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-4 animate-fade-in">
                    <AlertCircle size={16} className="text-red-500 shrink-0" />
                    <span>{error}</span>
                </div>
            )}

            {/* Loading state */}
            {loading && <TableSkeleton columns={4} rows={4} />}

            {/* Empty state */}
            {!loading && assignmentId && submissions.length === 0 && !error && (
                <EmptyState
                    icon={ClipboardCheck}
                    title="No submissions yet"
                    description="Students haven't submitted anything for this assignment. Check back later."
                />
            )}

            {/* Initial prompt */}
            {!loading && !assignmentId && !error && (
                <div className="bg-white rounded-xl border border-slate-200 p-10 text-center shadow-sm">
                    <div className="w-14 h-14 rounded-full bg-teal-50 flex items-center justify-center mx-auto mb-4">
                        <ClipboardCheck size={24} className="text-teal-500" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-700 mb-1">Ready to grade</h3>
                    <p className="text-sm text-slate-400 max-w-sm mx-auto">
                        Select a course and assignment above to view student submissions and start grading.
                    </p>
                </div>
            )}

            {/* Submissions table */}
            {!loading && submissions.length > 0 && (
                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm mt-6 animate-fade-in">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-slate-100 text-left text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
                                    <th className="px-6 py-3">Student</th>
                                    <th className="px-6 py-3">Submitted</th>
                                    <th className="px-6 py-3">Grade</th>
                                    <th className="px-6 py-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {submissions.map((s) => (
                                    <tr
                                        key={s.id}
                                        className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors"
                                    >
                                        <td className="px-6 py-4 font-medium text-slate-800">
                                            {s.studentName}
                                        </td>
                                        <td className="px-6 py-4 text-slate-500 text-xs">
                                            {new Date(s.submittedAt).toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            {s.grade !== null && s.grade !== undefined ? (
                                                <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 text-xs font-semibold px-2.5 py-1 rounded-full border border-emerald-200">
                                                    <CheckCircle2 size={12} />
                                                    {s.grade} / {selectedAssignment?.maxScore ?? 100}
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 text-xs font-semibold px-2.5 py-1 rounded-full border border-amber-200">
                                                    <Clock size={12} />
                                                    Not graded
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => setGradingSubmission(s)}
                                                className="inline-flex items-center gap-1.5 text-teal-600 hover:text-teal-700 font-medium text-xs px-3 py-1.5 rounded-lg hover:bg-teal-50 transition-all duration-200"
                                            >
                                                <ClipboardCheck size={14} />
                                                {s.grade !== null && s.grade !== undefined
                                                    ? 'Re-grade'
                                                    : 'Grade'}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Grade modal */}
            {gradingSubmission && (
                <GradeSubmissionModal
                    submission={gradingSubmission}
                    maxScore={selectedAssignment?.maxScore ?? 100}
                    onClose={() => setGradingSubmission(null)}
                    onSaved={() => {
                        setGradingSubmission(null);
                        loadSubmissions();
                    }}
                />
            )}
        </div>
    );
}