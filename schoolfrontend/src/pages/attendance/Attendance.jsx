import { useEffect, useState, useCallback } from 'react';
import { Save, CheckCheck } from 'lucide-react';
import axiosClient from '../../api/axiosClient';

const STATUS_OPTIONS = ['PRESENT', 'ABSENT', 'LATE', 'EXCUSED'];
const STATUS_STYLES = {
    PRESENT: 'bg-teal-accent/15 text-teal-700 border-teal-accent',
    ABSENT: 'bg-red-50 text-red-600 border-red-200',
    LATE: 'bg-amber-50 text-amber-700 border-amber-200',
    EXCUSED: 'bg-slate-100 text-slate-600 border-slate-300',
};

function todayISO() {
    return new Date().toISOString().slice(0, 10);
}

export default function Attendance() {
    const [classSections, setClassSections] = useState([]);
    const [classSectionId, setClassSectionId] = useState('');
    const [date, setDate] = useState(todayISO());
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        axiosClient.get('/class-sections').then((res) => setClassSections(res.data)).catch(() => setError('Could not load classes'));
    }, []);

    const loadSheet = useCallback(async () => {
        if (!classSectionId || !date) return;
        setLoading(true); setError(''); setMessage('');
        try {
            const { data } = await axiosClient.get(`/class-sections/${classSectionId}/attendance/entry-sheet`, { params: { date } });
            setRows(data);
        } catch (err) {
            setError(err.response?.data?.message || 'Could not load attendance for this class');
            setRows([]);
        } finally { setLoading(false); }
    }, [classSectionId, date]);

    useEffect(() => { loadSheet(); }, [loadSheet]);

    const setStatus = (studentId, status) => {
        setRows((prev) => prev.map((r) => (r.studentId === studentId ? { ...r, status } : r)));
    };

    const markAllPresent = () => {
        setRows((prev) => prev.map((r) => ({ ...r, status: 'PRESENT' })));
    };

    const handleSave = async () => {
        const entries = rows.filter((r) => r.status).map((r) => ({ studentId: r.studentId, status: r.status }));
        if (entries.length === 0) { setError('Mark at least one student before saving'); return; }

        setSaving(true); setError(''); setMessage('');
        try {
            await axiosClient.post(`/class-sections/${classSectionId}/attendance`, { entries }, { params: { date } });
            setMessage('Attendance saved successfully');
        } catch (err) {
            setError(err.response?.data?.message || 'Could not save attendance');
        } finally { setSaving(false); }
    };

    return (
        <div>
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-slate-900">Attendance</h1>
                <p className="text-sm text-slate-500 mt-1">Take daily attendance for a class.</p>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-5 mb-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Class</label>
                    <select value={classSectionId} onChange={(e) => setClassSectionId(e.target.value)}
                            className="w-full px-3 py-2.5 rounded-lg bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-accent">
                        <option value="">Select class...</option>
                        {classSections.map((c) => <option key={c.id} value={c.id}>{c.name} ({c.gradeLevelName})</option>)}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Date</label>
                    <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
                           className="w-full px-3 py-2.5 rounded-lg bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-accent" />
                </div>
            </div>

            {error && <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2 mb-4">{error}</p>}
            {message && <p className="text-sm text-teal-700 bg-teal-50 border border-teal-100 rounded-lg px-3 py-2 mb-4">{message}</p>}
            {loading && <p className="text-sm text-slate-400">Loading attendance sheet...</p>}

            {!loading && rows.length > 0 && (
                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                    <div className="flex items-center justify-between px-6 py-3 border-b border-slate-100">
                        <p className="text-sm text-slate-500">{rows.length} students</p>
                        <button onClick={markAllPresent} className="flex items-center gap-1.5 text-sm font-medium text-teal-600 hover:text-teal-700">
                            <CheckCheck size={16} /> Mark all present
                        </button>
                    </div>

                    <table className="w-full text-sm">
                        <thead>
                        <tr className="border-b border-slate-100 text-left text-[11px] font-semibold tracking-wider text-slate-400">
                            <th className="px-6 py-3">STUDENT</th>
                            <th className="px-6 py-3">STATUS</th>
                        </tr>
                        </thead>
                        <tbody>
                        {rows.map((r) => (
                            <tr key={r.studentId} className="border-b border-slate-50 last:border-0">
                                <td className="px-6 py-3 font-medium text-slate-800">{r.studentName}</td>
                                <td className="px-6 py-3">
                                    <div className="flex gap-2">
                                        {STATUS_OPTIONS.map((status) => (
                                            <button
                                                key={status}
                                                type="button"
                                                onClick={() => setStatus(r.studentId, status)}
                                                className={`text-xs font-medium px-3 py-1.5 rounded-full border transition-colors ${
                                                    r.status === status ? STATUS_STYLES[status] : 'bg-white text-slate-400 border-slate-200 hover:border-slate-300'
                                                }`}
                                            >
                                                {status}
                                            </button>
                                        ))}
                                    </div>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>

                    <div className="p-4 border-t border-slate-100 flex justify-end">
                        <button onClick={handleSave} disabled={saving}
                                className="flex items-center gap-1.5 bg-navy-900 hover:bg-navy-800 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors disabled:opacity-60">
                            <Save size={16} /> {saving ? 'Saving...' : 'Save attendance'}
                        </button>
                    </div>
                </div>
            )}

            {!loading && classSectionId && rows.length === 0 && !error && (
                <p className="text-sm text-slate-400">No students found in this class.</p>
            )}
        </div>
    );
}