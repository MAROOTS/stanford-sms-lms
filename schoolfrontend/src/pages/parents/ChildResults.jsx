import { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, TrendingUp, FileDown } from 'lucide-react';
import axiosClient from '../../api/axiosClient';
import { useToast } from '../../context/useToast';

const GRADE_COLORS = {
    EE: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    ME: 'bg-teal-50 text-teal-700 border border-teal-200',
    AE: 'bg-amber-50 text-amber-700 border border-amber-200',
    BE: 'bg-red-50 text-red-600 border border-red-200',
};

const getGradeStyle = (grade) => {
    if (!grade) return 'bg-slate-100 text-slate-600';
    return GRADE_COLORS[grade] || 'bg-slate-100 text-slate-600';
};

export default function ChildResults() {
    const { childId } = useParams();
    const toast = useToast();
    const [child, setChild] = useState(null);
    const [exams, setExams] = useState([]);
    const [examId, setExamId] = useState('');
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        axiosClient.get(`/students/${childId}`).then((res) => setChild(res.data));
    }, [childId]);

    useEffect(() => {
        if (!child?.classSectionId) return;
        axiosClient.get('/exams').then((res) => {
            setExams(res.data.filter((e) => e.classSections.some((c) => c.id === child.classSectionId)));
        });
    }, [child]);

    const loadResult = useCallback(async () => {
        if (!examId) { setResult(null); return; }
        setLoading(true); setError('');
        try {
            const { data } = await axiosClient.get(`/results/student/${childId}/exam/${examId}`);
            setResult(data);
        } catch {
            setError('No results found for this exam yet');
            setResult(null);
        } finally { setLoading(false); }
    }, [examId, childId]);

    useEffect(() => { loadResult(); }, [loadResult]);

    const handleDownloadReportCard = async () => {
        try {
            const response = await axiosClient.get(`/report-cards/student/${childId}/exam/${examId}`, { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
            const win = window.open(url, '_blank');
            if (!win) {
                toast.warning('Pop-up blocked. Please allow pop-ups for this site to view the report card.');
            }
        } catch {
            toast.error('Could not generate report card. The student may not have marks recorded for this exam.');
        }
    };

    return (
        <div>
            <Link to="/parent-dashboard" className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 mb-4">
                <ArrowLeft size={14} /> Back to Dashboard
            </Link>

            <div className="mb-6">
                <h1 className="text-2xl font-bold text-slate-900">
                    {child?.firstName} {child?.lastName} — Results
                </h1>
                <p className="text-sm text-slate-500 mt-1">{child?.gradeLevelName}{child?.classSectionName ? ` · ${child.classSectionName}` : ''}</p>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-5 mb-6 max-w-md">
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Exam</label>
                <select value={examId} onChange={(e) => setExamId(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-lg bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-accent">
                    <option value="">Select exam...</option>
                    {exams.map((e) => <option key={e.id} value={e.id}>{e.name} ({e.termName})</option>)}
                </select>
            </div>

            {loading && <p className="text-sm text-slate-400">Loading results...</p>}
            {error && <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2 mb-4">{error}</p>}

            {!loading && result && (
                <>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                        {[
                            { label: 'Total Score', value: result.totalScore },
                            { label: 'Mean %', value: `${result.meanPercentage}%` },
                            { label: 'Overall Grade', value: result.overallGrade },
                            { label: 'Class Position', value: `${result.position} / ${result.outOf}` },
                        ].map((c) => (
                            <div key={c.label} className="bg-white rounded-xl border border-slate-200 p-5">
                                <p className="text-xl font-bold text-slate-900">{c.value}</p>
                                <p className="text-sm text-slate-500 mt-1">{c.label}</p>
                            </div>
                        ))}
                    </div>

                    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden mb-6">
                        <table className="w-full text-sm">
                            <thead>
                            <tr className="border-b border-slate-100 text-left text-[11px] font-semibold tracking-wider text-slate-400">
                                <th className="px-6 py-3">SUBJECT</th>
                                <th className="px-6 py-3">SCORE</th>
                                <th className="px-6 py-3">%</th>
                                <th className="px-6 py-3">GRADE</th>
                            </tr>
                            </thead>
                            <tbody>
                            {result.subjectResults.map((s) => (
                                <tr key={s.subjectId} className="border-b border-slate-50 last:border-0">
                                    <td className="px-6 py-3 font-medium text-slate-800">{s.subjectName}</td>
                                    <td className="px-6 py-3 text-slate-600">{s.score} / {s.maxScore}</td>
                                    <td className="px-6 py-3 text-slate-600">{s.percentage}%</td>
                                    <td className="px-6 py-3">
                                        <span className={`inline-block text-xs font-medium px-2.5 py-1 rounded-full ${getGradeStyle(s.grade)}`}>
                                            {s.grade}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="flex justify-end">
                        <button
                            onClick={handleDownloadReportCard}
                            className="flex items-center gap-1.5 bg-navy-900 hover:bg-navy-800 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors"
                        >
                            <FileDown size={16} />
                            Download Report Card
                        </button>
                    </div>
                </>
            )}

            {!loading && !examId && !error && (
                <div className="bg-white rounded-xl border border-slate-200 p-10 text-center">
                    <div className="w-14 h-14 rounded-full bg-teal-50 flex items-center justify-center mx-auto mb-4">
                        <TrendingUp size={24} className="text-teal-500" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-700 mb-1">View exam results</h3>
                    <p className="text-sm text-slate-400 max-w-sm mx-auto">
                        Select an exam above to see {child?.firstName}'s detailed results, including per-subject scores and class ranking.
                    </p>
                </div>
            )}
        </div>
    );
}
