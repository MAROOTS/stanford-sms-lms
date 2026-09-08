import { useEffect, useState, useCallback } from 'react';
import {
    ChevronDown,
    ChevronUp,
    Sparkles,
    CreditCard,
    Receipt,
    Download,
    CheckCircle2,
    AlertCircle,
    RotateCcw,
    FileText,
    Wallet
} from 'lucide-react';
import axiosClient from '../../api/axiosClient';
import { useAuth } from '../../context/useAuth';
import { downloadPaymentReceipt } from '../../utils/downloadReceipt';
import EmptyState from '../../components/shared/EmptyState';
import { TableSkeleton } from '../../components/shared/LoadingSkeleton';

function InvoiceCard({ invoice }) {
    const [expanded, setExpanded] = useState(false);
    const [payments, setPayments] = useState(null);
    const [loadingPayments, setLoadingPayments] = useState(false);

    const toggle = async () => {
        if (!expanded && payments === null) {
            setLoadingPayments(true);
            try {
                const { data } = await axiosClient.get(`/fee-invoices/${invoice.id}/payments`);
                setPayments(data || []);
            } catch {
                setPayments([]);
            } finally {
                setLoadingPayments(false);
            }
        }
        setExpanded((v) => !v);
    };

    const isPaid = invoice.balance <= 0;

    return (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:border-slate-300 transition-all overflow-hidden">
            {/* INVOICE HEADER ROW */}
            <button
                type="button"
                onClick={toggle}
                className="w-full flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-6 py-5 text-left hover:bg-slate-50/50 transition-colors cursor-pointer"
            >
                <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-xl shrink-0 ${isPaid ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                        {isPaid ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
                    </div>
                    <div>
                        <div className="flex items-center gap-2.5 flex-wrap">
                            <h3 className="font-semibold text-slate-900 text-base">{invoice.termName}</h3>
                            {invoice.invoiceNumber && (
                                <span className="font-mono text-xs text-slate-500 bg-slate-100 border border-slate-200/80 px-2 py-0.5 rounded-md">
                                    {invoice.invoiceNumber}
                                </span>
                            )}
                        </div>
                        <p className="text-xs text-slate-500 mt-1">
                            Billed: <span className="font-semibold text-slate-700">KES {invoice.totalBilled?.toLocaleString()}</span> · Paid: <span className="font-semibold text-emerald-700">KES {invoice.totalPaid?.toLocaleString()}</span>
                        </p>
                    </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100">
                    <div className="text-right">
                        {isPaid ? (
                            <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200/80 text-xs font-semibold px-3 py-1 rounded-full">
                                <CheckCircle2 size={13} /> Paid in full
                            </span>
                        ) : (
                            <div className="flex flex-col items-end">
                                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Balance Due</span>
                                <span className="text-sm font-bold text-rose-600">
                                    KES {invoice.balance?.toLocaleString()}
                                </span>
                            </div>
                        )}
                    </div>
                    <div className="w-8 h-8 rounded-xl bg-slate-100/80 flex items-center justify-center text-slate-400 hover:text-slate-600 shrink-0 transition-colors">
                        {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </div>
                </div>
            </button>

            {/* EXPANDABLE CONTENT */}
            {expanded && (
                <div className="border-t border-slate-100 bg-slate-50/40 p-6 space-y-6 animate-in slide-in-from-top-2 duration-200">
                    {/* LINE ITEMS */}
                    <div>
                        <div className="flex items-center gap-1.5 text-[11px] font-bold tracking-wider text-slate-400 uppercase mb-3">
                            <FileText size={14} /> Fee Breakdown
                        </div>
                        <div className="bg-white rounded-xl border border-slate-200/80 divide-y divide-slate-100 overflow-hidden shadow-2xs">
                            {invoice.lineItems?.map((li) => (
                                <div key={li.feeItemId || li.feeItemName} className="flex justify-between items-center text-sm px-4 py-3">
                                    <span className="text-slate-700 font-medium">{li.feeItemName}</span>
                                    <span className="text-slate-900 font-semibold">KES {li.amount?.toLocaleString()}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* PAYMENTS HISTORY */}
                    <div>
                        <div className="flex items-center gap-1.5 text-[11px] font-bold tracking-wider text-slate-400 uppercase mb-3">
                            <Receipt size={14} /> Payment History
                        </div>

                        {loadingPayments && (
                            <div className="bg-white rounded-xl border border-slate-200/80 p-4 text-center text-sm text-slate-400 shadow-2xs">
                                Loading payment details...
                            </div>
                        )}

                        {!loadingPayments && payments && payments.length === 0 && (
                            <div className="bg-white rounded-xl border border-slate-200/80 p-4 text-center text-sm text-slate-500 shadow-2xs">
                                No payments recorded yet for this invoice.
                            </div>
                        )}

                        {!loadingPayments && payments && payments.length > 0 && (
                            <div className="bg-white rounded-xl border border-slate-200/80 divide-y divide-slate-100 overflow-hidden shadow-2xs">
                                {payments.map((p) => (
                                    <div key={p.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-sm px-4 py-3 hover:bg-slate-50/50 transition-colors">
                                        <div className="flex items-center gap-2.5">
                                            <div className="w-2 h-2 rounded-full bg-emerald-500" />
                                            <div>
                                                <span className="text-slate-900 font-medium">{p.paymentDate}</span>
                                                <span className="text-slate-400 mx-2">•</span>
                                                <span className="text-xs text-slate-600 bg-slate-100 border border-slate-200/80 px-2.5 py-0.5 rounded-md font-medium">
                                                    {p.method}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between sm:justify-end gap-4 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                                            <span className="text-slate-900 font-bold">
                                                KES {p.amount?.toLocaleString()}
                                            </span>
                                            <button
                                                type="button"
                                                onClick={() => downloadPaymentReceipt(invoice.id, p.id, `${invoice.invoiceNumber || 'receipt'}-receipt.pdf`)}
                                                className="inline-flex items-center gap-1.5 text-xs font-semibold text-navy-900 hover:text-navy-800 bg-navy-900/5 hover:bg-navy-900/10 px-3 py-1.5 rounded-xl transition-all cursor-pointer active:scale-95"
                                            >
                                                <Download size={13} /> Receipt
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
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

    const load = useCallback(async () => {
        if (!user?.userId) return;
        setLoading(true);
        setError('');
        try {
            const { data } = await axiosClient.get(`/fee-invoices/student/${user.userId}`);
            setInvoices(data || []);
        } catch {
            setError('Could not load your fee invoices. Please try again.');
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        load();
    }, [load]);

    const totalBilled = invoices.reduce((sum, inv) => sum + (inv.totalBilled || 0), 0);
    const totalPaid = invoices.reduce((sum, inv) => sum + (inv.totalPaid || 0), 0);
    const totalOutstanding = invoices.reduce((sum, inv) => sum + (inv.balance || 0), 0);

    return (
        <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 animate-in fade-in duration-500">
            {/* HEADER */}
            <div className="mb-8">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-navy-900/5 text-navy-900 text-xs font-semibold mb-2">
                    Financial Overview
                </div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">My Fees</h1>
                <p className="text-sm text-slate-500 mt-1.5">
                    Review your academic term invoices, payment histories, and download official receipts.
                </p>
            </div>

            {/* FINANCIAL SUMMARY CARDS */}
            {!loading && !error && invoices.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                    <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
                        <div className="flex items-center gap-3 text-slate-500 mb-2">
                            <div className="p-2 rounded-xl bg-slate-100 text-slate-600">
                                <Wallet size={18} />
                            </div>
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Billed</span>
                        </div>
                        <p className="text-2xl font-bold text-slate-900">
                            KES {totalBilled.toLocaleString()}
                        </p>
                    </div>

                    <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
                        <div className="flex items-center gap-3 text-slate-500 mb-2">
                            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
                                <CheckCircle2 size={18} />
                            </div>
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Paid</span>
                        </div>
                        <p className="text-2xl font-bold text-emerald-600">
                            KES {totalPaid.toLocaleString()}
                        </p>
                    </div>

                    <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
                        <div className="flex items-center gap-3 text-slate-500 mb-2">
                            <div className={`p-2 rounded-xl ${totalOutstanding > 0 ? 'bg-rose-50 text-rose-600' : 'bg-teal-50 text-teal-600'}`}>
                                <CreditCard size={18} />
                            </div>
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Balance Due</span>
                        </div>
                        <p className={`text-2xl font-bold ${totalOutstanding > 0 ? 'text-rose-600' : 'text-slate-900'}`}>
                            KES {totalOutstanding.toLocaleString()}
                        </p>
                    </div>
                </div>
            )}

            {/* LOADING SKELETON */}
            {loading && <TableSkeleton columns={3} rows={4} />}

            {/* ERROR STATE */}
            {error && !loading && (
                <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 text-center shadow-2xs mb-6">
                    <p className="text-rose-700 font-medium text-sm mb-3">{error}</p>
                    <button
                        type="button"
                        onClick={load}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-800 hover:text-rose-900 underline underline-offset-4 cursor-pointer"
                    >
                        <RotateCcw size={14} /> Try again
                    </button>
                </div>
            )}

            {/* EMPTY STATE */}
            {!loading && !error && invoices.length === 0 && (
                <EmptyState
                    icon={Receipt}
                    title="No invoices found"
                    description="You currently have no fee invoices generated or associated with your account."
                />
            )}

            {/* INVOICES LIST */}
            {!loading && !error && invoices.length > 0 && (
                <div className="space-y-4">
                    {invoices.map((inv) => (
                        <InvoiceCard key={inv.id} invoice={inv} />
                    ))}
                </div>
            )}
        </div>
    );
}