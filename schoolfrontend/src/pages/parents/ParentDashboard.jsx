import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, ClipboardCheck, TrendingUp, Wallet, BookOpen, Sparkles } from 'lucide-react';
import axiosClient from '../../api/axiosClient';
import { useAuth } from '../../context/useAuth';
import NoticeCard from '../../components/shared/NoticeCard';
import { readApiError } from '../../utils/readApiError';

const getAvatarStyle = (name) => {
    const colors = [
        'bg-blue-100 text-blue-700', 'bg-emerald-100 text-emerald-700',
        'bg-violet-100 text-violet-700', 'bg-amber-100 text-amber-700',
        'bg-pink-100 text-pink-700', 'bg-rose-100 text-rose-700',
        'bg-indigo-100 text-indigo-700', 'bg-cyan-100 text-cyan-700'
    ];
    if (!name) return colors[0];
    const charCode = name.charCodeAt(0);
    return colors[charCode % colors.length];
};

export default function ParentDashboard() {
    const { user } = useAuth();
    const [children, setChildren] = useState([]);
    const [loading, setLoading] = useState(true);
    const [notice, setNotice] = useState(null);

    useEffect(() => {
        axiosClient.get('/parents/my-children')
            .then(res => setChildren(res.data))
            .catch((err) => setNotice(readApiError(err, {
                forbidden: 'You are not allowed to view this parent portal.',
                error: 'Could not load your children. Try again.',
            })))
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
                <div className="animate-pulse space-y-6">
                    <div className="h-8 w-64 bg-slate-200 rounded-lg"></div>
                    <div className="h-4 w-48 bg-slate-100 rounded-md"></div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                        <div className="h-48 bg-slate-100 rounded-2xl"></div>
                        <div className="h-48 bg-slate-100 rounded-2xl"></div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 animate-in fade-in duration-500">
            {/* HEADER */}
            <div className="mb-8">
                <div className="flex items-center gap-2 text-teal-600 mb-2">
                    <Sparkles size={18} />
                    <span className="text-xs font-bold tracking-wider uppercase">Parent Portal</span>
                </div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                    Welcome back, {user?.firstName || 'Parent'}
                </h1>
                <p className="text-slate-500 text-sm mt-1.5">
                    Monitor your children's academic progress, attendance, and school fees status.
                </p>
            </div>

            {notice ? (
                <div className="mb-6">
                    <NoticeCard notice={notice} onRetry={() => window.location.reload()} />
                </div>
            ) : children.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-sm max-w-xl mx-auto">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
                        <Users size={32} className="text-slate-400" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-1">No Children Linked</h3>
                    <p className="text-slate-500 text-sm mb-6 leading-relaxed">
                        There are currently no students linked to your parent account. Please contact the school administrator to link your profile.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {children.map(child => (
                        <div
                            key={child.id}
                            className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between"
                        >
                            <div>
                                <div className="flex items-center gap-4 mb-6">
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-sm font-bold shadow-sm border border-black/5 ${getAvatarStyle(child.firstName)}`}>
                                        {child.firstName?.[0]}{child.lastName?.[0]}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-900 text-lg">
                                            {child.firstName} {child.lastName}
                                        </h3>
                                        <p className="text-xs font-medium text-slate-500 mt-0.5">
                                            {child.gradeLevelName} {child.classSectionName ? `· ${child.classSectionName}` : ''}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2.5 pt-4 border-t border-slate-100">
                                <Link
                                    to={`/child/${child.id}/attendance`}
                                    className="flex items-center gap-2.5 text-xs font-semibold text-slate-700 hover:text-navy-900 bg-slate-50 hover:bg-slate-100 border border-slate-100 rounded-xl px-4 py-3 transition-all active:scale-[0.98]"
                                >
                                    <ClipboardCheck size={16} className="text-slate-400" /> Attendance
                                </Link>
                                <Link
                                    to={`/child/${child.id}/results`}
                                    className="flex items-center gap-2.5 text-xs font-semibold text-slate-700 hover:text-navy-900 bg-slate-50 hover:bg-slate-100 border border-slate-100 rounded-xl px-4 py-3 transition-all active:scale-[0.98]"
                                >
                                    <TrendingUp size={16} className="text-slate-400" /> Results
                                </Link>
                                <Link
                                    to={`/child/${child.id}/report-card`}
                                    className="flex items-center gap-2.5 text-xs font-semibold text-slate-700 hover:text-navy-900 bg-slate-50 hover:bg-slate-100 border border-slate-100 rounded-xl px-4 py-3 transition-all active:scale-[0.98]"
                                >
                                    <BookOpen size={16} className="text-slate-400" /> Report Card
                                </Link>
                                <Link
                                    to={`/child/${child.id}/fees`}
                                    className="flex items-center gap-2.5 text-xs font-semibold text-slate-700 hover:text-navy-900 bg-slate-50 hover:bg-slate-100 border border-slate-100 rounded-xl px-4 py-3 transition-all active:scale-[0.98]"
                                >
                                    <Wallet size={16} className="text-slate-400" /> Fees Status
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}