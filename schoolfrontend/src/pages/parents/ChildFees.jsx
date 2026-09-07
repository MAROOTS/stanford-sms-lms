import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Wallet, ChevronDown, ChevronUp } from 'lucide-react';
import axiosClient from '../../api/axiosClient';
import { downloadPaymentReceipt } from '../../utils/downloadReceipt';

function InvoiceRow({ invoice }) {
    const [expanded, setExpanded] = useState(false);
    const [payments, setPayments] = useState(null);

    const toggle = async () => {
        if (!expanded && payments === null) {
            try {
                const { data } = await axiosClient.get(`/fee-invoices/${invoice.id}/payments`);
                setPayments(data);
            } catch {
                setPayments([]);
            }
        }
        setExpanded((v) => !v);
    };

    const totalAmount = invoice.totalAmount ?? invoice.totalBilled ?? 0;

    return (
        <>
            <tr className="border-b border-slate-100 hover:bg-slate-50/60 cursor-pointer transition-colors" onClick={toggle}>
                <td className="px-6 py-4 font-mono text-xs text-slate-700">
                    <div className="flex items-center gap-2">
                        {expanded ? <ChevronUp size={14} className="text-slate-400" /> : <ChevronDown size={14} className="text-slate-400" />}
                        <span>{invoice.invoiceNumber || '—'}</span>
                    </div>
                </td>
                <td className="px-6 py-4 text-slate-700 font-medium">{invoice.termName || `Term ${invoice.termId}`}</td>
                <td className="px-6 py-4 text-right">KES {totalAmount.toLocaleString()}</td>
                <td className="px-6 py-4 text-right font-medium text-red-600">KES {(invoice.balance || 0).toLocaleString()}</td>
                <td className="px-6 py-4 text-center">
                    <span className={`inline-block text-xs font-medium px-2.5 py-1 rounded-full ${
                        invoice.balance === 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                    }`}>
                        {invoice.balance === 0 ? 'PAID' : 'PENDING'}
                    </span>
                </td>
            </tr>
            {expanded && (
                <tr className="bg-slate-50/80 border-b border-slate-100">
                    <td colSpan={5} className="px-6 py-4">
                        <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-4 shadow-sm">
                            {invoice.lineItems && invoice.lineItems.length > 0 && (
                                <div>
                                    <p className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase mb-2">LINE ITEMS</p>
                                    <div className="space-y-1">
                                        {invoice.lineItems.map((li) => (
                                            <div key={li.feeItemId || li.id} className="flex justify-between text-xs">
                                                <span className="text-slate-600">{li.feeItemName}</span>
                                                <span className="text-slate-800 font-medium">KES {(li.amount || 0).toLocaleString()}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div>
                                <p className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase mb-2">PAYMENTS & RECEIPTS</p>
                                {payments === null && <p className="text-xs text-slate-400">Loading payments...</p>}
                                {payments && payments.length === 0 && <p className="text-xs text-slate-400">No payments recorded yet.</p>}
                                {payments && payments.length > 0 && (
                                    <div className="space-y-2">
                                        {payments.map((p) => (
                                            <div key={p.id} className="flex justify-between items-center text-xs py-1 border-b border-slate-100 last:border-0">
                                                <span className="text-slate-600">{p.paymentDate} · {p.method || p.paymentMethod}</span>
                                                <div className="flex items-center gap-3">
                                                    <span className="text-slate-800 font-medium">KES {p.amount.toLocaleString()}</span>
                                                    <button
                                                        type="button"
                                                        className="text-xs font-medium text-slate-900 hover:underline"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            downloadPaymentReceipt(invoice.id, p.id, `${invoice.invoiceNumber || 'receipt'}-receipt.pdf`);
                                                        }}
                                                    >
                                                        Receipt
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </td>
                </tr>
            )}
        </>
    );
}

export default function ChildFees() {
    const { childId } = useParams();
    const [invoices, setInvoices] = useState([]);
    const [child, setChild] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([
            axiosClient.get(`/students/${childId}`),
            axiosClient.get(`/fee-invoices/student/${childId}`),
        ]).then(([childRes, invoicesRes]) => {
            setChild(childRes.data);
            setInvoices(invoicesRes.data);
        }).finally(() => setLoading(false));
    }, [childId]);

    if (loading) return <p className="text-sm text-slate-400">Loading...</p>;

    const totalOwed = invoices.reduce((sum, inv) => sum + (inv.balance || 0), 0);
    const totalPaid = invoices.reduce((sum, inv) => sum + (((inv.totalAmount ?? inv.totalBilled) || 0) - (inv.balance || 0)), 0);

    return (
        <div>
            <Link to="/parent-dashboard" className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 mb-4">
                <ArrowLeft size={14} /> Back to Dashboard
            </Link>

            <div className="mb-6">
                <h1 className="text-2xl font-bold text-slate-900">
                    {child?.firstName} {child?.lastName} — Fees
                </h1>
                <p className="text-sm text-slate-500 mt-1">{child?.gradeLevelName}{child?.classSectionName ? ` · ${child.classSectionName}` : ''}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <div className="bg-white rounded-xl border border-slate-200 p-5">
                    <div className="w-10 h-10 rounded-lg bg-teal-accent/10 flex items-center justify-center mb-3">
                        <Wallet size={18} className="text-teal-600" />
                    </div>
                    <p className="text-2xl font-bold text-slate-900">KES {totalOwed.toLocaleString()}</p>
                    <p className="text-sm text-slate-500">Outstanding Balance</p>
                </div>
                <div className="bg-white rounded-xl border border-slate-200 p-5">
                    <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center mb-3">
                        <Wallet size={18} className="text-emerald-600" />
                    </div>
                    <p className="text-2xl font-bold text-emerald-700">KES {totalPaid.toLocaleString()}</p>
                    <p className="text-sm text-slate-500">Total Paid</p>
                </div>
                <div className="bg-white rounded-xl border border-slate-200 p-5">
                    <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center mb-3">
                        <Wallet size={18} className="text-amber-600" />
                    </div>
                    <p className="text-2xl font-bold text-slate-900">{invoices.length}</p>
                    <p className="text-sm text-slate-500">Invoices</p>
                </div>
            </div>

            {invoices.length === 0 ? (
                <div className="bg-white rounded-xl border border-slate-200 p-10 text-center">
                    <Wallet size={40} className="mx-auto text-slate-300 mb-4" />
                    <p className="text-slate-600 font-medium">No fee invoices found</p>
                    <p className="text-sm text-slate-400 mt-1">Invoices will appear here once generated by the school.</p>
                </div>
            ) : (
                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                    <table className="w-full text-sm">
                        <thead>
                        <tr className="border-b border-slate-100 text-left text-[11px] font-semibold tracking-wider text-slate-400">
                            <th className="px-6 py-3">INVOICE</th>
                            <th className="px-6 py-3">TERM</th>
                            <th className="px-6 py-3 text-right">TOTAL</th>
                            <th className="px-6 py-3 text-right">BALANCE</th>
                            <th className="px-6 py-3 text-center">STATUS</th>
                        </tr>
                        </thead>
                        <tbody>
                        {invoices.map(inv => (
                            <InvoiceRow key={inv.id} invoice={inv} />
                        ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}