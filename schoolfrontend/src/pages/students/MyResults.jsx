import { useEffect, useState, useCallback } from 'react';
import {
    Award,
    Trophy,
    BarChart3,
    TrendingUp,
    GraduationCap,
    BookOpen
} from 'lucide-react';
import axiosClient from '../../api/axiosClient';
import { useAuth } from '../../context/useAuth';
import NoticeCard from '../../components/shared/NoticeCard';
import EmptyState from '../../components/shared/EmptyState';
import { TableSkeleton } from '../../components/shared/LoadingSkeleton';
import { readApiError } from '../../utils/readApiError';

const GRADE_COLORS = {
    EE: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    ME: 'bg-teal-50 text-teal-700 border-teal-200',
    AE: 'bg-amber-50 text-amber-700 border-amber-200',
    BE: 'bg-rose-50 text-rose-700 border-rose-200',
};

const getGradeStyle = (grade) => {
    if (!grade) return 'bg-slate-100 text-slate-600 border-slate-200';
    return GRADE_COLORS[grade] || 'bg-slate-100 text-slate-600 border-slate-200';
};

export default function MyResults() {
    const { user } = useAuth();
    const [classSectionId, setClassSectionId] = useState(null);
    const [exams, setExams] = useState([]);
    const [examId, setExamId] = useState('');
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [loadingExams, setLoadingExams] = useState(false);
    const [notice, setNotice] = useState('');

    useEffect(() => {
        if (!user?.userId) return;
        axiosClient
            .get(`/students/${user.userId}`)
            .then((res) => setClassSectionId(res.data.classSectionId))
            .catch(() => {});
    }, [user]);

    useEffect(() => {
        if (!classSectionId) return;
        setLoadingExams(true);
        axiosClient
            .get('/exams')
            .then((res) => {
                setExams(res.data.filter((e) => e.classSections.some((c) => c.id === classSectionId)));
            })
            .catch(() => {})
            .finally(() => setLoadingExams(false));
    }, [classSectionId]);

    const loadResult = useCallback(async () => {
        if (!examId) {
            setResult(null);
            return;
        }
        setLoading(true);
        setNotice('');
        try {
            const { data } = await axiosClient.get(`/results/student/${user.userId}/exam/${examId}`);
            setResult(data);
        } catch (err) {
            setResult(null);
            setNotice(
                readApiError(err, {
                    forbidden: 'You can only view your own results.',
                    notFound: 'No results have been posted for this exam yet.',
                    error: 'Could not load your results.',
                })
            );
        } finally {
            setLoading(false);
        }
    }, [examId, user]);

    useEffect(() => {
        loadResult();
    }, [loadResult]);

    return (
        <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 animate-in fade-in duration-500">
            {/* HEADER */}
            <div className="mb-8">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-navy-900/5 text-navy-900 text-xs font-semibold mb-2">
                    Academic Evaluation
                </div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">My Results</h1>
                <p className="text-sm text-slate-500 mt-1.5">
                    View your overall performance, subject scores, and class rankings per examination term.
                </p>
            </div>

            {/* EXAM SELECTOR CARD */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 mb-8 max-w-xl">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                    Select Examination
                </label>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <GraduationCap size={18} />
                    </div>
                    <select
                        value={examId}
                        onChange={(e) => setExamId(e.target.value)}
                        disabled={loadingExams}
                        className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-navy-900/20 focus:border-navy-900 transition-all cursor-pointer disabled:opacity-60"
                    >
                        <option value="">Choose an exam to view results...</option>
                        {exams.map((e) => (
                            <option key={e.id} value={e.id}>
                                {e.name} ({e.termName})
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* UNSELECTED EXAM PROMPT */}
            {!examId && !loading && !notice && (
                <EmptyState
                    icon={BookOpen}
                    title="No exam selected"
                    description="Select an examination from the dropdown above to display your score analysis and subject grades."
                />
            )}

            {/* LOADING SKELETON */}
            {loading && (
                <div className="space-y-6">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="bg-slate-100 animate-pulse h-28 rounded-2xl" />
                        ))}
                    </div>
                    <TableSkeleton columns={4} rows={5} />
                </div>
            )}

            {/* NOTICE / ERROR */}
            {notice && <NoticeCard notice={notice} onRetry={loadResult} />}

            {/* RESULT VIEW */}
            {!loading && result && (
                <div className="space-y-8 animate-in fade-in duration-300">
                    {/* STAT CARDS */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
                            <div className="flex items-center gap-2.5 text-slate-500 mb-2">
                                <div className="p-2 rounded-xl bg-slate-100 text-slate-600">
                                    <Award size={18} />
                                </div>
                                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                                    Total Score
                                </span>
                            </div>
                            <p className="text-2xl font-bold text-slate-900">{result.totalScore}</p>
                        </div>

                        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
                            <div className="flex items-center gap-2.5 text-slate-500 mb-2">
                                <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
                                    <BarChart3 size={18} />
                                </div>
                                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                                    Mean Score
                                </span>
                            </div>
                            <p className="text-2xl font-bold text-slate-900">{result.meanPercentage}%</p>
                        </div>

                        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
                            <div className="flex items-center gap-2.5 text-slate-500 mb-2">
                                <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
                                    <TrendingUp size={18} />
                                </div>
                                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                                    Overall Grade
                                </span>
                            </div>
                            <div>
                                <span
                                    className={`inline-block text-xs font-bold px-2.5 py-0.5 rounded-full border ${getGradeStyle(
                                        result.overallGrade
                                    )}`}
                                >
                                    {result.overallGrade || '—'}
                                </span>
                            </div>
                        </div>

                        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
                            <div className="flex items-center gap-2.5 text-slate-500 mb-2">
                                <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
                                    <Trophy size={18} />
                                </div>
                                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                                    Position
                                </span>
                            </div>
                            <p className="text-2xl font-bold text-slate-900">
                                {result.position} <span className="text-xs font-medium text-slate-400">/ {result.outOf}</span>
                            </p>
                        </div>
                    </div>

                    {/* SUBJECT RESULTS TABLE */}
                    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
                        <div className="px-6 py-4 bg-slate-50/50 border-b border-slate-200 flex items-center justify-between">
                            <h3 className="font-semibold text-slate-900 text-sm">Subject Performance Breakdown</h3>
                            <span className="text-xs text-slate-500 font-medium">
                                {result.subjectResults?.length || 0} Subjects Evaluated
                            </span>
                        </div>
                        <div className="overflow-x-auto custom-scrollbar">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-slate-50/30 border-b border-slate-200">
                                <tr className="text-[11px] font-bold tracking-wider text-slate-500 uppercase">
                                    <th className="px-6 py-4">Subject</th>
                                    <th className="px-6 py-4">Score Obtained</th>
                                    <th className="px-6 py-4">Percentage</th>
                                    <th className="px-6 py-4">Grade Band</th>
                                </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                {result.subjectResults?.map((s) => (
                                    <tr
                                        key={s.subjectId || s.subjectName}
                                        className="group bg-white hover:bg-slate-50/80 transition-colors"
                                    >
                                        <td className="px-6 py-4 font-semibold text-slate-900 whitespace-nowrap">
                                            <div className="flex items-center gap-2.5">
                                                <div className="w-2 h-2 rounded-full bg-navy-900/60" />
                                                <span className="group-hover:text-navy-900 transition-colors">
                                                        {s.subjectName}
                                                    </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-slate-700 whitespace-nowrap font-medium">
                                            {s.score} <span className="text-slate-400 text-xs font-normal">/ {s.maxScore}</span>
                                        </td>
                                        <td className="px-6 py-4 text-slate-700 whitespace-nowrap font-semibold">
                                            {s.percentage}%
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                                <span
                                                    className={`inline-block text-xs font-bold px-2.5 py-0.5 rounded-full border ${getGradeStyle(
                                                        s.grade
                                                    )}`}
                                                >
                                                    {s.grade || '—'}
                                                </span>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}