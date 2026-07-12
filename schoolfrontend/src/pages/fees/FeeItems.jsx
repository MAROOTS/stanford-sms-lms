import { useEffect, useState, useCallback } from 'react';
import { Plus, X, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';

function FeeItemModal({ initialData, onClose, onSaved }) {
    const isEdit = Boolean(initialData);
    const [name, setName] = useState(initialData?.name || '');
    const [error, setError] = useState('');
    const [saving, setSaving] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(''); setSaving(true);
        try {
            if (isEdit) await axiosClient.put(`/fee-items/${initialData.id}`, { name });
            else await axiosClient.post('/fee-items', { name });
            onSaved();
        } catch (err) {
            setError(err.response?.data?.message || 'Something went wrong');
        } finally { setSaving(false); }
    };

    return (
        <div className="fixed inset-0 bg-slate-900/40 flex items-center justify-center z-50 px-4">
            <div className="bg-white rounded-xl w-full max-w-sm p-6 shadow-xl">
                <div className="flex items-center justify-between mb-5">
                    <h2 className="text-lg font-bold text-slate-900">{isEdit ? 'Edit fee item' : 'Add fee item'}</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Name</label>
                        <input required value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Tuition"
                               className="w-full px-3 py-2.5 rounded-lg bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-accent" />
                    </div>
                    {error && <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</p>}
                    <div className="flex gap-3 pt-2">
                        <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50">Cancel</button>
                        <button type="submit" disabled={saving} className="flex-1 py-2.5 rounded-lg bg-navy-900 hover:bg-navy-800 text-white text-sm font-medium disabled:opacity-60">
                            {saving ? 'Saving...' : isEdit ? 'Save changes' : 'Add item'}
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

    useEffect(() => { load(); }, [load]);

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
        <div>
            <Link to="/fees" className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-700 mb-4">
                <ArrowLeft size={15} /> Back to Fee Collection
            </Link>

            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Fee Items</h1>
                    <p className="text-sm text-slate-500 mt-1">The fee components available when building invoices.</p>
                </div>
                <button onClick={() => { setEditing(null); setModalOpen(true); }}
                        className="flex items-center gap-1.5 bg-navy-900 hover:bg-navy-800 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors">
                    <Plus size={16} /> Add item
                </button>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <table className="w-full text-sm">
                    <thead>
                    <tr className="border-b border-slate-100 text-left text-[11px] font-semibold tracking-wider text-slate-400">
                        <th className="px-6 py-3">NAME</th>
                        <th className="px-6 py-3 text-right">ACTIONS</th>
                    </tr>
                    </thead>
                    <tbody>
                    {loading && <tr><td colSpan={2} className="px-6 py-8 text-center text-slate-400">Loading...</td></tr>}
                    {error && !loading && <tr><td colSpan={2} className="px-6 py-8 text-center text-red-500">{error}</td></tr>}
                    {!loading && !error && items.length === 0 && <tr><td colSpan={2} className="px-6 py-8 text-center text-slate-400">No fee items yet.</td></tr>}
                    {items.map((i) => (
                        <tr key={i.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50">
                            <td className="px-6 py-4 font-medium text-slate-800">{i.name}</td>
                            <td className="px-6 py-4 text-right">
                                <button onClick={() => { setEditing(i); setModalOpen(true); }} className="text-slate-500 hover:text-slate-700 font-medium mr-4">Edit</button>
                                <button onClick={() => handleDelete(i.id)} className="text-red-500 hover:text-red-600 font-medium">Delete</button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>

            {modalOpen && <FeeItemModal initialData={editing} onClose={() => setModalOpen(false)} onSaved={() => { setModalOpen(false); load(); }} />}
        </div>
    );
}