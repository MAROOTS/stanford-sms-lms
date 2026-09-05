import { useState } from 'react';
import { X } from 'lucide-react';
import axiosClient from '../../api/axiosClient';

export default function GenerateInvoicesModal({ termId, classFilter, classSections, feeItems, onClose, onGenerated }) {
    const withAmount = feeItems.filter((f) => Number(f.defaultAmount) > 0);
    const [selected, setSelected] = useState(withAmount.map((f) => f.id));
    const [dueDate, setDueDate] = useState('');
    const [error, setError] = useState('');
    const [saving, setSaving] = useState(false);
    const [result, setResult] = useState(null);

    const scopeLabel = classFilter
        ? classSections.find((c) => c.id === Number(classFilter))?.name || 'this class'
        : 'all students';

    const toggle = (id) => setSelected((prev) =>
        prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (selected.length === 0) return setError('Select at least one fee item');
        setSaving(true);
        setError('');
        try {
            const { data } = await axiosClient.post('/fee-invoices/generate', {
                termId: Number(termId),
                classSectionId: classFilter ? Number(classFilter) : null,
                feeItemIds: selected,
                dueDate: dueDate || null,
            });
            setResult(data);
        } catch (err) {
            setError(err.response?.data?.message || 'Could not generate invoices');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-slate-900/40 flex items-center justify-center z-50 px-4">
            <div className="bg-white rounded-xl w-full max-w-md p-6 shadow-xl">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold text-slate-900">Generate invoices</h2>
                    <button onClick={result ? onGenerated : onClose} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
                </div>

                {result ? (
                    <div>
                        <p className="text-sm text-slate-700 mb-3">
                            Created <strong>{result.created}</strong> invoices for {scopeLabel}.
                            {result.skippedExisting > 0 && <> Skipped {result.skippedExisting} who already had one.</>}
                        </p>
                        <button onClick={onGenerated} className="w-full py-2.5 rounded-lg bg-navy-900 text-white text-sm font-medium">Done</button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <p className="text-sm text-slate-500">
                            Bill <strong>{scopeLabel}</strong> using each item’s default amount. Existing invoices are left alone.
                        </p>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">Due date (optional)</label>
                            <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)}
                                   className="w-full px-3 py-2.5 rounded-lg bg-slate-50 border border-slate-200 text-sm" />
                        </div>
                        <div className="space-y-2 max-h-48 overflow-y-auto">
                            {withAmount.length === 0 && (
                                <p className="text-sm text-amber-700">Set a default amount on Fee Items first.</p>
                            )}
                            {withAmount.map((f) => (
                                <label key={f.id} className="flex items-center gap-2 text-sm">
                                    <input type="checkbox" checked={selected.includes(f.id)} onChange={() => toggle(f.id)} />
                                    <span className="flex-1">{f.name}</span>
                                    <span className="text-slate-500">KES {Number(f.defaultAmount).toLocaleString()}</span>
                                </label>
                            ))}
                        </div>
                        {error && <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</p>}
                        <div className="flex gap-3">
                            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-lg border border-slate-200 text-sm">Cancel</button>
                            <button type="submit" disabled={saving || withAmount.length === 0}
                                    className="flex-1 py-2.5 rounded-lg bg-navy-900 text-white text-sm font-medium disabled:opacity-50">
                                {saving ? 'Generating...' : 'Generate'}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}