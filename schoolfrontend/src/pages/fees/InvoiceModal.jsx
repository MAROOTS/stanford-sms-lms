import { useState } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import axiosClient from '../../api/axiosClient';

export default function InvoiceModal({ students, feeItems, termId, onClose, onSaved }) {
    const [studentId, setStudentId] = useState('');
    const [lineItems, setLineItems] = useState([{ feeItemId: '', amount: '' }]);
    const [error, setError] = useState('');
    const [saving, setSaving] = useState(false);

    const addRow = () => setLineItems((prev) => [...prev, { feeItemId: '', amount: '' }]);
    const removeRow = (index) => setLineItems((prev) => prev.filter((_, i) => i !== index));
    const updateRow = (index, field, value) => {
        setLineItems((prev) => prev.map((row, i) => (i === index ? { ...row, [field]: value } : row)));
    };

    const total = lineItems.reduce((sum, row) => sum + (Number(row.amount) || 0), 0);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        const validRows = lineItems.filter((r) => r.feeItemId && r.amount);
        if (!studentId) return setError('Select a student');
        if (validRows.length === 0) return setError('Add at least one fee line item');

        setSaving(true);
        try {
            await axiosClient.post('/fee-invoices', {
                studentId: Number(studentId),
                termId: Number(termId),
                lineItems: validRows.map((r) => ({ feeItemId: Number(r.feeItemId), amount: Number(r.amount) })),
            });
            onSaved();
        } catch (err) {
            setError(err.response?.data?.message || 'Something went wrong');
        } finally { setSaving(false); }
    };

    return (
        <div className="fixed inset-0 bg-slate-900/40 flex items-center justify-center z-50 px-4 py-8 overflow-y-auto">
            <div className="bg-white rounded-xl w-full max-w-lg p-6 shadow-xl my-auto">
                <div className="flex items-center justify-between mb-5">
                    <h2 className="text-lg font-bold text-slate-900">Create invoice</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Student</label>
                        <select required value={studentId} onChange={(e) => setStudentId(e.target.value)}
                                className="w-full px-3 py-2.5 rounded-lg bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-accent">
                            <option value="">Select student...</option>
                            {students.map((s) => <option key={s.id} value={s.id}>{s.firstName} {s.lastName}</option>)}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Fee line items</label>
                        <div className="space-y-2">
                            {lineItems.map((row, index) => (
                                <div key={index} className="flex gap-2">
                                    <select value={row.feeItemId} onChange={(e) => updateRow(index, 'feeItemId', e.target.value)}
                                            className="flex-1 px-3 py-2.5 rounded-lg bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-accent">
                                        <option value="">Select item...</option>
                                        {feeItems.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}
                                    </select>
                                    <input type="number" min="0" step="0.01" value={row.amount} onChange={(e) => updateRow(index, 'amount', e.target.value)}
                                           placeholder="Amount"
                                           className="w-32 px-3 py-2.5 rounded-lg bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-accent" />
                                    <button type="button" onClick={() => removeRow(index)} disabled={lineItems.length === 1}
                                            className="text-slate-400 hover:text-red-500 disabled:opacity-30 px-1">
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            ))}
                        </div>
                        <button type="button" onClick={addRow} className="flex items-center gap-1 text-sm font-medium text-teal-600 hover:text-teal-700 mt-2">
                            <Plus size={14} /> Add line item
                        </button>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                        <span className="text-sm font-medium text-slate-600">Total</span>
                        <span className="text-lg font-bold text-slate-900">KES {total.toLocaleString()}</span>
                    </div>

                    {error && <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</p>}

                    <div className="flex gap-3 pt-2">
                        <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50">Cancel</button>
                        <button type="submit" disabled={saving} className="flex-1 py-2.5 rounded-lg bg-navy-900 hover:bg-navy-800 text-white text-sm font-medium disabled:opacity-60">
                            {saving ? 'Saving...' : 'Create invoice'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}