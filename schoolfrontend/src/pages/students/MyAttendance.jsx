import { useEffect, useState } from 'react';
import axiosClient from '../../api/axiosClient';
import { useAuth } from '../../context/useAuth';

const STATUS_STYLES = {
    PRESENT: 'bg-teal-accent/15 text-teal-700',
    ABSENT: 'bg-red-50 text-red-600',
    LATE: 'bg-amber-50 text-amber-700',
    EXCUSED: 'bg-slate-100 text-slate-600',
};

export default function MyAttendance() {
    const { user } = useAuth();
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!user?.userId) return;
        axiosClient.get(`/students/${user.userId}/class-attendance`)
            .then((res) => {
                const sorted = [...res.data].sort((a, b) => new Date(b.sessionDate) - new Date(a.sessionDate));
                setRecords(sorted);
            })
            .catch(() => setError('Could not load your attendance'))
            .finally(() => setLoading(false));
    }, [user]);

    const presentOrLate = records.filter((r) => r.status === 'PRESENT' || r.status === 'LATE').length;
    const percent = records.length > 0 ? Math.round((presentOrLate / records.length) * 100) : null;

    return (
        <div>
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-slate-900">My Attendance</h1>
                <p className="text-sm text-slate-500 mt-1">
                    {percent !== null ? `${percent}% overall attendance` : 'No attendance recorded yet'}
                </p>
            </div>

            {error && <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2 mb-4">{error}</p>}
            {loading && <p className="text-sm text-slate-400">Loading...</p>}

            {!loading && (
                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                    <table className="w-full text-sm">
                        <thead>
                        <tr className="border-b border-slate-100 text-left text-[11px] font-semibold tracking-wider text-slate-400">
                            <th className="px-6 py-3">DATE</th>
                            <th className="px-6 py-3">STATUS</th>
                        </tr>
                        </thead>
                        <tbody>
                        {records.length === 0 && <tr><td colSpan={2} className="px-6 py-8 text-center text-slate-400">No records yet.</td></tr>}
                        {records.map((r) => (
                            <tr key={r.id} className="border-b border-slate-50 last:border-0">
                                <td className="px-6 py-3 text-slate-700">{r.sessionDate}</td>
                                <td className="px-6 py-3">
                                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_STYLES[r.status]}`}>{r.status}</span>
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