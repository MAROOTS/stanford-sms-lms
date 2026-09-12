import { useEffect, useState } from 'react';
import {
    Calendar,
    Clock,
    User,
    MapPin,
    Coffee,
    BookOpen,
    AlertCircle,
    RotateCcw,
    Users
} from 'lucide-react';
import axiosClient from '../../api/axiosClient';
import EmptyState from '../../components/shared/EmptyState';
import { TableSkeleton } from '../../components/shared/LoadingSkeleton';

const DAYS = [
    { n: 1, label: 'Monday', short: 'Mon' },
    { n: 2, label: 'Tuesday', short: 'Tue' },
    { n: 3, label: 'Wednesday', short: 'Wed' },
    { n: 4, label: 'Thursday', short: 'Thu' },
    { n: 5, label: 'Friday', short: 'Fri' },
];

export default function MyTimetable() {
    const [periods, setPeriods] = useState([]);
    const [slots, setSlots] = useState([]);
    const [className, setClassName] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);

    const loadTimetable = () => {
        setLoading(true);
        setError('');
        axiosClient
            .get('/timetable/me')
            .then(({ data }) => {
                setPeriods(data.periods || []);
                setSlots(data.slots || []);
                setClassName(data.classSectionName);
            })
            .catch((err) => {
                const d = err.response?.data;
                setError(d?.detail || d?.message || 'Could not load timetable');
            })
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        loadTimetable();
    }, []);

    const slotAt = (day, periodId) =>
        slots.find((s) => s.dayOfWeek === day && s.periodId === periodId);

    return (
        <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 animate-in fade-in duration-500">
            {/* HEADER */}
            <div className="mb-8">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-navy-900/5 text-navy-900 text-xs font-semibold mb-2">
                    <Calendar size={13} />
                    Schedule & Lessons
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                            My Timetable
                        </h1>
                        <p className="text-sm text-slate-500 mt-1">
                            {className
                                ? `Weekly schedule for ${className}`
                                : 'Your lessons and break times for this week.'}
                        </p>
                    </div>
                    {className && (
                        <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-100 border border-slate-200/80 text-xs font-semibold text-slate-700 w-fit">
                            <Users size={14} className="text-navy-900" />
                            {className}
                        </div>
                    )}
                </div>
            </div>

            {/* ERROR STATE */}
            {error && (
                <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 text-center shadow-2xs mb-6">
                    <div className="flex justify-center mb-2">
                        <AlertCircle className="text-rose-600" size={24} />
                    </div>
                    <p className="text-rose-700 font-medium text-sm mb-3">{error}</p>
                    <button
                        type="button"
                        onClick={loadTimetable}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-800 hover:text-rose-900 underline underline-offset-4 cursor-pointer"
                    >
                        <RotateCcw size={14} /> Try again
                    </button>
                </div>
            )}

            {/* LOADING STATE */}
            {loading && <TableSkeleton columns={6} rows={6} />}

            {/* UNASSIGNED OR EMPTY STATE */}
            {!loading && !error && periods.length === 0 && (
                <EmptyState
                    icon={Calendar}
                    title="No timetable set up"
                    description="No timetable periods or slots have been configured for your schedule yet."
                />
            )}

            {!loading && !error && !className && slots.length === 0 && periods.length > 0 && (
                <EmptyState
                    icon={BookOpen}
                    title="No class assigned"
                    description="You are not currently assigned to a class section or there are no lessons on your grid."
                />
            )}

            {/* TIMETABLE GRID */}
            {!loading && !error && periods.length > 0 && (
                <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
                    <div className="px-6 py-4 bg-slate-50/50 border-b border-slate-200 flex items-center justify-between">
                        <h3 className="font-semibold text-slate-900 text-sm">Weekly Grid</h3>
                        <span className="text-xs text-slate-500 font-medium">
                            {periods.length} Periods Daily
                        </span>
                    </div>

                    <div className="overflow-x-auto custom-scrollbar">
                        <table className="w-full text-sm text-left border-collapse min-w-[700px]">
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
                                    {/* PERIOD CELL */}
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

                                        if (p.breakPeriod) {
                                            return (
                                                <td
                                                    key={d.n}
                                                    className="px-2 py-2 bg-slate-50/60 border-r border-slate-100/60 last:border-r-0 text-center align-middle"
                                                >
                                                    <div className="inline-flex items-center justify-center gap-1.5 text-xs font-medium text-slate-400 py-2.5 px-3 rounded-xl border border-dashed border-slate-200/80 bg-white/50 w-full">
                                                        <Coffee size={13} className="text-amber-500/70" />
                                                        <span>{p.name}</span>
                                                    </div>
                                                </td>
                                            );
                                        }

                                        return (
                                            <td
                                                key={d.n}
                                                className="px-2 py-2 border-r border-slate-100/60 last:border-r-0 align-top"
                                            >
                                                {s?.subjectName ? (
                                                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 hover:border-slate-300 transition-all shadow-2xs space-y-1.5 h-full flex flex-col justify-between">
                                                        <div className="font-semibold text-slate-900 text-xs sm:text-sm leading-snug">
                                                            {s.subjectName}
                                                        </div>

                                                        <div className="space-y-1 text-[11px] text-slate-500">
                                                            {s.classSectionName && (
                                                                <div className="flex items-center gap-1.5 font-medium text-slate-700">
                                                                    <Users size={12} className="shrink-0 text-slate-400" />
                                                                    <span className="truncate">{s.classSectionName}</span>
                                                                </div>
                                                            )}
                                                            {s.teacherName && (
                                                                <div className="flex items-center gap-1.5">
                                                                    <User size={12} className="shrink-0 text-slate-400" />
                                                                    <span className="truncate">{s.teacherName}</span>
                                                                </div>
                                                            )}
                                                            {s.room && (
                                                                <div className="flex items-center gap-1.5 text-slate-400">
                                                                    <MapPin size={12} className="shrink-0 text-slate-400" />
                                                                    <span className="truncate">{s.room}</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="h-full min-h-[60px] flex items-center justify-center text-slate-300 text-xs font-light">
                                                        —
                                                    </div>
                                                )}
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