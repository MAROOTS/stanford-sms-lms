import { useEffect, useState, useCallback } from 'react';
import { Users, GraduationCap, Layers3, ShieldCheck, Download, ChevronDown, ArrowUp, ArrowDown } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import axiosClient from '../../api/axiosClient';
import { useAuth } from '../../context/AuthContext';

function greeting() {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
}

function TrendBadge({ value }) {
    if (value === null || value === undefined) {
        return <span className="text-xs text-slate-400">—</span>;
    }
    const positive = value >= 0;
    return (
        <span className={`flex items-center gap-0.5 text-xs font-medium px-2 py-1 rounded-full ${
            positive ? 'bg-teal-accent/15 text-teal-700' : 'bg-red-50 text-red-600'
        }`}>
      {positive ? <ArrowUp size={11} /> : <ArrowDown size={11} />}
            {Math.abs(value)}%
    </span>
    );
}

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
        a.download = `dashboard-report-${summary.asOfDate}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    if (loading) return <p className="text-sm text-slate-400">Loading dashboard...</p>;
    if (error) return <p className="text-sm text-red-500">{error}</p>;

    const today = new Date().toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

    const cards = [
        { label: 'Total Students', value: summary.totalStudents, change: summary.totalStudentsChangePercent, icon: Users, color: 'text-slate-600 bg-slate-100' },
        { label: 'Total Teachers', value: summary.totalTeachers, change: summary.totalTeachersChangePercent, icon: GraduationCap, color: 'text-teal-700 bg-teal-accent/15' },
        { label: 'Active Classes', value: summary.activeClasses, change: summary.activeClassesChangePercent, icon: Layers3, color: 'text-amber-700 bg-amber-50' },
        { label: 'Attendance Today', value: summary.attendanceToday !== null ? `${summary.attendanceToday}%` : '—', change: summary.attendanceTodayChangePercent, icon: ShieldCheck, color: 'text-emerald-700 bg-emerald-50' },
    ];

    return (
        <div>
            <div className="flex items-start justify-between mb-6 flex-wrap gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">{greeting()}, {user?.firstName || 'there'}</h1>
                    <p className="text-sm text-slate-500 mt-1">Here's what's happening at your school today, {today}.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <select value={selectedTermId} onChange={(e) => setSelectedTermId(e.target.value)}
                                className="appearance-none pl-4 pr-8 py-2.5 rounded-lg border border-slate-200 text-sm font-medium text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-teal-accent">
                            {terms.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
                        </select>
                        <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>
                    <button onClick={handleExport}
                            className="flex items-center gap-1.5 bg-navy-900 hover:bg-navy-800 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors">
                        <Download size={16} /> Export report
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {cards.map((c) => (
                    <div key={c.label} className="bg-white rounded-xl border border-slate-200 p-5">
                        <div className="flex items-center justify-between mb-4">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${c.color}`}>
                                <c.icon size={18} />
                            </div>
                            <TrendBadge value={c.change} />
                        </div>
                        <p className="text-2xl font-bold text-slate-900">{c.value}</p>
                        <p className="text-sm text-slate-500 mt-1">{c.label}</p>
                    </div>
                ))}
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-5">
                <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
                    <div>
                        <h2 className="text-base font-bold text-slate-900">Attendance Trend</h2>
                        <p className="text-sm text-slate-500">Daily average attendance across all classes</p>
                    </div>
                    <div className="flex gap-1 bg-slate-100 rounded-lg p-1">
                        {['WEEK', 'MONTH', 'TERM'].map((r) => (
                            <button key={r} onClick={() => setRange(r)}
                                    className={`text-xs font-medium px-3 py-1.5 rounded-md transition-colors ${
                                        range === r ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                                    }`}>
                                {r.charAt(0) + r.slice(1).toLowerCase()}
                            </button>
                        ))}
                    </div>
                </div>

                {trendData.length === 0 ? (
                    <p className="text-sm text-slate-400 py-8 text-center">No attendance data recorded for this period yet.</p>
                ) : (
                    <ResponsiveContainer width="100%" height={280}>
                        <LineChart data={trendData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                            <XAxis dataKey="label" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                            <YAxis domain={[0, 100]} tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} unit="%" />
                            <Tooltip formatter={(value) => [`${value}%`, 'Attendance']} />
                            <Line type="monotone" dataKey="attendancePercentage" stroke="#14b8a6" strokeWidth={2.5} dot={{ r: 3 }} />
                        </LineChart>
                    </ResponsiveContainer>
                )}
            </div>
        </div>
    );
}