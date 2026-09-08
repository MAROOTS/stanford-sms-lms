import { useEffect, useState, useCallback } from 'react';
import {
    Library,
    BookOpen,
    Clock,
    AlertCircle,
    CheckCircle2,
    RotateCcw,
    BookMarked
} from 'lucide-react';
import axiosClient from '../../api/axiosClient';
import { useAuth } from '../../context/useAuth';
import EmptyState from '../../components/shared/EmptyState';
import { TableSkeleton } from '../../components/shared/LoadingSkeleton';

const STATUS_CONFIG = {
    BORROWED: {
        label: 'Borrowed',
        style: 'bg-amber-50 text-amber-700 border-amber-200',
        icon: Clock,
    },
    OVERDUE: {
        label: 'Overdue',
        style: 'bg-rose-50 text-rose-700 border-rose-200',
        icon: AlertCircle,
    },
    RETURNED: {
        label: 'Returned',
        style: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        icon: CheckCircle2,
    },
};

const getStatusBadge = (status) => {
    const config = STATUS_CONFIG[status] || {
        label: status || 'Unknown',
        style: 'bg-slate-100 text-slate-600 border-slate-200',
        icon: BookOpen,
    };
    const Icon = config.icon;

    return (
        <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-0.5 rounded-full border ${config.style}`}>
            <Icon size={12} />
            {config.label}
        </span>
    );
};

export default function MyLibrary() {
    const { user } = useAuth();
    const [loans, setLoans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const loadLoans = useCallback(async () => {
        if (!user?.userId) return;
        setLoading(true);
        setError('');
        try {
            const res = await axiosClient.get(`/library/loans/borrower/${user.userId}`);
            setLoans(res.data || []);
        } catch {
            setError('Could not load your library loans. Please try again.');
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        loadLoans();
    }, [loadLoans]);

    const activeLoansCount = loans.filter((l) => l.status === 'BORROWED').length;
    const overdueLoansCount = loans.filter((l) => l.status === 'OVERDUE').length;
    const returnedLoansCount = loans.filter((l) => l.status === 'RETURNED').length;

    return (
        <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 animate-in fade-in duration-500">
            {/* HEADER */}
            <div className="mb-8">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-navy-900/5 text-navy-900 text-xs font-semibold mb-2">
                    <Library size={13} />
                    Library Management
                </div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                    My Library
                </h1>
                <p className="text-sm text-slate-500 mt-1.5">
                    Track your borrowed books, active due dates, and lending history.
                </p>
            </div>

            {/* SUMMARY STAT CARDS */}
            {!loading && !error && loans.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                    <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
                        <div className="flex items-center gap-2.5 text-slate-500 mb-2">
                            <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
                                <Clock size={18} />
                            </div>
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                                Currently Borrowed
                            </span>
                        </div>
                        <p className="text-2xl font-bold text-slate-900">{activeLoansCount}</p>
                    </div>

                    <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
                        <div className="flex items-center gap-2.5 text-slate-500 mb-2">
                            <div className={`p-2 rounded-xl ${overdueLoansCount > 0 ? 'bg-rose-50 text-rose-600' : 'bg-slate-100 text-slate-600'}`}>
                                <AlertCircle size={18} />
                            </div>
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                                Overdue Books
                            </span>
                        </div>
                        <p className={`text-2xl font-bold ${overdueLoansCount > 0 ? 'text-rose-600' : 'text-slate-900'}`}>
                            {overdueLoansCount}
                        </p>
                    </div>

                    <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
                        <div className="flex items-center gap-2.5 text-slate-500 mb-2">
                            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
                                <CheckCircle2 size={18} />
                            </div>
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                                Returned History
                            </span>
                        </div>
                        <p className="text-2xl font-bold text-slate-900">{returnedLoansCount}</p>
                    </div>
                </div>
            )}

            {/* LOADING SKELETON */}
            {loading && <TableSkeleton columns={3} rows={5} />}

            {/* ERROR STATE */}
            {error && !loading && (
                <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 text-center shadow-2xs mb-6">
                    <p className="text-rose-700 font-medium text-sm mb-3">{error}</p>
                    <button
                        type="button"
                        onClick={loadLoans}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-800 hover:text-rose-900 underline underline-offset-4 cursor-pointer"
                    >
                        <RotateCcw size={14} /> Try again
                    </button>
                </div>
            )}

            {/* EMPTY STATE */}
            {!loading && !error && loans.length === 0 && (
                <EmptyState
                    icon={BookMarked}
                    title="No book loans found"
                    description="You currently have no borrowed books or previous lending records in your library account."
                />
            )}

            {/* LOANS TABLE */}
            {!loading && !error && loans.length > 0 && (
                <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
                    <div className="px-6 py-4 bg-slate-50/50 border-b border-slate-200 flex items-center justify-between">
                        <h3 className="font-semibold text-slate-900 text-sm">Borrowed Books & History</h3>
                        <span className="text-xs text-slate-500 font-medium">
                            {loans.length} {loans.length === 1 ? 'Book Record' : 'Book Records'}
                        </span>
                    </div>
                    <div className="overflow-x-auto custom-scrollbar">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-slate-50/30 border-b border-slate-200">
                            <tr className="text-[11px] font-bold tracking-wider text-slate-500 uppercase">
                                <th className="px-6 py-4">Book Title</th>
                                <th className="px-6 py-4">Due Date</th>
                                <th className="px-6 py-4">Status</th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                            {loans.map((l) => (
                                <tr
                                    key={l.id}
                                    className="group bg-white hover:bg-slate-50/80 transition-colors"
                                >
                                    <td className="px-6 py-4 font-semibold text-slate-900 whitespace-nowrap">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 rounded-lg bg-slate-100 text-slate-500 group-hover:bg-navy-900/5 group-hover:text-navy-900 transition-colors">
                                                <BookOpen size={16} />
                                            </div>
                                            <span className="group-hover:text-navy-900 transition-colors">
                                                    {l.bookTitle}
                                                </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-slate-700 whitespace-nowrap">
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium text-slate-800">{l.dueDate}</span>
                                            {l.status === 'OVERDUE' && l.daysOverdue > 0 && (
                                                <span className="text-xs font-semibold text-rose-600 bg-rose-50 border border-rose-200/80 px-2 py-0.5 rounded-md">
                                                        {l.daysOverdue}d overdue
                                                    </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {getStatusBadge(l.status)}
                                    </td>
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