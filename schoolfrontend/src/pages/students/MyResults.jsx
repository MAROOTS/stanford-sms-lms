import { useEffect, useState, useCallback } from 'react';
import axiosClient from '../../api/axiosClient';
import { useAuth } from '../../context/useAuth';
import NoticeCard from '../../components/shared/NoticeCard';
import { readApiError } from '../../utils/readApiError';
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

export default function MyResults() {
    const { user } = useAuth();
    const [classSectionId, setClassSectionId] = useState(null);
    const [exams, setExams] = useState([]);
    const [examId, setExamId] = useState('');
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [notice, setNotice] = useState('');

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
        setLoading(true); setNotice('');
        try {
            const { data } = await axiosClient.get(`/results/student/${user.userId}/exam/${examId}`);
            setResult(data);
        } catch(err) {
            setResult(null);
            setNotice(readApiError(err, {
                forbidden: 'You can only view your own results.',
                notFound: 'No results have been posted for this exam yet.',
                error: 'Could not load your results.',
            }));
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
            {notice && <NoticeCard notice={notice} onRetry={loadResult} />}
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
                                        <span className={`inline-block text-xs font-medium px-2.5 py-1 rounded-full ${getGradeStyle(s.grade)}`}>{s.grade}</span>
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

//TODO another is also, what if a school has their on data either in csv or xsxl or any format is there a way we can do so that they can upload directly and continue using the platform?, if it is students, the students page becomes populated correctly somehow. Another thing is about admitting a student and adding a teacher, i have very less data about them leaving important things like medical records and other things which i cant remember