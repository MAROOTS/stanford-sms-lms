import { useEffect, useState, useCallback } from 'react';
import axiosClient from '../../api/axiosClient';

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
            {loading && <p className="text-sm text-slate-400">Loading results...</p>}

            {!loading && rows.length > 0 && (
                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                    <table className="w-full text-sm">
                        <thead>
                        <tr className="border-b border-slate-100 text-left text-[11px] font-semibold tracking-wider text-slate-400">
                            <th className="px-6 py-3">POSITION</th>
                            <th className="px-6 py-3">STUDENT</th>
                            <th className="px-6 py-3">TOTAL SCORE</th>
                            <th className="px-6 py-3">MEAN %</th>
                            <th className="px-6 py-3">GRADE</th>
                        </tr>
                        </thead>
                        <tbody>
                        {rows.map((r) => (
                            <tr key={r.studentId} className="border-b border-slate-50 last:border-0">
                                <td className="px-6 py-3 font-semibold text-slate-800">{r.position} / {r.outOf}</td>
                                <td className="px-6 py-3 text-slate-700">{r.studentName}</td>
                                <td className="px-6 py-3 text-slate-600">{r.totalScore} / {r.totalMaxScore}</td>
                                <td className="px-6 py-3 text-slate-600">{r.meanPercentage}%</td>
                                <td className="px-6 py-3">
                                    <span className="inline-block bg-slate-100 text-slate-600 text-xs font-medium px-2.5 py-1 rounded-full">{r.overallGrade}</span>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            )}

            {!loading && examId && classSectionId && rows.length === 0 && !error && (
                <p className="text-sm text-slate-400">No marks have been entered for this class yet.</p>
            )}
        </div>
    );
}