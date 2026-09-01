import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, ClipboardCheck, TrendingUp, Wallet, BookOpen } from 'lucide-react';
import axiosClient from '../../api/axiosClient';
import { useAuth } from '../../context/useAuth';
import NoticeCard from '../../components/shared/NoticeCard';
import { readApiError } from '../../utils/readApiError';
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

    if (loading) return <p className="text-sm text-slate-400">Loading...</p>;

    return (
        <div>
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-slate-900">Welcome, {user?.firstName || 'Parent'}</h1>
                <p className="text-sm text-slate-500 mt-1">
                    Parent Portal — monitor your children's progress
                </p>
            </div>

            {notice ? ( <NoticeCard notice={notice} onRetry={() => window.location.reload()} /> ) :
                children.length === 0 ? (
                <div className="bg-white rounded-xl border border-slate-200 p-10 text-center">
                    <Users size={40} className="mx-auto text-slate-300 mb-4" />
                    <p className="text-slate-600 font-medium">No children linked to your account</p>
                    <p className="text-sm text-slate-400 mt-1">Please contact the school administrator to link your children.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {children.map(child => (
                        <div key={child.id} className="bg-white rounded-xl border border-slate-200 p-5">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 rounded-full bg-teal-accent/15 flex items-center justify-center text-teal-700 font-bold">
                                    {child.firstName?.[0]}{child.lastName?.[0]}
                                </div>
                                <div>
                                    <p className="font-medium text-slate-900">{child.firstName} {child.lastName}</p>
                                    <p className="text-xs text-slate-500">
                                        {child.gradeLevelName}{child.classSectionName ? ` · ${child.classSectionName}` : ''}
                                    </p>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <Link to={`/child/${child.id}/attendance`}
                                      className="flex items-center gap-2 text-sm text-slate-600 hover:text-teal-600 bg-slate-50 rounded-lg px-3 py-2 transition-colors">
                                    <ClipboardCheck size={14} /> Attendance
                                </Link>
                                <Link to={`/child/${child.id}/results`}
                                      className="flex items-center gap-2 text-sm text-slate-600 hover:text-teal-600 bg-slate-50 rounded-lg px-3 py-2 transition-colors">
                                    <TrendingUp size={14} /> Results
                                </Link>
                                <Link to={`/child/${child.id}/report-card`}
                                      className="flex items-center gap-2 text-sm text-slate-600 hover:text-teal-600 bg-slate-50 rounded-lg px-3 py-2 transition-colors">
                                    <BookOpen size={14} /> Report Card
                                </Link>
                                <Link to={`/child/${child.id}/fees`}
                                      className="flex items-center gap-2 text-sm text-slate-600 hover:text-teal-600 bg-slate-50 rounded-lg px-3 py-2 transition-colors">
                                    <Wallet size={14} /> Fees
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}