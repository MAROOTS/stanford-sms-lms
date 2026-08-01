import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, TrendingUp } from 'lucide-react';
import axiosClient from '../../api/axiosClient';

export default function ChildResults() {
    const { childId } = useParams();
    const [results, setResults] = useState([]);
    const [child, setChild] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([
            axiosClient.get(`/students/${childId}`),
            axiosClient.get(`/results/student/${childId}`),
        ]).then(([childRes, resultsRes]) => {
            setChild(childRes.data);
            setResults(resultsRes.data);
        }).finally(() => setLoading(false));
    }, [childId]);

    if (loading) return <p className="text-sm text-slate-400">Loading...</p>;

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

            {results.length === 0 ? (
                <p className="text-sm text-slate-400">No exam results available yet.</p>
            ) : (
                results.map((exam, i) => (
                    <div key={i} className="bg-white rounded-xl border border-slate-200 overflow-hidden mb-4">
                        <div className="px-6 py-3 bg-slate-50 border-b border-slate-100 flex items-center gap-2">
                            <TrendingUp size={16} className="text-teal-600" />
                            <span className="font-medium text-slate-900">{exam.examName}</span>
                            <span className="text-xs text-slate-400">({exam.termName})</span>
                        </div>
                        <table className="w-full text-sm">
                            <thead>
                            <tr className="border-b border-slate-100 text-left text-[11px] font-semibold tracking-wider text-slate-400">
                                <th className="px-6 py-2">SUBJECT</th>
                                <th className="px-6 py-2 text-right">SCORE</th>
                            </tr>
                            </thead>
                            <tbody>
                            {exam.subjects?.map((s, j) => (
                                <tr key={j} className="border-b border-slate-50 last:border-0">
                                    <td className="px-6 py-2 text-slate-700">{s.subjectName || s.name}</td>
                                    <td className="px-6 py-2 text-right font-medium text-slate-900">{s.score}{s.maxScore ? ` / ${s.maxScore}` : ''}</td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                ))
            )}
        </div>
    );
}