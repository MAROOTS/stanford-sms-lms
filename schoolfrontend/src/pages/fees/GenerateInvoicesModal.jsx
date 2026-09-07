import { useState } from 'react';
import { X } from 'lucide-react';
import axiosClient from '../../api/axiosClient';

export default function GenerateInvoicesModal({
                                                  termId,
                                                  classFilter,
                                                  feeItems,
                                                  onClose,
                                                  onGenerated
                                              }) {
    const [selected, setSelected] = useState(feeItems.map((f) => f.id));
    const [dueDate, setDueDate] = useState('');
    const [error, setError] = useState('');
    const [saving, setSaving] = useState(false);
    const [result, setResult] = useState(null);



    const toggle = (id) => setSelected((prev) =>
        prev.includes(id)
            ? prev.filter((x) => x !== id)
            : [...prev, id]
    );

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (selected.length === 0) {
            return setError('Select at least one fee item');
        }

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
            setError(
                err.response?.data?.message ||
                'Could not generate invoices'
            );
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-slate-900/40 flex items-center justify-center z-50 px-4">
            <div className="bg-white rounded-xl w-full max-w-md p-6 shadow-xl">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold text-slate-900">
                        Generate invoices
                    </h2>

                    <button
                        onClick={result ? onGenerated : onClose}
                        className="text-slate-400 hover:text-slate-600"
                    >
                        <X size={20} />
                    </button>
                </div>

                {result ? (
                    <div>
                        <p className="text-sm text-slate-700 mb-3">
                            Created <strong>{result.created}</strong>. Already had invoice:{' '}
                            <strong>{result.skippedExisting}</strong>.
                            <br />
                            No class: <strong>{result.skippedNoClass}</strong>. No structure:{' '}
                            <strong>{result.skippedNoStructure}</strong>.
                        </p>

                        <button
                            onClick={onGenerated}
                            className="w-full py-2.5 rounded-lg bg-navy-900 text-white text-sm font-medium"
                        >
                            Done
                        </button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <p className="text-sm text-slate-500">
                            Each student is billed from their grade’s fee structure.
                            Students with no class, or a grade with no structure, are skipped.
                        </p>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">
                                Due date (optional)
                            </label>

                            <input
                                type="date"
                                value={dueDate}
                                onChange={(e) => setDueDate(e.target.value)}
                                className="w-full px-3 py-2.5 rounded-lg bg-slate-50 border border-slate-200 text-sm"
                            />
                        </div>

                        <div className="space-y-2 max-h-48 overflow-y-auto">
                            {feeItems.length === 0 && (
                                <p className="text-sm text-amber-700">Add fee items, then set amounts on Fee structures.</p>
                            )}
                            {feeItems.map((f) => (
                                <label key={f.id} className="flex items-center gap-2 text-sm">
                                    <input type="checkbox" checked={selected.includes(f.id)} onChange={() => toggle(f.id)} />
                                    <span>{f.name}</span>
                                </label>
                            ))}
                        </div>

                        {error && (
                            <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                                {error}
                            </p>
                        )}

                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 py-2.5 rounded-lg border border-slate-200 text-sm"
                            >
                                Cancel
                            </button>

                            <button
                                type="submit"
                                disabled={saving || feeItems.length === 0 || selected.length === 0}
                                className="flex-1 py-2.5 rounded-lg bg-navy-900 text-white text-sm font-medium disabled:opacity-50"
                            >
                                {saving ? 'Generating...' : 'Generate'}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}