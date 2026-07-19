import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ClipboardCheck, TrendingUp, Wallet, BookOpen, GraduationCap } from 'lucide-react';
import axiosClient from '../../api/axiosClient';
import { useAuth } from '../../context/useAuth';

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
        ]).then(([profileRes, termsRes, attendanceRes, invoicesRes]) => {
            setProfile(profileRes.data);
            setTerm(termsRes.data.find((t) => t.isCurrent) || null);

            const records = attendanceRes.data;
            if (records.length > 0) {
                const presentOrLate = records.filter((r) => r.status === 'PRESENT' || r.status === 'LATE').length;
                setAttendancePercent(Math.round((presentOrLate / records.length) * 100));
            }

            const totalBalance = invoicesRes.data.reduce((sum, inv) => sum + inv.balance, 0);
            setFeeBalance(totalBalance);
        }).finally(() => setLoading(false));
    }, [user]);

    if (loading) return <p className="text-sm text-slate-400">Loading...</p>;

    const cards = [
        { label: 'Class', value: profile?.classSectionName || 'Unassigned', icon: GraduationCap, color: 'text-slate-600 bg-slate-100', link: null },
        { label: 'Attendance', value: attendancePercent !== null ? `${attendancePercent}%` : '—', icon: ClipboardCheck, color: 'text-teal-700 bg-teal-accent/15', link: '/my-attendance' },
        { label: 'Fee Balance', value: feeBalance !== null ? `KES ${feeBalance.toLocaleString()}` : '—', icon: Wallet, color: feeBalance > 0 ? 'text-red-600 bg-red-50' : 'text-emerald-700 bg-emerald-50', link: '/my-fees' },
    ];

    return (
        <div>
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-slate-900">Welcome, {user?.firstName || 'there'}</h1>
                <p className="text-sm text-slate-500 mt-1">
                    {profile?.gradeLevelName ? `${profile.gradeLevelName} · ` : ''}{term ? term.name : 'No active term'}
                </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                {cards.map((c) => {
                    const Card = (
                        <div className="bg-white rounded-xl border border-slate-200 p-5 h-full">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-4 ${c.color}`}>
                                <c.icon size={18} />
                            </div>
                            <p className="text-2xl font-bold text-slate-900">{c.value}</p>
                            <p className="text-sm text-slate-500 mt-1">{c.label}</p>
                        </div>
                    );
                    return c.link ? <Link key={c.label} to={c.link}>{Card}</Link> : <div key={c.label}>{Card}</div>;
                })}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Link to="/my-results" className="bg-white rounded-xl border border-slate-200 p-5 hover:border-teal-accent transition-colors">
                    <TrendingUp size={18} className="text-teal-600 mb-2" />
                    <p className="font-medium text-slate-800">My Results</p>
                    <p className="text-xs text-slate-500 mt-1">View exam scores and class ranking</p>
                </Link>
                <Link to="/my-report-cards" className="bg-white rounded-xl border border-slate-200 p-5 hover:border-teal-accent transition-colors">
                    <GraduationCap size={18} className="text-teal-600 mb-2" />
                    <p className="font-medium text-slate-800">Report Cards</p>
                    <p className="text-xs text-slate-500 mt-1">Download your term report card</p>
                </Link>
                <Link to="/my-library" className="bg-white rounded-xl border border-slate-200 p-5 hover:border-teal-accent transition-colors">
                    <BookOpen size={18} className="text-teal-600 mb-2" />
                    <p className="font-medium text-slate-800">Library</p>
                    <p className="text-xs text-slate-500 mt-1">See books you've borrowed</p>
                </Link>
            </div>
        </div>
    );
}