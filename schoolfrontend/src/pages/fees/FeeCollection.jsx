import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Settings, Wallet, TrendingDown, CheckCircle2 } from 'lucide-react';
import { PieChart, Pie, Bar, Tooltip, ResponsiveContainer } from 'recharts';
import axiosClient from '../../api/axiosClient';
import InvoiceModal from './InvoiceModal';
import PaymentModal from './PaymentModal';

const CHART_COLORS = ['#14b8a6', '#101d3f', '#f59e0b', '#94a3b8', '#ef4444'];

export default function FeeCollection() {
    const [terms, setTerms] = useState([]);
    const [termId, setTermId] = useState('');
    const [students, setStudents] = useState([]);
    const [feeItems, setFeeItems] = useState([]);
    const [invoices, setInvoices] = useState([]);
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [invoiceModalOpen, setInvoiceModalOpen] = useState(false);
    const [paymentModalInvoice, setPaymentModalInvoice] = useState(null);

    useEffect(() => {
        Promise.all([
            axiosClient.get('/terms'),
            axiosClient.get('/students'),
            axiosClient.get('/fee-items'),
        ]).then(([termsRes, studentsRes, feeItemsRes]) => {
            setTerms(termsRes.data);
            setStudents(studentsRes.data);
            setFeeItems(feeItemsRes.data);
            const current = termsRes.data.find((t) => t.isCurrent);
            if (current) setTermId(current.id.toString());
            else if (termsRes.data.length > 0) setTermId(termsRes.data[0].id.toString());
        }).catch(() => setError('Could not load initial data'));
    }, []);

    const loadTermData = useCallback(async () => {
        if (!termId) return;
        setLoading(true); setError('');
        try {
            const [invoicesRes, summaryRes] = await Promise.all([
                axiosClient.get(`/fee-invoices/term/${termId}`),
                axiosClient.get(`/fee-invoices/term/${termId}/summary`),
            ]);
            setInvoices(invoicesRes.data);
            setSummary(summaryRes.data);
        } catch {
            setError('Could not load fee data for this term');
        } finally { setLoading(false); }
    }, [termId]);

    useEffect(() => {queueMicrotask(() => loadTermData()); }, [loadTermData]);

    const formatKES = (value) => `KES ${Number(value).toLocaleString()}`;

    return (
        <div>
            <div className="flex items-start justify-between mb-6 flex-wrap gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Fee Collection</h1>
                    <p className="text-sm text-slate-500 mt-1">Invoices, payments, and collection summary by term.</p>
                </div>
                <div className="flex items-center gap-3">
                    <select value={termId} onChange={(e) => setTermId(e.target.value)}
                            className="px-4 py-2.5 rounded-lg border border-slate-200 text-sm font-medium text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-teal-accent">
                        {terms.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
                    </select>
                    <Link to="/fee-items" className="flex items-center gap-1.5 border border-slate-200 text-slate-600 hover:bg-slate-50 text-sm font-medium px-4 py-2.5 rounded-lg transition-colors">
                        <Settings size={16} /> Fee items
                    </Link>
                    <button onClick={() => setInvoiceModalOpen(true)}
                            className="flex items-center gap-1.5 bg-navy-900 hover:bg-navy-800 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors">
                        <Plus size={16} /> Create invoice
                    </button>
                </div>
            </div>

            {error && <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2 mb-4">{error}</p>}

            {summary && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                    <div className="bg-white rounded-xl border border-slate-200 p-5">
                        <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center mb-4"><Wallet size={18} className="text-slate-600" /></div>
                        <p className="text-2xl font-bold text-slate-900">{formatKES(summary.totalBilled)}</p>
                        <p className="text-sm text-slate-500 mt-1">Total Billed</p>
                    </div>
                    <div className="bg-white rounded-xl border border-slate-200 p-5">
                        <div className="w-10 h-10 rounded-lg bg-teal-accent/15 flex items-center justify-center mb-4"><CheckCircle2 size={18} className="text-teal-700" /></div>
                        <p className="text-2xl font-bold text-slate-900">{formatKES(summary.totalCollected)}</p>
                        <p className="text-sm text-slate-500 mt-1">Total Collected</p>
                    </div>
                    <div className="bg-white rounded-xl border border-slate-200 p-5">
                        <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center mb-4"><TrendingDown size={18} className="text-red-600" /></div>
                        <p className="text-2xl font-bold text-slate-900">{formatKES(summary.outstandingBalance)}</p>
                        <p className="text-sm text-slate-500 mt-1">Outstanding Balance</p>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-100">
                        <h2 className="text-base font-bold text-slate-900">Invoices</h2>
                    </div>
                    <table className="w-full text-sm">
                        <thead>
                        <tr className="border-b border-slate-100 text-left text-[11px] font-semibold tracking-wider text-slate-400">
                            <th className="px-6 py-3">STUDENT</th>
                            <th className="px-6 py-3">BILLED</th>
                            <th className="px-6 py-3">PAID</th>
                            <th className="px-6 py-3">BALANCE</th>
                            <th className="px-6 py-3 text-right">ACTIONS</th>
                        </tr>
                        </thead>
                        <tbody>
                        {loading && <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-400">Loading invoices...</td></tr>}
                        {!loading && invoices.length === 0 && <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-400">No invoices for this term yet.</td></tr>}
                        {invoices.map((inv) => (
                            <tr key={inv.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50">
                                <td className="px-6 py-4 font-medium text-slate-800">{inv.studentName}</td>
                                <td className="px-6 py-4 text-slate-600">{formatKES(inv.totalBilled)}</td>
                                <td className="px-6 py-4 text-slate-600">{formatKES(inv.totalPaid)}</td>
                                <td className="px-6 py-4">
                                    {inv.balance > 0
                                        ? <span className="text-red-600 font-medium">{formatKES(inv.balance)}</span>
                                        : <span className="inline-block bg-teal-accent/15 text-teal-700 text-xs font-medium px-2.5 py-1 rounded-full">Paid in full</span>}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button onClick={() => setPaymentModalInvoice(inv)} className="text-teal-600 hover:text-teal-700 font-medium">
                                        Record payment
                                    </button>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>

                <div className="bg-white rounded-xl border border-slate-200 p-5">
                    <h2 className="text-base font-bold text-slate-900 mb-1">Collection by Method</h2>
                    <p className="text-sm text-slate-500 mb-4">This term's payments</p>

                    {summary && summary.collectionByMethod.length > 0 ? (
                        <>
                            <ResponsiveContainer width="100%" height={200}>
                                <PieChart>
                                    <Pie data={summary.collectionByMethod} dataKey="amount" nameKey="method" innerRadius={55} outerRadius={80} paddingAngle={2}>
                                        {summary.collectionByMethod.map((_, index) => (
                                            <Bar key={index} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={(value) => formatKES(value)} />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="space-y-2 mt-2">
                                {summary.collectionByMethod.map((m, index) => (
                                    <div key={m.method} className="flex items-center justify-between text-sm">
                                        <div className="flex items-center gap-2">
                                            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }} />
                                            <span className="text-slate-600">{m.method}</span>
                                        </div>
                                        <span className="font-medium text-slate-800">{m.percentage.toFixed(0)}%</span>
                                    </div>
                                ))}
                            </div>
                        </>
                    ) : (
                        <p className="text-sm text-slate-400 py-8 text-center">No payments recorded yet.</p>
                    )}
                </div>
            </div>

            {invoiceModalOpen && (
                <InvoiceModal
                    students={students}
                    feeItems={feeItems}
                    termId={termId}
                    onClose={() => setInvoiceModalOpen(false)}
                    onSaved={() => { setInvoiceModalOpen(false); loadTermData(); }}
                />
            )}

            {paymentModalInvoice && (
                <PaymentModal
                    invoice={paymentModalInvoice}
                    onClose={() => setPaymentModalInvoice(null)}
                    onSaved={() => { setPaymentModalInvoice(null); loadTermData(); }}
                />
            )}
        </div>
    );
}