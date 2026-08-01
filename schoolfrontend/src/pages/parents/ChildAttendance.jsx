import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, ClipboardCheck } from 'lucide-react';
import axiosClient from '../../api/axiosClient';

export default function ChildAttendance() {
    const { childId } = useParams();
    const [records, setRecords] = useState([]);
    const [child, setChild] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([
            axiosClient.get(`/students/${childId}`),
            axiosClient.get(`/students/${childId}/class-attendance`),
        ]).then(([childRes, attendanceRes]) => {
            setChild(childRes.data);
            setRecords(attendanceRes.data);
        }).finally(() => setLoading(false));
    }, [childId]);

    if (loading) return <p className="text-sm text-slate-400">Loading...</p>;

    const presentCount = records.filter(r => r.status === 'PRESENT' || r.status === 'LATE').length;
    const percentage = records.length > 0 ? Math.round((presentCount / records.length) * 100) : 0;

    return (
        <div>
            <Link to="/parent-dashboard" className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 mb-4">
                <ArrowLeft size={14} /> Back to Dashboard
            </Link>

            <div className="mb-6">
                <h1 className="text-2xl font-bold text-slate-900">
                    {child?.firstName} {child?.lastName} — Attendance
                </h1>
                <p className="text-sm text-slate-500 mt-1">
                    {child?.gradeLevelName}{child?.classSectionName ? ` · ${child.classSectionName}` : ''}
                </p>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-5 mb-6">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl bg-teal-accent/10 flex items-center justify-center">
                        <ClipboardCheck size={24} className="text-teal-600" />
                    </div>
                    <div>
                        <p className="text-3xl font-bold text-slate-900">{percentage}%</p>
                        <p className="text-sm text-slate-500">{presentCount} of {records.length} sessions attended</p>
                    </div>
                </div>
            </div>

            {records.length === 0 ? (
                <p className="text-sm text-slate-400">No attendance records yet.</p>
            ) : (
                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                    <table className="w-full text-sm">
                        <thead>
                        <tr className="border-b border-slate-100 text-left text-[11px] font-semibold tracking-wider text-slate-400">
                            <th className="px-6 py-3">DATE</th>
                            <th className="px-6 py-3">STATUS</th>
                        </tr>
                        </thead>
                        <tbody>
                        {records.map((r, i) => (
                            <tr key={i} className="border-b border-slate-50 last:border-0">
                                <td className="px-6 py-3 text-slate-700">{r.sessionDate || r.date || '—'}</td>
                                <td className="px-6 py-3">
                                        <span className={`inline-block text-xs font-medium px-2.5 py-1 rounded-full ${
                                            r.status === 'PRESENT' ? 'bg-emerald-50 text-emerald-700' :
                                            r.status === 'LATE' ? 'bg-amber-50 text-amber-700' :
                                            r.status === 'EXCUSED' ? 'bg-blue-50 text-blue-700' :
                                            'bg-red-50 text-red-700'
                                        }`}>
                                            {r.status}
                                        </span>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}