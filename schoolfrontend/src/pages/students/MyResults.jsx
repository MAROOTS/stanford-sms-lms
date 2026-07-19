import { useEffect, useState, useCallback } from 'react';
import axiosClient from '../../api/axiosClient';
import { useAuth } from '../../context/AuthContext';

export default function MyResults() {
    const { user } = useAuth();
    const [classSectionId, setClassSectionId] = useState(null);
    const [exams, setExams] = useState([]);
    const [examId, setExamId] = useState('');
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!user?.userId) return;
        axiosClient.get(`/students/${user.userId}`).then((res) => setClassSectionId(res.data.classSectionId));
    }, [user]);

    useEffect(() => {
        if (!classSectionId) return;
        axiosClient.get('/exams').then((res) => {
            setExams(res.data.filter((e) => e.classSections.some((c) => c.id === classSectionId)));
        });
    }, [classSectionId]);

    const loadResult = useCallback(async () => {
        if (!examId) { setResult(null); return; }
        setLoading(true); setError('');
        try {
            const { data } = await axiosClient.get(`/results/student/${user.userId}/exam/${examId}`);
            setResult(data);
        } catch {
            setError('No results found for this exam yet');
            setResult(null);
        } finally { setLoading(false); }
    }, [examId, user]);

    useEffect(() => { loadResult(); }, [loadResult]);

    return (
        <div>
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-slate-900">My Results</h1>
                <p className="text-sm text-slate-500 mt-1">View your scores and class ranking per exam.</p>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-5 mb-6 max-w-md">
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Exam</label>
                <select value={examId} onChange={(e) => setExamId(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-lg bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-accent">
                    <option value="">Select exam...</option>
                    {exams.map((e) => <option key={e.id} value={e.id}>{e.name} ({e.termName})</option>)}
                </select>
            </div>

            {loading && <p className="text-sm text-slate-400">Loading...</p>}
            {error && <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</p>}

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

                    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
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
                                        <span className="inline-block bg-slate-100 text-slate-600 text-xs font-medium px-2.5 py-1 rounded-full">{s.grade}</span>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                </>
            )}
        </div>
    );
}