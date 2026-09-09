import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
    ClipboardCheck,
    TrendingUp,
    Wallet,
    BookOpen,
    GraduationCap,
    ArrowRight,
    Loader2,
    Sparkles
} from 'lucide-react';
import axiosClient from '../../api/axiosClient';
import { useAuth } from '../../context/useAuth';
import { isCurrentTerm } from '../../utils/termUtils';

export default function StudentHome() {
    const { user } = useAuth();
    const [profile, setProfile] = useState(null);
    const [term, setTerm] = useState(null);
    const [attendancePercent, setAttendancePercent] = useState(null);
    const [feeBalance, setFeeBalance] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user?.userId) return;

        Promise.all([
            axiosClient.get(`/students/${user.userId}`),
            axiosClient.get('/terms'),
            axiosClient.get(`/students/${user.userId}/class-attendance`),
            axiosClient.get(`/fee-invoices/student/${user.userId}`),
        ])
            .then(([profileRes, termsRes, attendanceRes, invoicesRes]) => {
                setProfile(profileRes.data);

                // Supports both the new "isCurrent" API property
                // and the older "current" property.
                setTerm(termsRes.data.find(isCurrentTerm) || null);

                const records = attendanceRes.data;

                if (records && records.length > 0) {
                    const presentOrLate = records.filter(
                        (r) => r.status === 'PRESENT' || r.status === 'LATE'
                    ).length;

                    setAttendancePercent(
                        Math.round((presentOrLate / records.length) * 100)
                    );
                }

                if (invoicesRes.data) {
                    const totalBalance = invoicesRes.data.reduce(
                        (sum, inv) => sum + inv.balance,
                        0
                    );

                    setFeeBalance(totalBalance);
                }
            })
            .catch(() => {})
            .finally(() => setLoading(false));
    }, [user]);

    if (loading) {
        return (
            <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 flex items-center justify-center min-h-[60vh]">
                <div className="flex flex-col items-center justify-center text-slate-400">
                    <Loader2
                        size={32}
                        className="animate-spin text-navy-900 mb-3"
                    />
                    <p className="text-sm font-medium text-slate-500">
                        Loading student portal...
                    </p>
                </div>
            </div>
        );
    }

    const cards = [
        {
            label: 'Class Section',
            value: profile?.classSectionName || 'Unassigned',
            icon: GraduationCap,
            color: 'text-slate-700 bg-slate-100 border-slate-200',
            link: null
        },
        {
            label: 'Attendance Rate',
            value: attendancePercent !== null
                ? `${attendancePercent}%`
                : '—',
            icon: ClipboardCheck,
            color: 'text-teal-700 bg-teal-50 border-teal-100',
            link: '/my-attendance'
        },
        {
            label: 'Fee Balance',
            value: feeBalance !== null
                ? `KES ${feeBalance.toLocaleString()}`
                : '—',
            icon: Wallet,
            color: feeBalance > 0
                ? 'text-rose-700 bg-rose-50 border-rose-100'
                : 'text-emerald-700 bg-emerald-50 border-emerald-100',
            link: '/my-fees'
        },
    ];

    const quickActions = [
        {
            title: 'My Results',
            description: 'View exam scores, subject grades, and class rankings',
            icon: TrendingUp,
            link: '/my-results',
            iconColor: 'text-teal-600 bg-teal-50 border-teal-100',
        },
        {
            title: 'Report Cards',
            description: 'View and download official term performance reports',
            icon: GraduationCap,
            link: '/my-report-cards',
            iconColor: 'text-blue-600 bg-blue-50 border-blue-100',
        },
        {
            title: 'Library',
            description: 'Browse book catalog and check borrowed items',
            icon: BookOpen,
            link: '/my-library',
            iconColor: 'text-indigo-600 bg-indigo-50 border-indigo-100',
        },
    ];

    return (
        <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 animate-in fade-in duration-500">
            {/* HEADER */}
            <div className="mb-8">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-navy-900/5 text-navy-900 text-xs font-semibold mb-2">
                    <Sparkles size={13} />
                    Student Dashboard
                </div>

                <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                    Welcome back, {user?.firstName || 'Student'}!
                </h1>

                <p className="text-sm text-slate-500 mt-1">
                    {profile?.gradeLevelName
                        ? `${profile.gradeLevelName} • `
                        : ''}
                    {term ? term.name : 'No active term'}
                </p>
            </div>

            {/* OVERVIEW STAT CARDS */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
                {cards.map((c) => {
                    const CardContent = (
                        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-all h-full flex flex-col justify-between group">
                            <div className="flex items-center justify-between mb-4">
                                <div
                                    className={`w-12 h-12 rounded-xl border flex items-center justify-center shrink-0 ${c.color}`}
                                >
                                    <c.icon size={22} />
                                </div>

                                {c.link && (
                                    <span className="text-xs font-semibold text-slate-400 group-hover:text-navy-900 flex items-center gap-1 transition-colors">
                                        View
                                        <ArrowRight size={14} />
                                    </span>
                                )}
                            </div>

                            <div>
                                <p className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
                                    {c.value}
                                </p>

                                <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mt-1">
                                    {c.label}
                                </p>
                            </div>
                        </div>
                    );

                    return c.link ? (
                        <Link
                            key={c.label}
                            to={c.link}
                            className="block h-full"
                        >
                            {CardContent}
                        </Link>
                    ) : (
                        <div key={c.label} className="h-full">
                            {CardContent}
                        </div>
                    );
                })}
            </div>

            {/* NAVIGATION MODULES */}
            <div>
                <h2 className="text-lg font-bold text-slate-900 mb-4">
                    Quick Navigation
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                    {quickActions.map((action) => (
                        <Link
                            key={action.title}
                            to={action.link}
                            className="group bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md hover:border-slate-300 transition-all flex flex-col justify-between"
                        >
                            <div>
                                <div className="flex items-center justify-between mb-4">
                                    <div
                                        className={`w-10 h-10 rounded-xl border flex items-center justify-center ${action.iconColor}`}
                                    >
                                        <action.icon size={20} />
                                    </div>

                                    <ArrowRight
                                        size={18}
                                        className="text-slate-300 group-hover:text-navy-900 group-hover:translate-x-1 transition-all"
                                    />
                                </div>

                                <h3 className="font-bold text-slate-900 text-base group-hover:text-navy-900 transition-colors">
                                    {action.title}
                                </h3>

                                <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                                    {action.description}
                                </p>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}
