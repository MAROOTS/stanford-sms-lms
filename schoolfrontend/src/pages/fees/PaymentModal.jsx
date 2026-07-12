import { useState } from 'react';
import { X } from 'lucide-react';
import axiosClient from '../../api/axiosClient';

const METHOD_SUGGESTIONS = ['M-Pesa', 'Bank Transfer', 'Cash', 'Cheque'];

function todayISO() {
    return new Date().toISOString().slice(0, 10);
}

export default function PaymentModal({ invoice, onClose, onSaved }) {
    const [amount, setAmount] = useState('');
    const [method, setMethod] = useState('');
    const [paymentDate, setPaymentDate] = useState(todayISO());
    const [reference, setReference] = useState('');
    const [error, setError] = useState('');
    const [saving, setSaving] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(''); setSaving(true);
        try {
            await axiosClient.post(`/fee-invoices/${invoice.id}/payments`, {
                amount: Number(amount), method, paymentDate, reference: reference || null,
            });
            onSaved();
        } catch (err) {
            setError(err.response?.data?.message || 'Something went wrong');
        } finally { setSaving(false); }
    };

    return (
        <div className="fixed inset-0 bg-slate-900/40 flex items-center justify-center z-50 px-4">
            <div className="bg-white rounded-xl w-full max-w-sm p-6 shadow-xl">
                <div className="flex items-center justify-between mb-2">
                    <h2 className="text-lg font-bold text-slate-900">Record payment</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
                </div>
                <p className="text-sm text-slate-500 mb-5">
                    {invoice.studentName} · Balance: KES {invoice.balance.toLocaleString()}
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Amount</label>
                        <input type="number" min="0.01" step="0.01" required value={amount} onChange={(e) => setAmount(e.target.value)}
                               className="w-full px-3 py-2.5 rounded-lg bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-accent" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Method</label>
                        <input required value={method} onChange={(e) => setMethod(e.target.value)} list="method-suggestions" placeholder="e.g. M-Pesa"
                               className="w-full px-3 py-2.5 rounded-lg bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-accent" />
                        <datalist id="method-suggestions">
                            {METHOD_SUGGESTIONS.map((m) => <option key={m} value={m} />)}
                        </datalist>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Payment date</label>
                        <input type="date" required value={paymentDate} onChange={(e) => setPaymentDate(e.target.value)}
                               className="w-full px-3 py-2.5 rounded-lg bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-accent" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Reference <span className="text-slate-400 font-normal">(optional)</span></label>
                        <input value={reference} onChange={(e) => setReference(e.target.value)} placeholder="e.g. M-Pesa transaction code"
                               className="w-full px-3 py-2.5 rounded-lg bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-accent" />
                    </div>

                    {error && <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</p>}

                    <div className="flex gap-3 pt-2">
                        <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50">Cancel</button>
                        <button type="submit" disabled={saving} className="flex-1 py-2.5 rounded-lg bg-navy-900 hover:bg-navy-800 text-white text-sm font-medium disabled:opacity-60">
                            {saving ? 'Saving...' : 'Record payment'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}