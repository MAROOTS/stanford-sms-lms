import { useEffect, useState } from 'react';
import {
    Users,
    GraduationCap,
    Wallet,
    TrendingDown,
    MessageSquare,
    Library,
    AlertTriangle,
} from 'lucide-react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area,
    CartesianGrid,
} from 'recharts';
import axiosClient from '../../api/axiosClient';
import NoticeCard from '../../components/shared/NoticeCard';
import { readApiError } from '../../utils/readApiError';

const formatKES = (value) =>
    'KES ' + Number(value || 0).toLocaleString('en-KE', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    });

function Kpi({ icon: Icon, label, value, hint, tone }) {
    const tones = {
        blue: 'bg-blue-50 border-blue-100 text-blue-600',
        teal: 'bg-teal-50 border-teal-100 text-teal-600',
        navy: 'bg-slate-900/5 border-slate-200 text-navy-900',
        rose: 'bg-rose-50 border-rose-100 text-rose-600',
        amber: 'bg-amber-50 border-amber-100 text-amber-600',
        violet: 'bg-violet-50 border-violet-100 text-violet-600',
    };
    return (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex items-start gap-4">
            <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center shrink-0 ${tones[tone]}`}>
                <Icon size={22} />
            </div>
            <div className="min-w-0">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{label}</p>
                <p className="text-2xl font-bold text-slate-900 tracking-tight mt-0.5 truncate">{value}</p>
                {hint && <p className="text-xs text-slate-500 mt-1">{hint}</p>}
            </div>
        </div>
    );
}

export default function Analytics() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const load = () => {
        setLoading(true);
        setError('');
        axiosClient.get('/analytics/overview')
            .then((res) => setData(res.data))
            .catch((err) => {
                if (err.response?.status === 401) return;
                setError(readApiError(err, { error: 'Could not load analytics' }).description);
            })
            .finally(() => setLoading(false));
    };

    useEffect(() => { load(); }, []);

    return (
        <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 animate-in fade-in duration-500">
            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">Analytics</h1>
                <p className="text-sm text-slate-500 mt-1.5">
                    Enrolment, fees, SMS and library for this school
                    {data?.termName ? ` · ${data.termName}` : ''}.
                </p>
            </div>

            {error && (
                <div className="mb-8">
                    <NoticeCard
                        notice={{ kind: 'error', title: 'Could not load analytics', description: error }}
                        onRetry={load}
                    />
                </div>
            )}

            {loading && (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="h-28 rounded-2xl bg-slate-100 animate-pulse" />
                    ))}
                </div>
            )}

            {data && (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
                        <Kpi icon={Users} tone="blue" label="Students" value={data.students.toLocaleString()} />
                        <Kpi icon={GraduationCap} tone="teal" label="Teachers" value={data.teachers.toLocaleString()} />
                        <Kpi
                            icon={Wallet}
                            tone="navy"
                            label="Collected this term"
                            value={formatKES(data.collected)}
                            hint={`Billed ${formatKES(data.billed)}`}
                        />
                        <Kpi
                            icon={TrendingDown}
                            tone="rose"
                            label="Outstanding"
                            value={formatKES(data.outstanding)}
                            hint={data.termName || 'No current term'}
                        />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-sm">
                            <h2 className="text-base font-bold text-slate-900">Collection last 6 months</h2>
                            <p className="text-sm text-slate-500 mb-4">Payments recorded, by month</p>
                            <div className="h-64 sm:h-72">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={data.collectionMonthly || []}>
                                        <defs>
                                            <linearGradient id="collectFill" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="0%" stopColor="#14b8a6" stopOpacity={0.35} />
                                                <stop offset="100%" stopColor="#14b8a6" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                        <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                                        <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} tickFormatter={(v) => `${Math.round(v / 1000)}k`} />
                                        <Tooltip formatter={(v) => formatKES(v)} />
                                        <Area type="monotone" dataKey="amount" stroke="#0f766e" strokeWidth={2} fill="url(#collectFill)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                                <div className="flex items-center gap-2 mb-3">
                                    <MessageSquare size={16} className="text-slate-400" />
                                    <h2 className="text-sm font-bold text-slate-900">SMS this month</h2>
                                </div>
                                <p className="text-3xl font-bold text-slate-900">{data.smsSent.toLocaleString()}</p>
                                <p className="text-sm text-slate-500 mt-1">sent</p>
                                {data.smsFailed > 0 && (
                                    <p className="text-sm text-rose-600 font-medium mt-2">{data.smsFailed} failed</p>
                                )}
                            </div>
                            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                                <div className="flex items-center gap-2 mb-3">
                                    <Library size={16} className="text-slate-400" />
                                    <h2 className="text-sm font-bold text-slate-900">Library</h2>
                                </div>
                                <p className="text-3xl font-bold text-slate-900">{data.activeLoans.toLocaleString()}</p>
                                <p className="text-sm text-slate-500 mt-1">active loans</p>
                                {data.overdueLoans > 0 && (
                                    <p className="text-sm text-amber-700 font-medium mt-2 flex items-center gap-1">
                                        <AlertTriangle size={14} /> {data.overdueLoans} overdue
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-sm">
                        <h2 className="text-base font-bold text-slate-900">Enrolment by grade</h2>
                        <p className="text-sm text-slate-500 mb-4">Students with a class assigned</p>
                        {(data.enrolmentByGrade || []).length === 0 ? (
                            <p className="text-sm text-slate-400 py-12 text-center">No enrolment data yet.</p>
                        ) : (
                            <div className="h-64 sm:h-80">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={data.enrolmentByGrade} margin={{ left: -10, right: 8 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                                        <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} interval={0} angle={-25} textAnchor="end" height={60} />
                                        <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                                        <Tooltip />
                                        <Bar dataKey="count" name="Students" fill="#0f766e" radius={[8, 8, 0, 0]} maxBarSize={48} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}