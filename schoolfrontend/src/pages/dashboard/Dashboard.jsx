import { useEffect, useState, useCallback } from 'react';
import { Users, GraduationCap, Layers3, ShieldCheck, Download, ChevronDown, ArrowUp, ArrowDown, RefreshCw, TrendingUp, Calendar } from 'lucide-react';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import axiosClient from '../../api/axiosClient';
import { useAuth } from '../../context/AuthContext';
import { CardSkeleton } from '../../components/shared/LoadingSkeleton';
import OnboardingCard from '../../components/shared/OnboardingCard';

function greeting() {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
}

function TrendBadge({ value }) {
    if (value === null || value === undefined) {
        return <span className="text-xs text-slate-400 font-medium">—</span>;
    }
    const positive = value >= 0;
    return (
        <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${
            positive ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'
        }`}>
            {positive ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
            {Math.abs(value)}%
        </span>
    );
}

const statConfig = [
    { key: 'totalStudents', label: 'Total Students', icon: Users, gradient: 'from-blue-500 to-blue-600', bg: 'bg-blue-50', text: 'text-blue-700' },
    { key: 'totalTeachers', label: 'Total Teachers', icon: GraduationCap, gradient: 'from-accent-400 to-accent-500', bg: 'bg-accent-50', text: 'text-accent-700' },
    { key: 'activeClasses', label: 'Active Classes', icon: Layers3, gradient: 'from-amber-400 to-amber-500', bg: 'bg-amber-50', text: 'text-amber-700' },
    { key: 'attendanceToday', label: 'Attendance Today', icon: ShieldCheck, gradient: 'from-emerald-400 to-emerald-500', bg: 'bg-emerald-50', text: 'text-emerald-700', suffix: '%' },
];

export default function Dashboard() {
    const { user } = useAuth();
    const [summary, setSummary] = useState(null);
    const [terms, setTerms] = useState([]);
    const [selectedTermId, setSelectedTermId] = useState('');
    const [range, setRange] = useState('WEEK');
    const [trendData, setTrendData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        Promise.all([axiosClient.get('/dashboard/summary'), axiosClient.get('/terms')])
            .then(([summaryRes, termsRes]) => {
                setSummary(summaryRes.data);
                setTerms(termsRes.data);
                const current = termsRes.data.find((t) => t.isCurrent);
                if (current) setSelectedTermId(current.id.toString());
            })
            .catch(() => setError('Could not load dashboard data'))
            .finally(() => setLoading(false));
    }, []);

    const loadTrend = useCallback(async () => {
        try {
            const params = { range };
            if (range === 'TERM' && selectedTermId) params.termId = selectedTermId;
            const { data } = await axiosClient.get('/dashboard/attendance-trend', { params });
            setTrendData(data.map((d) => ({ ...d, label: d.date.slice(5) })));
        } catch {
            setTrendData([]);
        }
    }, [range, selectedTermId]);

    useEffect(() => { loadTrend(); }, [loadTrend]);

    const handleExport = () => {
        if (!summary) return;
        const rows = [
            ['Metric', 'Value', 'Change %'],
            ['Total Students', summary.totalStudents, summary.totalStudentsChangePercent ?? ''],
            ['Total Teachers', summary.totalTeachers, summary.totalTeachersChangePercent ?? ''],
            ['Active Classes', summary.activeClasses, summary.activeClassesChangePercent ?? ''],
            ['Attendance Today (%)', summary.attendanceToday ?? '', summary.attendanceTodayChangePercent ?? ''],
        ];
        const csv = rows.map((r) => r.join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `dashboard-report-${summary.asOfDate || 'today'}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    if (loading) {
        return (
            <div className="animate-fade-in">
                <div className="mb-6">
                    <div className="h-7 bg-surface-200 rounded-lg w-56 mb-2 animate-shimmer" />
                    <div className="h-4 bg-surface-100 rounded-lg w-72 animate-shimmer" />
                </div>
                <CardSkeleton count={4} />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center py-24 text-center animate-fade-in">
                <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mb-5">
                    <ShieldCheck size={28} className="text-red-400" />
                </div>
                <h3 className="text-lg font-bold text-slate-800 mb-1.5">Could not load dashboard</h3>
                <p className="text-sm text-slate-500 mb-6 max-w-sm">{error}</p>
                <button onClick={() => window.location.reload()}
                        className="flex items-center gap-2 bg-primary-800 hover:bg-primary-700 text-white text-sm font-medium px-5 py-2.5 rounded-xl transition-colors shadow-sm">
                    <RefreshCw size={16} /> Retry
                </button>
            </div>
        );
    }

    const today = new Date().toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

    return (
        <div className="animate-fade-in-up">
            {/* Onboarding card for new users */}
            <OnboardingCard />

            {/* Header */}
            <div className="flex items-start justify-between mb-8 flex-wrap gap-4">
                <div>
                    <h1 className="text-[26px] font-bold text-slate-900 tracking-tight">
                        {greeting()}, {user?.firstName || 'there'} 👋
                    </h1>
                    <p className="text-sm text-slate-500 mt-1.5 flex items-center gap-1.5">
                        <Calendar size={14} className="text-slate-400" />
                        {today}
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <select value={selectedTermId} onChange={(e) => setSelectedTermId(e.target.value)}
                                className="appearance-none pl-4 pr-9 py-2.5 rounded-xl border border-surface-200 text-sm font-medium text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-accent-500/30 cursor-pointer shadow-sm hover:border-surface-300 transition-colors">
                            {terms.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
                        </select>
                        <ChevronDown size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>
                    <button onClick={handleExport}
                            className="flex items-center gap-2 bg-white hover:bg-surface-50 text-slate-700 text-sm font-medium px-4 py-2.5 rounded-xl border border-surface-200 shadow-sm hover:border-surface-300 transition-all">
                        <Download size={16} /> Export
                    </button>
                </div>
            </div>

            {/* Stat cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
                {statConfig.map(({ key, label, icon: Icon, gradient}) => {
                    const value = summary?.[key];
                    const change = summary?.[`${key}ChangePercent`];
                    const displayValue = key === 'attendanceToday' && value !== null && value !== undefined
                        ? `${value}%`
                        : value ?? '—';

                    return (
                        <div key={key}
                             className="group bg-white rounded-2xl border border-surface-200 p-5 shadow-card hover:shadow-elevated transition-all duration-300 hover:-translate-y-0.5">
                            <div className="flex items-center justify-between mb-4">
                                <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-md`}>
                                    <Icon size={20} className="text-white" />
                                </div>
                                <TrendBadge value={change} />
                            </div>
                            <p className="text-[28px] font-bold text-slate-900 tracking-tight">{displayValue}</p>
                            <p className="text-sm text-slate-500 mt-1 font-medium">{label}</p>
                        </div>
                    );
                })}
            </div>

            {/* Chart */}
            <div className="bg-white rounded-2xl border border-surface-200 shadow-card p-6">
                <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
                    <div>
                        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                            <TrendingUp size={18} className="text-accent-500" />
                            Attendance Trend
                        </h2>
                        <p className="text-sm text-slate-500 mt-0.5">Daily average attendance across all classes</p>
                    </div>
                    <div className="flex gap-1 bg-surface-100 rounded-xl p-1">
                        {['WEEK', 'MONTH', 'TERM'].map((r) => (
                            <button key={r} onClick={() => setRange(r)}
                                    className={`text-xs font-semibold px-4 py-2 rounded-lg transition-all duration-200 ${
                                        range === r ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                                    }`}>
                                {r.charAt(0) + r.slice(1).toLowerCase()}
                            </button>
                        ))}
                    </div>
                </div>

                {trendData.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                        <div className="w-14 h-14 rounded-2xl bg-surface-100 flex items-center justify-center mb-4">
                            <TrendingUp size={24} className="text-slate-300" />
                        </div>
                        <p className="text-sm text-slate-400 font-medium">No attendance data recorded for this period yet.</p>
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={trendData}>
                            <defs>
                                <linearGradient id="attendanceGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#14b8a6" stopOpacity={0.2} />
                                    <stop offset="100%" stopColor="#14b8a6" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" strokeWidth={1} />
                            <XAxis dataKey="label" tick={{ fontSize: 12, fill: '#94a3b8', fontWeight: 500 }} axisLine={false} tickLine={false} dy={8} />
                            <YAxis domain={[0, 100]} tick={{ fontSize: 12, fill: '#94a3b8', fontWeight: 500 }} axisLine={false} tickLine={false} unit="%" dx={-4} />
                            <Tooltip
                                contentStyle={{
                                    borderRadius: '12px',
                                    border: '1px solid #e2e8f0',
                                    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.06)',
                                    padding: '8px 12px',
                                    fontSize: '13px',
                                }}
                                formatter={(value) => [`${value}%`, 'Attendance']}
                            />
                            <Area type="monotone" dataKey="attendancePercentage" stroke="#14b8a6" strokeWidth={2.5} fill="url(#attendanceGradient)" dot={{ r: 4, fill: '#14b8a6', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6, fill: '#14b8a6', strokeWidth: 2, stroke: '#fff' }} />
                        </AreaChart>
                    </ResponsiveContainer>
                )}
            </div>
        </div>
    );
}
