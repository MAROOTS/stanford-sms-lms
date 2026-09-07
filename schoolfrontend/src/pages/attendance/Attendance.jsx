import { useEffect, useState, useCallback } from 'react';
import { Save, CheckCheck, ClipboardCheck, Loader2, Users, UserCheck } from 'lucide-react';
import axiosClient from '../../api/axiosClient';
import EmptyState from '../../components/shared/EmptyState';
import { useToast } from '../../context/useToast';

const STATUS_OPTIONS = ['PRESENT', 'ABSENT', 'LATE', 'EXCUSED'];

const STATUS_STYLES = {
    PRESENT: 'bg-emerald-50 text-emerald-700 border-emerald-200 font-semibold shadow-2xs',
    ABSENT: 'bg-rose-50 text-rose-700 border-rose-200 font-semibold shadow-2xs',
    LATE: 'bg-amber-50 text-amber-700 border-amber-200 font-semibold shadow-2xs',
    EXCUSED: 'bg-slate-100 text-slate-700 border-slate-300 font-semibold shadow-2xs',
};

const STATUS_DOTS = {
    PRESENT: 'bg-emerald-500',
    ABSENT: 'bg-rose-500',
    LATE: 'bg-amber-500',
    EXCUSED: 'bg-slate-400',
};

const STATUS_LABELS = {
    PRESENT: 'Present',
    ABSENT: 'Absent',
    LATE: 'Late',
    EXCUSED: 'Excused',
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

    const toast = useToast();

    useEffect(() => {
        axiosClient
            .get('/class-sections')
            .then((res) => setClassSections(res.data))
            .catch(() => setError('Could not load classes'));
    }, []);

    const loadSheet = useCallback(async () => {
        if (!classSectionId || !date) return;
        setLoading(true);
        setError('');
        setMessage('');
        try {
            const { data } = await axiosClient.get(`/class-sections/${classSectionId}/attendance/entry-sheet`, {
                params: { date },
            });
            setRows(data);
        } catch (err) {
            setError(err.response?.data?.message || 'Could not load attendance for this class');
            setRows([]);
        } finally {
            setLoading(false);
        }
    }, [classSectionId, date]);

    useEffect(() => {
        queueMicrotask(() => loadSheet());
    }, [loadSheet]);

    const setStatus = (studentId, status) => {
        setRows((prev) => prev.map((r) => (r.studentId === studentId ? { ...r, status } : r)));
    };

    const markAllPresent = () => {
        setRows((prev) => prev.map((r) => ({ ...r, status: 'PRESENT' })));
        toast.info('All students marked present');
    };

    const handleSave = async () => {
        const entries = rows.filter((r) => r.status).map((r) => ({ studentId: r.studentId, status: r.status }));
        if (entries.length === 0) {
            setError('Mark at least one student before saving');
            return;
        }

        setSaving(true);
        setError('');
        setMessage('');
        try {
            await axiosClient.post(`/class-sections/${classSectionId}/attendance`, { entries }, { params: { date } });
            setMessage('Attendance saved successfully');
            toast.success(`Attendance saved for ${date}`);
        } catch (err) {
            setError(err.response?.data?.message || 'Could not save attendance');
        } finally {
            setSaving(false);
        }
    };

    const counts = rows.reduce((acc, r) => {
        if (r.status) acc[r.status] = (acc[r.status] || 0) + 1;
        return acc;
    }, {});

    return (
        <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 animate-in fade-in duration-500">
            {/* HEADER */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">Attendance</h1>
                <p className="text-sm text-slate-500 mt-1.5">
                    Record and manage daily classroom attendance registers.
                </p>
            </div>

            {/* SELECTION BAR */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 mb-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs font-bold tracking-wider text-slate-400 uppercase mb-1.5">
                        Class Section
                    </label>
                    <select
                        value={classSectionId}
                        onChange={(e) => setClassSectionId(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-navy-900/20"
                    >
                        <option value="">Select class...</option>
                        {classSections.map((c) => (
                            <option key={c.id} value={c.id}>
                                {c.name} ({c.gradeLevelName})
                            </option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block text-xs font-bold tracking-wider text-slate-400 uppercase mb-1.5">
                        Date
                    </label>
                    <input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-navy-900/20"
                    />
                </div>
            </div>

            {/* ALERTS */}
            {error && (
                <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 text-sm font-medium text-rose-700 mb-6 shadow-sm">
                    {error}
                </div>
            )}
            {message && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-sm font-medium text-emerald-800 mb-6 shadow-sm">
                    {message}
                </div>
            )}

            {/* LOADING STATE */}
            {loading && (
                <div className="flex items-center justify-center py-20 bg-white rounded-2xl border border-slate-200 shadow-sm">
                    <Loader2 size={24} className="animate-spin text-slate-400 mr-2.5" />
                    <span className="text-sm font-medium text-slate-500">Loading attendance sheet...</span>
                </div>
            )}

            {/* ATTENDANCE SHEET TABLE */}
            {!loading && rows.length > 0 && (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-6">
                    {/* Summary & Quick Action Bar */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-6 py-4 border-b border-slate-200 bg-slate-50">
                        <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-slate-600">
                            <span className="inline-flex items-center gap-1.5 font-bold text-slate-900 pr-2 border-r border-slate-200">
                                <Users size={15} className="text-slate-400" />
                                {rows.length} Students
                            </span>
                            {Object.entries(counts).map(([status, count]) => (
                                <span key={status} className="inline-flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-lg border border-slate-200 shadow-2xs">
                                    <span className={`w-2 h-2 rounded-full ${STATUS_DOTS[status]}`} />
                                    <span className="text-slate-500">{STATUS_LABELS[status]}:</span>
                                    <strong className="text-slate-800">{count}</strong>
                                </span>
                            ))}
                        </div>

                        <button
                            type="button"
                            onClick={markAllPresent}
                            className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100/80 px-3 py-1.5 rounded-xl transition-all active:scale-[0.98] self-start sm:self-auto shadow-2xs"
                        >
                            <CheckCheck size={15} /> Mark All Present
                        </button>
                    </div>

                    <div className="overflow-x-auto custom-scrollbar">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-slate-50/50 border-b border-slate-200">
                            <tr className="text-[11px] font-bold tracking-wider text-slate-500 uppercase">
                                <th className="px-6 py-4">Student</th>
                                <th className="px-6 py-4">Status</th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                            {rows.map((r) => (
                                <tr key={r.studentId} className="group bg-white hover:bg-slate-50/80 transition-colors">
                                    <td className="px-6 py-4 font-semibold text-slate-900">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500">
                                                <UserCheck size={16} />
                                            </div>
                                            {r.studentName}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex gap-2 flex-wrap">
                                            {STATUS_OPTIONS.map((status) => {
                                                const isSelected = r.status === status;
                                                return (
                                                    <button
                                                        key={status}
                                                        type="button"
                                                        onClick={() => setStatus(r.studentId, status)}
                                                        className={`text-xs px-3.5 py-1.5 rounded-xl border transition-all active:scale-[0.97] ${
                                                            isSelected
                                                                ? STATUS_STYLES[status]
                                                                : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                                                        }`}
                                                    >
                                                        {STATUS_LABELS[status]}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Bottom Save Action Bar */}
                    <div className="p-4 bg-slate-50/50 border-t border-slate-200 flex justify-end">
                        <button
                            type="button"
                            onClick={handleSave}
                            disabled={saving}
                            className="flex items-center gap-2 bg-navy-900 hover:bg-navy-800 text-white text-sm font-semibold px-6 py-2.5 rounded-xl transition-all shadow-sm disabled:opacity-50 active:scale-[0.98]"
                        >
                            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                            {saving ? 'Saving...' : 'Save Attendance'}
                        </button>
                    </div>
                </div>
            )}

            {/* EMPTY STATE */}
            {!loading && classSectionId && rows.length === 0 && !error && (
                <EmptyState
                    icon={ClipboardCheck}
                    title="No students found"
                    description="No students are currently enrolled in this class section."
                />
            )}
        </div>
    );
}