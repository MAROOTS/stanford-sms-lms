import { useState } from 'react';
import { X } from 'lucide-react';
import axiosClient from '../../api/axiosClient';

const REASONS = ['Staff child', 'Sibling discount', 'Scholarship', 'Hardship', 'Other'];

export default function WaiverModal({ invoice, onClose, onSaved }) {
    const [amount, setAmount] = useState('');
    const [reason, setReason] = useState('Scholarship');
    const [error, setError] = useState('');
    const [saving, setSaving] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (Number(amount) > Number(invoice.balance)) {
            setError(`Cannot exceed outstanding KES ${Number(invoice.balance).toLocaleString()}`);
            return;
        }
        setSaving(true);
        setError('');
        try {
            await axiosClient.post(`/fee-invoices/${invoice.id}/waivers`, {
                amount: Number(amount),
                reason,
            });
            onSaved();
        } catch (err) {
            setError(err.response?.data?.message || 'Could not apply waiver');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-slate-900/40 flex items-center justify-center z-50 px-4">
            <div className="bg-white rounded-xl w-full max-w-sm p-6 shadow-xl">
                <div className="flex items-center justify-between mb-2">
                    <h2 className="text-lg font-bold text-slate-900">Apply waiver</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
                </div>
                <p className="text-sm text-slate-500 mb-5">
                    {invoice.invoiceNumber} · {invoice.studentName}<br />
                    Outstanding KES {Number(invoice.balance).toLocaleString()}
                </p>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Reason</label>
                        <select value={reason} onChange={(e) => setReason(e.target.value)}
                                className="w-full px-3 py-2.5 rounded-lg bg-slate-50 border border-slate-200 text-sm">
                            {REASONS.map((r) => <option key={r}>{r}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Amount (KES)</label>
                        <input type="number" min="0.01" step="0.01" max={invoice.balance} required
                               value={amount} onChange={(e) => setAmount(e.target.value)}
                               className="w-full px-3 py-2.5 rounded-lg bg-slate-50 border border-slate-200 text-sm" />
                    </div>
                    {error && <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</p>}
                    <div className="flex gap-3">
                        <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-lg border border-slate-200 text-sm">Cancel</button>
                        <button type="submit" disabled={saving} className="flex-1 py-2.5 rounded-lg bg-navy-900 text-white text-sm font-medium disabled:opacity-50">
                            {saving ? 'Saving…' : 'Apply waiver'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}