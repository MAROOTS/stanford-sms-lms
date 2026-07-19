import { useEffect, useState, useCallback } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import axiosClient from '../../api/axiosClient';
import { useAuth } from '../../context/AuthContext';

function InvoiceCard({ invoice }) {
    const [expanded, setExpanded] = useState(false);
    const [payments, setPayments] = useState(null);

    const toggle = async () => {
        if (!expanded && payments === null) {
            const { data } = await axiosClient.get(`/fee-invoices/${invoice.id}/payments`);
            setPayments(data);
        }
        setExpanded((v) => !v);
    };

    return (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <button onClick={toggle} className="w-full flex items-center justify-between px-6 py-4">
                <div className="text-left">
                    <p className="font-medium text-slate-800">{invoice.termName}</p>
                    <p className="text-xs text-slate-500 mt-0.5">Billed KES {invoice.totalBilled.toLocaleString()} · Paid KES {invoice.totalPaid.toLocaleString()}</p>
                </div>
                <div className="flex items-center gap-3">
                    {invoice.balance > 0
                        ? <span className="text-red-600 font-medium text-sm">KES {invoice.balance.toLocaleString()} due</span>
                        : <span className="inline-block bg-teal-accent/15 text-teal-700 text-xs font-medium px-2.5 py-1 rounded-full">Paid in full</span>}
                    {expanded ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
                </div>
            </button>

            {expanded && (
                <div className="border-t border-slate-100 px-6 py-4">
                    <p className="text-xs font-semibold tracking-wider text-slate-400 mb-2">LINE ITEMS</p>
                    <div className="space-y-1 mb-4">
                        {invoice.lineItems.map((li) => (
                            <div key={li.feeItemId} className="flex justify-between text-sm">
                                <span className="text-slate-600">{li.feeItemName}</span>
                                <span className="text-slate-800">KES {li.amount.toLocaleString()}</span>
                            </div>
                        ))}
                    </div>

                    <p className="text-xs font-semibold tracking-wider text-slate-400 mb-2">PAYMENTS</p>
                    {payments === null && <p className="text-sm text-slate-400">Loading...</p>}
                    {payments && payments.length === 0 && <p className="text-sm text-slate-400">No payments recorded yet.</p>}
                    {payments && payments.length > 0 && (
                        <div className="space-y-1">
                            {payments.map((p) => (
                                <div key={p.id} className="flex justify-between text-sm">
                                    <span className="text-slate-600">{p.paymentDate} · {p.method}</span>
                                    <span className="text-slate-800">KES {p.amount.toLocaleString()}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default function MyFees() {
    const { user } = useAuth();
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const load = useCallback(() => {
        if (!user?.userId) return;
        setLoading(true);
        axiosClient.get(`/fee-invoices/student/${user.userId}`)
            .then((res) => setInvoices(res.data))
            .catch(() => setError('Could not load your fee invoices'))
            .finally(() => setLoading(false));
    }, [user]);

    useEffect(() => { load(); }, [load]);

    const totalOutstanding = invoices.reduce((sum, inv) => sum + inv.balance, 0);

    return (
        <div>
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-slate-900">My Fees</h1>
                <p className="text-sm text-slate-500 mt-1">
                    {totalOutstanding > 0
                        ? `KES ${totalOutstanding.toLocaleString()} outstanding across all terms`
                        : 'No outstanding balance'}
                </p>
            </div>

            {error && <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2 mb-4">{error}</p>}
            {loading && <p className="text-sm text-slate-400">Loading...</p>}

            {!loading && invoices.length === 0 && <p className="text-sm text-slate-400">No invoices yet.</p>}

            <div className="space-y-3">
                {invoices.map((inv) => <InvoiceCard key={inv.id} invoice={inv} />)}
            </div>
        </div>
    );
}