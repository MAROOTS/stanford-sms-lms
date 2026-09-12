import { useCallback, useEffect, useState } from 'react';
import {
    Calendar,
    Clock,
    Plus,
    Users,
    Coffee,
    BookOpen,
    Layers,
    AlertCircle,
    Zap
} from 'lucide-react';
import axiosClient from '../../api/axiosClient';
import { useToast } from '../../context/useToast';

const DAYS = [
    { n: 1, label: 'Monday', short: 'Mon' },
    { n: 2, label: 'Tuesday', short: 'Tue' },
    { n: 3, label: 'Wednesday', short: 'Wed' },
    { n: 4, label: 'Thursday', short: 'Thu' },
    { n: 5, label: 'Friday', short: 'Fri' },
];

export default function Timetable() {
    const toast = useToast();
    const [periods, setPeriods] = useState([]);
    const [classes, setClasses] = useState([]);
    const [assignments, setAssignments] = useState([]);
    const [classId, setClassId] = useState('');
    const [slots, setSlots] = useState([]);
    const [error, setError] = useState('');
    const [name, setName] = useState('');
    const [startTime, setStartTime] = useState('08:00');
    const [endTime, setEndTime] = useState('08:40');
    const [sortOrder, setSortOrder] = useState(1);
    const [breakPeriod, setBreakPeriod] = useState(false);
    const [savingCell, setSavingCell] = useState(null);

    const loadMeta = useCallback(async () => {
        const [p, c, a] = await Promise.all([
            axiosClient.get('/timetable/periods'),
            axiosClient.get('/class-sections'),
            axiosClient.get('/teaching-assignments'),
        ]);
        setPeriods(p.data);
        setClasses(c.data);
        setAssignments(a.data);
        setSortOrder((p.data[p.data.length - 1]?.sortOrder || 0) + 1);
    }, []);

    useEffect(() => {
        loadMeta().catch(() => setError('Could not load timetable metadata'));
    }, [loadMeta]);

    const loadGrid = async (id) => {
        if (!id) {
            setSlots([]);
            return;
        }
        try {
            const { data } = await axiosClient.get(`/timetable/classes/${id}`);
            setSlots(data.slots || []);
            setPeriods(data.periods || []);
        } catch {
            setError('Could not load grid for the selected class');
        }
    };

    const slotAt = (day, periodId) =>
        slots.find((s) => s.dayOfWeek === day && s.periodId === periodId);

    const handleCell = async (day, period, assignmentId) => {
        setError('');
        const cellKey = `${day}-${period.id}`;
        setSavingCell(cellKey);
        try {
            await axiosClient.put(`/timetable/classes/${classId}/slots`, {
                dayOfWeek: day,
                periodId: period.id,
                teachingAssignmentId: assignmentId ? Number(assignmentId) : null,
            });
            await loadGrid(classId);
            toast.success('Slot updated');
        } catch (err) {
            const data = err.response?.data;
            setError(data?.detail || data?.message || 'Could not save slot assignment');
        } finally {
            setSavingCell(null);
        }
    };

    const addPeriod = async (e) => {
        e.preventDefault();
        setError('');
        try {
            await axiosClient.post('/timetable/periods', {
                name,
                sortOrder: Number(sortOrder),
                startTime,
                endTime,
                breakPeriod,
            });
            setName('');
            toast.success('Period added successfully');
            await loadMeta();
            if (classId) await loadGrid(classId);
        } catch (err) {
            setError(err.response?.data?.detail || err.response?.data?.message || 'Could not add period');
        }
    };

    const seed = async () => {
        setError('');
        try {
            await axiosClient.post('/timetable/periods/defaults');
            toast.success('Default periods created');
            await loadMeta();
        } catch (err) {
            setError(err.response?.data?.detail || err.response?.data?.message || 'Could not seed default periods');
        }
    };

    const classAssignments = assignments.filter((a) => String(a.classSectionId) === String(classId));

    return (
        <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 animate-in fade-in duration-500">
            {/* HEADER */}
            <div className="mb-8">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-navy-900/5 text-navy-900 text-xs font-semibold mb-2">
                    <Calendar size={13} />
                    Timetable Builder
                </div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                    Master Timetable Management
                </h1>
                <p className="text-sm text-slate-500 mt-1.5">
                    Configure daily periods for the school, then assign teaching allocations onto class schedules.
                </p>
            </div>

            {/* ERROR ALERT */}
            {error && (
                <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 mb-6 flex items-start gap-3 shadow-2xs">
                    <AlertCircle className="text-rose-600 shrink-0 mt-0.5" size={18} />
                    <p className="text-sm font-medium text-rose-700">{error}</p>
                </div>
            )}

            {/* PERIOD CONFIGURATION CARD */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 mb-8">
                <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                        <div className="p-2 rounded-xl bg-navy-900/5 text-navy-900">
                            <Layers size={18} />
                        </div>
                        <div>
                            <h2 className="font-semibold text-slate-900 text-base">School Periods</h2>
                            <p className="text-xs text-slate-500">Define period blocks, breaks, and daily timing structure.</p>
                        </div>
                    </div>
                    {periods.length === 0 && (
                        <button
                            type="button"
                            onClick={seed}
                            className="inline-flex items-center gap-1.5 text-xs font-semibold px-3.5 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 transition-colors cursor-pointer"
                        >
                            <Zap size={14} />
                            Seed Defaults (P1–P8 + Breaks)
                        </button>
                    )}
                </div>

                {/* PERIOD CHIPS */}
                <div className="flex flex-wrap gap-2 mb-6">
                    {periods.length === 0 ? (
                        <p className="text-xs text-slate-400 italic py-2">No periods configured yet. Add one below or seed default periods.</p>
                    ) : (
                        periods.map((p) => (
                            <div
                                key={p.id}
                                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-medium ${
                                    p.breakPeriod
                                        ? 'bg-amber-50/70 border-amber-200 text-amber-800'
                                        : 'bg-slate-50 border-slate-200 text-slate-700'
                                }`}
                            >
                                {p.breakPeriod ? <Coffee size={13} className="text-amber-600" /> : <Clock size={13} className="text-slate-400" />}
                                <span className="font-semibold">{p.name}</span>
                                <span className="text-slate-400">
                                    ({p.startTime?.slice(0, 5)}–{p.endTime?.slice(0, 5)})
                                </span>
                            </div>
                        ))
                    )}
                </div>

                {/* ADD PERIOD FORM */}
                <form onSubmit={addPeriod} className="pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-6 lg:grid-cols-12 gap-3 items-end">
                    <div className="md:col-span-2 lg:col-span-3">
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                            Period Name
                        </label>
                        <input
                            required
                            placeholder="e.g. P1 or Lunch"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-navy-900/20 focus:border-navy-900 transition-all"
                        />
                    </div>

                    <div className="md:col-span-1 lg:col-span-2">
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                            Order #
                        </label>
                        <input
                            type="number"
                            value={sortOrder}
                            onChange={(e) => setSortOrder(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-navy-900/20 focus:border-navy-900 transition-all"
                        />
                    </div>

                    <div className="md:col-span-1 lg:col-span-2">
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                            Start Time
                        </label>
                        <input
                            type="time"
                            value={startTime}
                            onChange={(e) => setStartTime(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-navy-900/20 focus:border-navy-900 transition-all"
                        />
                    </div>

                    <div className="md:col-span-1 lg:col-span-2">
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                            End Time
                        </label>
                        <input
                            type="time"
                            value={endTime}
                            onChange={(e) => setEndTime(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-navy-900/20 focus:border-navy-900 transition-all"
                        />
                    </div>

                    <div className="md:col-span-1 lg:col-span-1 flex items-center h-9">
                        <label className="inline-flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer select-none">
                            <input
                                type="checkbox"
                                checked={breakPeriod}
                                onChange={(e) => setBreakPeriod(e.target.checked)}
                                className="w-4 h-4 rounded-md text-navy-900 border-slate-300 focus:ring-navy-900/20"
                            />
                            Break
                        </label>
                    </div>

                    <div className="md:col-span-6 lg:col-span-2">
                        <button
                            type="submit"
                            className="w-full inline-flex items-center justify-center gap-1.5 bg-navy-900 hover:bg-navy-800 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-all shadow-xs cursor-pointer active:scale-98"
                        >
                            <Plus size={14} /> Add Period
                        </button>
                    </div>
                </form>
            </div>

            {/* CLASS SELECTOR CONTROL BAR */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-slate-100 text-slate-700">
                        <Users size={18} />
                    </div>
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                            Select Class Section
                        </label>
                        <span className="text-xs text-slate-400">Choose a class to view and edit its weekly grid.</span>
                    </div>
                </div>

                <select
                    value={classId}
                    onChange={(e) => {
                        setClassId(e.target.value);
                        loadGrid(e.target.value);
                    }}
                    className="w-full sm:w-64 px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-navy-900/20 focus:border-navy-900 transition-all cursor-pointer"
                >
                    <option value="">Select class...</option>
                    {classes.map((c) => (
                        <option key={c.id} value={c.id}>
                            {c.name} {c.gradeLevelName ? `(${c.gradeLevelName})` : ''}
                        </option>
                    ))}
                </select>
            </div>

            {/* TIMETABLE MATRIX TABLE */}
            {classId && periods.length > 0 && (
                <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
                    <div className="px-6 py-4 bg-slate-50/50 border-b border-slate-200 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <BookOpen size={16} className="text-navy-900" />
                            <h3 className="font-semibold text-slate-900 text-sm">
                                Grid Allocations
                            </h3>
                        </div>
                        <span className="text-xs text-slate-500 font-medium">
                            {classAssignments.length} Teaching Assignments Available
                        </span>
                    </div>

                    <div className="overflow-x-auto custom-scrollbar">
                        <table className="w-full text-sm text-left border-collapse min-w-[750px]">
                            <thead>
                            <tr className="bg-slate-50/40 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
                                <th className="px-4 py-3.5 w-36 border-r border-slate-100">
                                    Period
                                </th>
                                {DAYS.map((d) => (
                                    <th key={d.n} className="px-4 py-3.5 text-center">
                                        <span className="hidden sm:inline">{d.label}</span>
                                        <span className="sm:hidden">{d.short}</span>
                                    </th>
                                ))}
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                            {periods.map((p) => (
                                <tr key={p.id} className="hover:bg-slate-50/30 transition-colors">
                                    {/* PERIOD HEADER CELL */}
                                    <td className="px-4 py-3.5 bg-slate-50/20 border-r border-slate-100 align-top">
                                        <div className="font-semibold text-slate-900 text-xs sm:text-sm">
                                            {p.name}
                                        </div>
                                        {p.startTime && (
                                            <div className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-400 mt-1">
                                                <Clock size={11} />
                                                {String(p.startTime).slice(0, 5)}
                                            </div>
                                        )}
                                    </td>

                                    {/* DAY SLOTS */}
                                    {DAYS.map((d) => {
                                        const s = slotAt(d.n, p.id);
                                        const cellKey = `${d.n}-${p.id}`;
                                        const isSaving = savingCell === cellKey;

                                        if (p.breakPeriod) {
                                            return (
                                                <td
                                                    key={d.n}
                                                    className="px-2 py-2 bg-slate-50/60 border-r border-slate-100/60 last:border-r-0 text-center align-middle"
                                                >
                                                    <div className="inline-flex items-center justify-center gap-1.5 text-xs font-medium text-slate-400 py-2.5 px-3 rounded-xl border border-dashed border-slate-200/80 bg-white/50 w-full">
                                                        <Coffee size={13} className="text-amber-500/70" />
                                                        <span>Break</span>
                                                    </div>
                                                </td>
                                            );
                                        }

                                        return (
                                            <td
                                                key={d.n}
                                                className="px-2 py-2 border-r border-slate-100/60 last:border-r-0 align-top"
                                            >
                                                <div className="relative">
                                                    <select
                                                        value={s?.teachingAssignmentId || ''}
                                                        onChange={(e) => handleCell(d.n, p, e.target.value)}
                                                        className={`w-full px-2.5 py-2 rounded-xl border text-xs font-medium transition-all focus:outline-none focus:ring-2 focus:ring-navy-900/20 cursor-pointer ${
                                                            s?.teachingAssignmentId
                                                                ? 'bg-slate-50 border-slate-300 text-slate-900 font-semibold'
                                                                : 'bg-white border-slate-200 text-slate-400 hover:border-slate-300'
                                                        }`}
                                                    >
                                                        <option value="" className="text-slate-400">
                                                            -- Unassigned --
                                                        </option>
                                                        {classAssignments.map((a) => (
                                                            <option key={a.id} value={a.id} className="text-slate-800">
                                                                {a.subjectName} · {a.teacherName}
                                                            </option>
                                                        ))}
                                                    </select>
                                                    {isSaving && (
                                                        <div className="absolute right-2 top-2.5 pointer-events-none">
                                                            <div className="w-3 h-3 border-2 border-navy-900 border-t-transparent rounded-full animate-spin" />
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}