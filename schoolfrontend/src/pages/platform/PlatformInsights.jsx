import { useEffect, useState } from 'react';
import {
    Building2,
    Users,
    GraduationCap,
    Inbox,
    MessageSquare,
    UserPlus,
    Ban,
} from 'lucide-react';
import {
    PieChart,
    Pie,
    Cell,
    Tooltip,
    ResponsiveContainer,
} from 'recharts';
import axiosClient from '../../api/axiosClient';
import NoticeCard from '../../components/shared/NoticeCard';
import { readApiError } from '../../utils/readApiError';

const COLORS = ['#0f766e', '#f43f5e', '#94a3b8'];

function Kpi({ icon: Icon, label, value, hint, tone }) {
    const tones = {
        teal: 'bg-teal-50 border-teal-100 text-teal-700',
        blue: 'bg-blue-50 border-blue-100 text-blue-600',
        navy: 'bg-slate-100 border-slate-200 text-slate-800',
        rose: 'bg-rose-50 border-rose-100 text-rose-600',
        amber: 'bg-amber-50 border-amber-100 text-amber-700',
        violet: 'bg-violet-50 border-violet-100 text-violet-700',
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

export default function PlatformInsights() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const load = () => {
        setLoading(true);
        setError('');
        axiosClient
            .get('/platform/insights/overview')
            .then((res) => setData(res.data))
            .catch((err) => {
                if (err.response?.status === 401) return;
                setError(
                    readApiError(err, { error: 'Could not load platform insights' }).description
                );
            })
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        load();
    }, []);

    return (
        <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 animate-in fade-in duration-500">
            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">Platform insights</h1>
                <p className="text-sm text-slate-500 mt-1.5">
                    Schools, people, leads and SMS across all tenants.
                </p>
            </div>

            {error && (
                <div className="mb-8">
                    <NoticeCard
                        notice={{
                            kind: 'error',
                            title: 'Could not load insights',
                            description: error,
                        }}
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
                        <Kpi
                            icon={Building2}
                            tone="teal"
                            label="Schools"
                            value={data.schoolsTotal.toLocaleString()}
                            hint={`${data.schoolsActive} active · ${data.schoolsSuspended} suspended`}
                        />
                        <Kpi
                            icon={UserPlus}
                            tone="blue"
                            label="New this month"
                            value={data.schoolsCreatedThisMonth.toLocaleString()}
                            hint="Schools onboarded"
                        />
                        <Kpi
                            icon={Users}
                            tone="navy"
                            label="Students"
                            value={data.studentsTotal.toLocaleString()}
                            hint="All tenants"
                        />
                        <Kpi
                            icon={GraduationCap}
                            tone="violet"
                            label="Teachers"
                            value={data.teachersTotal.toLocaleString()}
                            hint="All tenants"
                        />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-sm">
                            <h2 className="text-base font-bold text-slate-900">Schools by status</h2>
                            <p className="text-sm text-slate-500 mb-4">Active vs suspended</p>
                            <div className="h-56">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={data.schoolsByStatus || []}
                                            dataKey="count"
                                            nameKey="name"
                                            innerRadius={55}
                                            outerRadius={85}
                                            paddingAngle={3}
                                            stroke="none"
                                        >
                                            {(data.schoolsByStatus || []).map((_, i) => (
                                                <Cell key={i} fill={COLORS[i % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="flex justify-center gap-6 text-sm">
                                {(data.schoolsByStatus || []).map((s, i) => (
                                    <div key={s.name} className="flex items-center gap-2">
                                        <span
                                            className="w-2.5 h-2.5 rounded-full"
                                            style={{ backgroundColor: COLORS[i % COLORS.length] }}
                                        />
                                        <span className="text-slate-600">
                                            {s.name} · {s.count}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex flex-col justify-center">
                            <div className="flex items-center gap-2 mb-3">
                                <Inbox size={16} className="text-slate-400" />
                                <h2 className="text-sm font-bold text-slate-900">Leads this month</h2>
                            </div>
                            <p className="text-4xl font-bold text-slate-900">
                                {data.leadsThisMonth.toLocaleString()}
                            </p>
                            <p className="text-sm text-slate-500 mt-2">Contact form submissions</p>
                        </div>

                        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex flex-col justify-center">
                            <div className="flex items-center gap-2 mb-3">
                                <MessageSquare size={16} className="text-slate-400" />
                                <h2 className="text-sm font-bold text-slate-900">SMS this month</h2>
                            </div>
                            <p className="text-4xl font-bold text-slate-900">
                                {data.smsSentThisMonth.toLocaleString()}
                            </p>
                            <p className="text-sm text-slate-500 mt-2">Messages sent (all schools)</p>
                            {data.smsFailedThisMonth > 0 && (
                                <p className="text-sm text-rose-600 font-medium mt-2 flex items-center gap-1">
                                    <Ban size={14} /> {data.smsFailedThisMonth} failed
                                </p>
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}