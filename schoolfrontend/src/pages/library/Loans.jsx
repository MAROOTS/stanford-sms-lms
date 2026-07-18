import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import axiosClient from '../../api/axiosClient';

const STATUS_STYLES = {
    BORROWED: 'bg-slate-100 text-slate-600',
    OVERDUE: 'bg-red-50 text-red-600',
    RETURNED: 'bg-teal-accent/15 text-teal-700',
};

export default function Loans() {
    const [filter, setFilter] = useState('ACTIVE');
    const [loans, setLoans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const load = useCallback(async () => {
        setLoading(true); setError('');
        try {
            const endpoint = filter === 'ACTIVE' ? '/library/loans/active' : '/library/loans';
            const { data } = await axiosClient.get(endpoint);
            setLoans(data);
        } catch { setError('Could not load loans'); }
        finally { setLoading(false); }
    }, [filter]);

    useEffect(() => {queueMicrotask(() => load()); }, [load]);

    const handleReturn = async (loanId) => {
        try {
            await axiosClient.post(`/library/loans/${loanId}/return`);
            await load();
        } catch (err) {
            alert(err.response?.data?.message || 'Could not mark this loan returned.');
        }
    };

    return (
        <div>
            <Link to="/library" className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-700 mb-4">
                <ArrowLeft size={15} /> Back to Library
            </Link>

            <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Loans</h1>
                    <p className="text-sm text-slate-500 mt-1">Track who has what, and what's overdue.</p>
                </div>
                <div className="flex gap-1 bg-slate-100 rounded-lg p-1">
                    {[{ key: 'ACTIVE', label: 'Active' }, { key: 'ALL', label: 'All' }].map((f) => (
                        <button key={f.key} onClick={() => setFilter(f.key)}
                                className={`text-xs font-medium px-3 py-1.5 rounded-md transition-colors ${
                                    filter === f.key ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                                }`}>
                            {f.label}
                        </button>
                    ))}
                </div>
            </div>

            {error && <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2 mb-4">{error}</p>}

            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <table className="w-full text-sm">
                    <thead>
                    <tr className="border-b border-slate-100 text-left text-[11px] font-semibold tracking-wider text-slate-400">
                        <th className="px-6 py-3">BOOK</th>
                        <th className="px-6 py-3">BORROWER</th>
                        <th className="px-6 py-3">DUE DATE</th>
                        <th className="px-6 py-3">STATUS</th>
                        <th className="px-6 py-3 text-right">ACTIONS</th>
                    </tr>
                    </thead>
                    <tbody>
                    {loading && <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-400">Loading loans...</td></tr>}
                    {!loading && loans.length === 0 && <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-400">No loans found.</td></tr>}
                    {loans.map((l) => (
                        <tr key={l.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50">
                            <td className="px-6 py-4">
                                <p className="font-medium text-slate-800">{l.bookTitle}</p>
                                <p className="text-xs text-slate-400">{l.copyCode}</p>
                            </td>
                            <td className="px-6 py-4">
                                <p className="text-slate-700">{l.borrowerName}</p>
                                <p className="text-xs text-slate-400">{l.borrowerRole}</p>
                            </td>
                            <td className="px-6 py-4 text-slate-600">
                                {l.dueDate}
                                {l.status === 'OVERDUE' && <span className="text-red-500 text-xs ml-1.5">({l.daysOverdue}d overdue)</span>}
                            </td>
                            <td className="px-6 py-4">
                                <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_STYLES[l.status]}`}>{l.status}</span>
                            </td>
                            <td className="px-6 py-4 text-right">
                                {l.status !== 'RETURNED' && (
                                    <button onClick={() => handleReturn(l.id)} className="text-teal-600 hover:text-teal-700 font-medium">
                                        Mark returned
                                    </button>
                                )}
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}