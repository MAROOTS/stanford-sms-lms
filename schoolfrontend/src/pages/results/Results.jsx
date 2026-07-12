import { useEffect, useState, useCallback } from 'react';
import { TrendingUp } from 'lucide-react';
import axiosClient from '../../api/axiosClient';
import EmptyState from '../../components/shared/EmptyState';
import { TableSkeleton } from '../../components/shared/LoadingSkeleton';

const GRADE_COLORS = {
    A: 'bg-emerald-50 text-emerald-700',
    B: 'bg-teal-50 text-teal-700',
    C: 'bg-amber-50 text-amber-700',
    D: 'bg-orange-50 text-orange-700',
    F: 'bg-red-50 text-red-600',
};

export default function Results() {
    const [exams, setExams] = useState([]);
    const [examId, setExamId] = useState('');
    const [selectedExam, setSelectedExam] = useState(null);
    const [classSectionId, setClassSectionId] = useState('');
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        axiosClient.get('/exams').then((res) => setExams(res.data)).catch(() => setError('Could not load exams'));
    }, []);

    useEffect(() => {
        if (!examId) { setSelectedExam(null); return; }
        axiosClient.get(`/exams/${examId}`).then((res) => setSelectedExam(res.data));
        setClassSectionId(''); setRows([]);
    }, [examId]);

    const loadResults = useCallback(async () => {
        if (!examId || !classSectionId) return;
        setLoading(true); setError('');
        try {
            const { data } = await axiosClient.get(`/results/exam/${examId}/class/${classSectionId}`);
            setRows(data);
        } catch { setError('Could not load results for this combination'); }
        finally { setLoading(false); }
    }, [examId, classSectionId]);

    useEffect(() => { loadResults(); }, [loadResults]);

    const getGradeStyle = (grade) => {
        if (!grade) return 'bg-slate-100 text-slate-600';
        const key = grade.charAt(0).toUpperCase();
        return GRADE_COLORS[key] || 'bg-slate-100 text-slate-600';
    };

    return (
        <div>
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-slate-900">Results & Ranking</h1>
                <p className="text-sm text-slate-500 mt-1">Class rankings computed from marks entered so far.</p>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-5 mb-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Exam</label>
                    <select value={examId} onChange={(e) => setExamId(e.target.value)}
                            className="w-full px-3 py-2.5 rounded-lg bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-accent">
                        <option value="">Select exam...</option>
                        {exams.map((e) => <option key={e.id} value={e.id}>{e.name} ({e.termName})</option>)}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Class</label>
                    <select value={classSectionId} onChange={(e) => setClassSectionId(e.target.value)} disabled={!selectedExam}
                            className="w-full px-3 py-2.5 rounded-lg bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-accent disabled:opacity-50">
                        <option value="">Select class...</option>
                        {selectedExam?.classSections.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                </div>
            </div>

            {error && <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2 mb-4">{error}</p>}
            {loading && <TableSkeleton columns={5} rows={5} />}

            {!loading && rows.length > 0 && (
                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                            <tr className="border-b border-slate-100 text-left text-[11px] font-semibold tracking-wider text-slate-400">
                                <th className="px-6 py-3 w-12">POS</th>
                                <th className="px-6 py-3">STUDENT</th>
                                <th className="px-6 py-3">TOTAL SCORE</th>
                                <th className="px-6 py-3">MEAN %</th>
                                <th className="px-6 py-3">GRADE</th>
                            </tr>
                            </thead>
                            <tbody>
                            {rows.map((r) => (
                                <tr key={r.studentId} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors">
                                    <td className="px-6 py-3">
                                        {r.position <= 3 ? (
                                            <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold text-white ${
                                                r.position === 1 ? 'bg-amber-400' : r.position === 2 ? 'bg-slate-400' : 'bg-amber-600'
                                            }`}>
                                                {r.position}
                                            </span>
                                        ) : (
                                            <span className="text-slate-500 font-medium">{r.position}</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-3 text-slate-700 font-medium">{r.studentName}</td>
                                    <td className="px-6 py-3 text-slate-600">{r.totalScore} / {r.totalMaxScore}</td>
                                    <td className="px-6 py-3 text-slate-600">{r.meanPercentage}%</td>
                                    <td className="px-6 py-3">
                                        <span className={`inline-block text-xs font-medium px-2.5 py-1 rounded-full ${getGradeStyle(r.overallGrade)}`}>
                                            {r.overallGrade || '—'}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {!loading && examId && classSectionId && rows.length === 0 && !error && (
                <EmptyState
                    icon={TrendingUp}
                    title="No results yet"
                    description="No marks have been entered for this class and exam yet."
                />
            )}
        </div>
    );
}
