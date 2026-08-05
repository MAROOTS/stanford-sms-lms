import { useEffect, useState, useCallback } from 'react';
import { TrendingUp, Download, BarChart3 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from 'recharts';
import axiosClient from '../../api/axiosClient';
import EmptyState from '../../components/shared/EmptyState';
import { TableSkeleton } from '../../components/shared/LoadingSkeleton';

const GRADE_COLORS = {
    EE: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    ME: 'bg-teal-50 text-teal-700 border border-teal-200',
    AE: 'bg-amber-50 text-amber-700 border border-amber-200',
    BE: 'bg-red-50 text-red-600 border border-red-200',
};

const CHART_BAR_COLORS = {
    EE: '#10b981',
    ME: '#14b8a6',
    AE: '#f59e0b',
    BE: '#ef4444',
};

export default function Results() {
    const [exams, setExams] = useState([]);
    const [examId, setExamId] = useState('');
    const [selectedExam, setSelectedExam] = useState(null);
    const [classSectionId, setClassSectionId] = useState('');
    const [rows, setRows] = useState([]);
    const [distribution, setDistribution] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        axiosClient.get('/exams').then((res) => setExams(res.data)).catch(() => setError('Could not load exams'));
    }, []);

    useEffect(() => {
        if (!examId) { queueMicrotask(() => setSelectedExam(null)); return; }
        axiosClient.get(`/exams/${examId}`).then((res) => setSelectedExam(res.data));
        queueMicrotask(() => { setClassSectionId(''); setRows([]); });
    }, [examId]);

    const loadResults = useCallback(async () => {
        if (!examId || !classSectionId) return;
        setLoading(true); setError('');
        try {
            const [resultsRes, distRes] = await Promise.all([
                axiosClient.get(`/results/exam/${examId}/class/${classSectionId}`),
                axiosClient.get(`/results/exam/${examId}/class/${classSectionId}/distribution`),
            ]);
            setRows(resultsRes.data);
            setDistribution(distRes.data);
        } catch { setError('Could not load results for this combination'); }
        finally { setLoading(false); }
    }, [examId, classSectionId]);

    useEffect(() => {
        setDistribution(null);
        queueMicrotask(() => loadResults());
    }, [loadResults]);

    const getGradeStyle = (grade) => {
        if (!grade) return 'bg-slate-100 text-slate-600';
        return GRADE_COLORS[grade] || 'bg-slate-100 text-slate-600';
    };

    const exportCSV = () => {
        const examName = selectedExam?.name || 'Exam';
        const className = selectedExam?.classSections.find((c) => c.id === Number(classSectionId))?.name || 'Class';
        const header = 'Position,Student,Total Score,Mean %,Grade\n';
        const body = rows
            .map((r) => `${r.position},"${r.studentName}",${r.totalScore} / ${r.totalMaxScore},${r.meanPercentage}%,${r.overallGrade}`)
            .join('\n');
        const csv = header + body;
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `results-${examName.replace(/\s+/g, '-')}-${className.replace(/\s+/g, '-')}-${new Date().toISOString().slice(0, 10)}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
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

            {!loading && distribution && Object.keys(distribution).length > 0 && (
                <div className="bg-white rounded-xl border border-slate-200 p-5 mb-6">
                    <div className="flex items-center gap-2 mb-3">
                        <BarChart3 size={16} className="text-slate-400" />
                        <h2 className="text-sm font-bold text-slate-700">Grade Distribution</h2>
                    </div>
                    <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={Object.entries(distribution).map(([grade, count]) => ({ grade, count }))}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                            <XAxis dataKey="grade" tick={{ fontSize: 12, fill: '#64748b' }} />
                            <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                            <Tooltip cursor={{ fill: '#f8fafc' }} formatter={(value) => [value, 'Students']} />
                            <Bar dataKey="count" radius={[4, 4, 0, 0]} fill="#14b8a6"
                                shape={(props) => {
                                    const { grade } = props;
                                    if (grade) {
                                        const color = CHART_BAR_COLORS[grade.grade] || '#94a3b8';
                                        return <rect {...props} fill={color} />;
                                    }
                                    return <rect {...props} />;
                                }}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            )}

            {!loading && rows.length > 0 && (
                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                    <div className="px-6 py-3 border-b border-slate-100 flex justify-end">
                        <button
                            onClick={exportCSV}
                            className="flex items-center gap-1.5 text-xs font-medium text-teal-600 hover:text-teal-700 hover:bg-teal-50 px-3 py-1.5 rounded-lg transition-colors"
                        >
                            <Download size={14} />
                            Export CSV
                        </button>
                    </div>
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
