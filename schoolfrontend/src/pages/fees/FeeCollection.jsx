import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
    Plus,
    Settings,
    Wallet,
    TrendingDown,
    CheckCircle2,
    ChevronDown,
    Receipt,
    Banknote
} from 'lucide-react';
import { PieChart, Pie, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import axiosClient from '../../api/axiosClient';
import InvoiceModal from './InvoiceModal';
import PaymentModal from './PaymentModal';
import NoticeCard from '../../components/shared/NoticeCard';
import { readApiError } from '../../utils/readApiError';
import GenerateInvoicesModal from "./GenerateInvoicesModal";

const CHART_COLORS = [
    '#14b8a6', // Teal 500
    '#0f172a', // Slate 900 (Navy)
    '#f59e0b', // Amber 500
    '#94a3b8', // Slate 400
    '#f43f5e'  // Rose 500
];

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
    const [classSections, setClassSections] = useState([]);
    const [classFilter, setClassFilter] = useState('');
    const [generateOpen, setGenerateOpen] = useState(false);

    // Initial page data
    useEffect(() => {
        Promise.all([
            axiosClient.get('/terms'),
            axiosClient.get('/students'),
            axiosClient.get('/fee-items'),
        ])
            .then(([termsRes, studentsRes, feeItemsRes]) => {
                setTerms(termsRes.data);
                setStudents(studentsRes.data);
                setFeeItems(feeItemsRes.data);

                const current = termsRes.data.find(
                    (t) => t.isCurrent
                );

                if (current) {
                    setTermId(current.id.toString());
                } else if (termsRes.data.length > 0) {
                    setTermId(
                        termsRes.data[0].id.toString()
                    );
                }
            })
            .catch((err) =>
                setError(
                    readApiError(err, {
                        error: 'Could not load fee collection data',
                    }).description
                )
            );
    }, []);

    // Load class sections
    useEffect(() => {
        axiosClient
            .get('/class-sections')
            .then((res) => setClassSections(res.data))
            .catch((err) =>
                setError(
                    readApiError(err, {
                        error: 'Could not load class sections',
                    }).description
                )
            );
    }, []);

    const loadTermData = useCallback(async () => {
        if (!termId) return;

        setLoading(true);
        setError('');

        try {
            const params = classFilter
                ? { classSectionId: classFilter }
                : {};

            const [invoicesRes, summaryRes] = await Promise.all([
                axiosClient.get(`/fee-invoices/term/${termId}`, { params }),
                axiosClient.get(`/fee-invoices/term/${termId}/summary`, { params }),
            ]);

            setInvoices(invoicesRes.data);
            setSummary(summaryRes.data);
        } catch (err) {
            setInvoices([]);
            setSummary(null);
            setError(
                readApiError(err, {
                    forbidden: 'You do not have access to fee data for this term.',
                    error: 'Could not load fee data for this term.',
                }).description
            );
        } finally {
            setLoading(false);
        }
    }, [termId, classFilter]);

    useEffect(() => {
        queueMicrotask(() => loadTermData());
    }, [loadTermData]);

    const formatKES = (value) => `KES ${Number(value).toLocaleString()}`;

    return (
        <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 animate-in fade-in duration-500">
            {/* HEADER & CONTROLS */}
            <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-6 mb-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                        Fee Collection
                    </h1>
                    <p className="text-sm text-slate-500 mt-1.5">
                        Manage invoices, record payments, and monitor collection summaries by term.
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <div className="relative">
                        <select
                            value={classFilter}
                            onChange={(e) => setClassFilter(e.target.value)}
                            className="w-full xl:w-48 appearance-none px-4 py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-navy-900 focus:border-transparent text-sm font-medium text-slate-700 transition-all cursor-pointer"
                        >
                            <option value="">All classes</option>
                            {classSections.map((c) => (
                                <option key={c.id} value={c.id}>
                                    {c.name}
                                </option>
                            ))}
                        </select>
                        <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>

                    <div className="relative">
                        <select
                            value={termId}
                            onChange={(e) => setTermId(e.target.value)}
                            className="w-full xl:w-40 appearance-none px-4 py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-navy-900 focus:border-transparent text-sm font-medium text-slate-700 transition-all cursor-pointer"
                        >
                            {terms.map((t) => (
                                <option key={t.id} value={t.id}>
                                    {t.name}
                                </option>
                            ))}
                        </select>
                        <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>

                    <Link
                        to="/fee-items"
                        className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-navy-900 text-sm font-semibold px-4 py-2.5 rounded-xl transition-all active:scale-[0.98] shadow-sm"
                    >
                        <Settings size={16} className="text-slate-400" />
                        Fee Items
                    </Link>

                    <button
                        onClick={() => setInvoiceModalOpen(true)}
                        className="flex items-center gap-2 bg-navy-900 hover:bg-navy-800 text-white shadow-sm text-sm font-semibold px-5 py-2.5 rounded-xl transition-all active:scale-[0.98]"
                    >
                        <Plus size={18} />
                        Create Invoice
                    </button>
                    <button onClick={() => setGenerateOpen(true)}
                            className="flex items-center gap-2 bg-navy-900 text-white text-sm font-semibold px-4 py-2.5 rounded-xl">
                        Generate invoices
                    </button>
                </div>
            </div>

            {/* ERROR STATE */}
            {error && (
                <div className="mb-8">
                    <NoticeCard
                        notice={{
                            kind: 'error',
                            title: 'Could not load fees',
                            description: error,
                        }}
                        onRetry={loadTermData}
                    />
                </div>
            )}

            {/* SUMMARY CARDS */}
            {summary && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex items-center gap-5">
                        <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
                            <Wallet size={24} className="text-blue-600" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">Total Billed</p>
                            <p className="text-2xl font-bold text-slate-900">{formatKES(summary.totalBilled)}</p>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex items-center gap-5">
                        <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0">
                            <CheckCircle2 size={24} className="text-emerald-600" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">Total Collected</p>
                            <p className="text-2xl font-bold text-slate-900">{formatKES(summary.totalCollected)}</p>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex items-center gap-5">
                        <div className="w-14 h-14 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center shrink-0">
                            <TrendingDown size={24} className="text-rose-600" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">Outstanding</p>
                            <p className="text-2xl font-bold text-slate-900">{formatKES(summary.outstandingBalance)}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* MAIN CONTENT GRID */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* INVOICES TABLE */}
                <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                    <div className="px-6 py-5 border-b border-slate-100 flex items-center gap-2">
                        <Receipt size={18} className="text-slate-400" />
                        <h2 className="text-base font-bold text-slate-900">Term Invoices</h2>
                    </div>

                    <div className="overflow-x-auto custom-scrollbar">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-slate-50 border-b border-slate-200">
                            <tr className="text-[11px] font-bold tracking-wider text-slate-500 uppercase">
                                <th className="px-6 py-4">Student</th>
                                <th className="px-6 py-4">Billed</th>
                                <th className="px-6 py-4">Paid</th>
                                <th className="px-6 py-4">Due Date</th>
                                <th className="px-6 py-4">Balance</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                            {loading && (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center">
                                        <div className="flex flex-col items-center justify-center text-slate-400">
                                            <div className="w-6 h-6 border-2 border-slate-200 border-t-navy-900 rounded-full animate-spin mb-3"></div>
                                            <p className="text-sm font-medium">Loading invoices...</p>
                                        </div>
                                    </td>
                                </tr>
                            )}

                            {!loading && !error && invoices.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-slate-500 font-medium bg-slate-50/50">
                                        No invoices generated for this term yet.
                                    </td>
                                </tr>
                            )}

                            {!loading && !error && invoices.map((inv) => (
                                <tr key={inv.id} className="group bg-white hover:bg-slate-50/80 transition-colors">
                                    <td className="px-6 py-4 font-semibold text-slate-800">
                                        {inv.studentName}
                                    </td>
                                    <td className="px-6 py-4 text-slate-600 font-medium">
                                        {formatKES(inv.totalBilled)}
                                    </td>
                                    <td className="px-6 py-4 text-slate-600 font-medium">
                                        {formatKES(inv.totalPaid)}
                                    </td>
                                    <td className="px-6 py-4">
                                        {inv.dueDate ? (
                                            <span className={`text-xs font-semibold px-2.5 py-1 rounded-lg border ${
                                                new Date(inv.dueDate) < new Date() && inv.balance > 0
                                                    ? 'bg-rose-50 border-rose-100 text-rose-700'
                                                    : 'bg-slate-50 border-slate-200 text-slate-600'
                                            }`}>
                                                    {inv.dueDate}
                                                </span>
                                        ) : (
                                            <span className="text-slate-400">—</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        {inv.balance > 0 ? (
                                            <span className="text-rose-600 font-bold">
                                                    {formatKES(inv.balance)}
                                                </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-bold px-2.5 py-1 rounded-full">
                                                    Paid in full
                                                </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button
                                            onClick={() => setPaymentModalInvoice(inv)}
                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-teal-50 hover:text-teal-700 hover:border-teal-200 transition-all active:scale-[0.98]"
                                        >
                                            <Banknote size={14} /> Record
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* COLLECTION CHART */}
                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm h-fit">
                    <h2 className="text-base font-bold text-slate-900 mb-1">Collection by Method</h2>
                    <p className="text-sm text-slate-500 mb-6">Distribution of this term's payments</p>

                    {summary && summary.collectionByMethod.length > 0 ? (
                        <>
                            <div className="mb-6 relative">
                                <ResponsiveContainer width="100%" height={220}>
                                    <PieChart>
                                        <Pie
                                            data={summary.collectionByMethod}
                                            dataKey="amount"
                                            nameKey="method"
                                            innerRadius={65}
                                            outerRadius={95}
                                            paddingAngle={3}
                                            stroke="none"
                                        >
                                            {summary.collectionByMethod.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            formatter={(value) => formatKES(value)}
                                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>

                            <div className="space-y-3 bg-slate-50 rounded-xl p-4 border border-slate-100">
                                {summary.collectionByMethod.map((m, index) => (
                                    <div key={m.method} className="flex items-center justify-between text-sm">
                                        <div className="flex items-center gap-3">
                                            <span
                                                className="w-3 h-3 rounded-full shadow-sm"
                                                style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }}
                                            />
                                            <span className="font-medium text-slate-700">{m.method}</span>
                                        </div>
                                        <span className="font-bold text-slate-900">
                                            {m.percentage.toFixed(0)}%
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-12 text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200 mt-4">
                            <PieChart size={32} className="mb-3 opacity-50" />
                            <p className="text-sm font-medium">No payments recorded yet.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* MODALS */}
            {invoiceModalOpen && (
                <InvoiceModal
                    students={students}
                    feeItems={feeItems}
                    termId={termId}
                    onClose={() => setInvoiceModalOpen(false)}
                    onSaved={() => {
                        setInvoiceModalOpen(false);
                        loadTermData();
                    }}
                />
            )}

            {paymentModalInvoice && (
                <PaymentModal
                    invoice={paymentModalInvoice}
                    onClose={() => setPaymentModalInvoice(null)}
                    onSaved={() => {
                        setPaymentModalInvoice(null);
                        loadTermData();
                    }}
                />
            )}

            {generateOpen && (
                <GenerateInvoicesModal
                    termId={termId}
                    classFilter={classFilter}
                    classSections={classSections}
                    feeItems={feeItems}
                    onClose={() => setGenerateOpen(false)}
                    onGenerated={() => {
                        setGenerateOpen(false);
                        loadTermData();
                    }}
                />
            )}
        </div>
    );
}