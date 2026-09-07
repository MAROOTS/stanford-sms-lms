import { useEffect, useState, useCallback } from 'react';
import { Plus, X, ArrowLeft, Coins, Pencil, Trash2, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';

function FeeItemModal({ initialData, onClose, onSaved }) {
    const isEdit = Boolean(initialData);
    const [name, setName] = useState(initialData?.name || '');
    const [defaultAmount, setDefaultAmount] = useState(initialData?.defaultAmount || '');
    const [error, setError] = useState('');
    const [saving, setSaving] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(''); setSaving(true);
        try {
            const payload = { name, defaultAmount: defaultAmount ? Number(defaultAmount) : null };
            if (isEdit) await axiosClient.put(`/fee-items/${initialData.id}`, payload);
            else await axiosClient.post('/fee-items', payload);
            onSaved();
        } catch (err) {
            setError(err.response?.data?.message || 'Something went wrong');
        } finally { setSaving(false); }
    };

    return (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 px-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl border border-slate-200">
                <div className="flex items-center justify-between mb-5">
                    <h2 className="text-xl font-bold text-slate-900">{isEdit ? 'Edit fee item' : 'Add fee item'}</h2>
                    <button onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">
                        <X size={20} />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold tracking-wider text-slate-400 uppercase mb-1.5">Name</label>
                        <input
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g. Tuition"
                            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-navy-900/20"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold tracking-wider text-slate-400 uppercase mb-1.5">
                            Default Amount (KES) <span className="text-slate-400 font-normal lowercase">(optional)</span>
                        </label>
                        <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={defaultAmount}
                            onChange={(e) => setDefaultAmount(e.target.value)}
                            placeholder="e.g. 15000"
                            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-navy-900/20"
                        />
                    </div>
                    {error && (
                        <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 text-sm font-medium text-rose-700">
                            {error}
                        </div>
                    )}
                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={saving}
                            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-navy-900 hover:bg-navy-800 text-white text-sm font-semibold transition-all disabled:opacity-60 shadow-sm"
                        >
                            {saving && <Loader2 size={16} className="animate-spin" />}
                            {saving ? 'Saving...' : isEdit ? 'Save Changes' : 'Add Item'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default function FeeItems() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState(null);

    const load = useCallback(async () => {
        setLoading(true); setError('');
        try {
            const { data } = await axiosClient.get('/fee-items');
            setItems(data);
        } catch { setError('Could not load fee items'); }
        finally { setLoading(false); }
    }, []);

    useEffect(() => { queueMicrotask(() => load()); }, [load]);

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this fee item?')) return;
        try {
            await axiosClient.delete(`/fee-items/${id}`);
            setItems((prev) => prev.filter((i) => i.id !== id));
        } catch (err) {
            alert(err.response?.data?.message || 'Could not delete this item.');
        }
    };

    return (
        <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 animate-in fade-in duration-500">
            {/* NAVIGATION LINKS */}
            <div className="flex items-center justify-between mb-6">
                <Link to="/fees" className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors">
                    <ArrowLeft size={16} /> Back to Fee Collection
                </Link>
                <Link to="/fee-structures" className="text-sm font-semibold text-navy-900 hover:underline">
                    Fee structures →
                </Link>
            </div>

            {/* HEADER & CONTROLS */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">Fee Items</h1>
                    <p className="text-sm text-slate-500 mt-1.5">Manage fee components and optional default amounts for billing invoices.</p>
                </div>
                <button
                    onClick={() => { setEditing(null); setModalOpen(true); }}
                    className="flex items-center justify-center gap-2 bg-navy-900 hover:bg-navy-800 text-white shadow-sm text-sm font-semibold px-5 py-2.5 rounded-xl transition-all active:scale-[0.98]"
                >
                    <Plus size={18} /> Add Item
                </button>
            </div>

            {/* DATA TABLE CONTAINER */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 border-b border-slate-200">
                        <tr className="text-[11px] font-bold tracking-wider text-slate-500 uppercase">
                            <th className="px-6 py-4">Name</th>
                            <th className="px-6 py-4">Default Amount</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                        {loading && (
                            <tr>
                                <td colSpan={3} className="px-6 py-12 text-center text-slate-400 font-medium">
                                    <div className="flex items-center justify-center gap-2">
                                        <Loader2 size={18} className="animate-spin text-slate-400" />
                                        Loading fee items...
                                    </div>
                                </td>
                            </tr>
                        )}
                        {error && !loading && (
                            <tr>
                                <td colSpan={3} className="px-6 py-12 text-center text-rose-600 font-medium bg-rose-50/50">
                                    {error}
                                </td>
                            </tr>
                        )}
                        {!loading && !error && items.length === 0 && (
                            <tr>
                                <td colSpan={3} className="px-6 py-12 text-center text-slate-400 font-medium">
                                    No fee items yet. Create your first fee component above.
                                </td>
                            </tr>
                        )}
                        {!loading && !error && items.map((i) => (
                            <tr key={i.id} className="group bg-white hover:bg-slate-50/80 transition-colors">
                                <td className="px-6 py-4 font-semibold text-slate-900">
                                    <div className="flex items-center gap-2.5">
                                        <div className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600">
                                            <Coins size={16} />
                                        </div>
                                        {i.name}
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-slate-700 font-medium">
                                    {i.defaultAmount ? `KES ${i.defaultAmount.toLocaleString()}` : <span className="text-slate-400 font-normal">—</span>}
                                </td>
                                <td className="px-6 py-4 text-right whitespace-nowrap">
                                    <div className="flex items-center justify-end gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => { setEditing(i); setModalOpen(true); }}
                                            title="Edit Item"
                                            className="p-2 rounded-xl text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                                        >
                                            <Pencil size={16} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(i.id)}
                                            title="Delete Item"
                                            className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* MODAL */}
            {modalOpen && (
                <FeeItemModal
                    initialData={editing}
                    onClose={() => setModalOpen(false)}
                    onSaved={() => { setModalOpen(false); load(); }}
                />
            )}
        </div>
    );
}