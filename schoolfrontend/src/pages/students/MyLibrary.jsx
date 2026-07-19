import { useEffect, useState } from 'react';
import axiosClient from '../../api/axiosClient';
import { useAuth } from '../../context/AuthContext';

const STATUS_STYLES = {
    BORROWED: 'bg-slate-100 text-slate-600',
    OVERDUE: 'bg-red-50 text-red-600',
    RETURNED: 'bg-teal-accent/15 text-teal-700',
};

export default function MyLibrary() {
    const { user } = useAuth();
    const [loans, setLoans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!user?.userId) return;
        axiosClient.get(`/library/loans/borrower/${user.userId}`)
            .then((res) => setLoans(res.data))
            .catch(() => setError('Could not load your library loans'))
            .finally(() => setLoading(false));
    }, [user]);

    return (
        <div>
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-slate-900">My Library</h1>
                <p className="text-sm text-slate-500 mt-1">Books you've borrowed brooo.......</p>
            </div>

            {error && <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2 mb-4">{error}</p>}
            {loading && <p className="text-sm text-slate-400">Loading...</p>}

            {!loading && (
                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                    <table className="w-full text-sm">
                        <thead>
                        <tr className="border-b border-slate-100 text-left text-[11px] font-semibold tracking-wider text-slate-400">
                            <th className="px-6 py-3">BOOK</th>
                            <th className="px-6 py-3">DUE DATE</th>
                            <th className="px-6 py-3">STATUS</th>
                        </tr>
                        </thead>
                        <tbody>
                        {loans.length === 0 && <tr><td colSpan={3} className="px-6 py-8 text-center text-slate-400">No loans yet.</td></tr>}
                        {loans.map((l) => (
                            <tr key={l.id} className="border-b border-slate-50 last:border-0">
                                <td className="px-6 py-3 font-medium text-slate-800">{l.bookTitle}</td>
                                <td className="px-6 py-3 text-slate-600">
                                    {l.dueDate}
                                    {l.status === 'OVERDUE' && <span className="text-red-500 text-xs ml-1.5">({l.daysOverdue}d overdue)</span>}
                                </td>
                                <td className="px-6 py-3">
                                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_STYLES[l.status]}`}>{l.status}</span>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}