import { useEffect, useState, useCallback } from 'react';
import { Plus, X, ArrowLeft, Eye, Pencil, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';
import ConfirmDialog from '../../components/shared/ConfirmDialog';
import EmptyState from '../../components/shared/EmptyState';
import { TableSkeleton } from '../../components/shared/LoadingSkeleton';
import { useToast } from '../../context/ToastContext';

function FeeItemModal({ initialData, onClose, onSaved, readOnly }) {
    const isEdit = Boolean(initialData);
    const isView = readOnly && isEdit;
    const [name, setName] = useState(initialData?.name || '');
    const [error, setError] = useState('');
    const [saving, setSaving] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name.trim()) { setError('Name is required'); return; }
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
        <div className="fixed inset-0 bg-slate-900/40 flex items-center justify-center z-50 px-4" onClick={onClose}>
            <div className="bg-white rounded-2xl w-full max-w-sm shadow-elevated animate-fade-in" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between px-5 py-4 border-b border-surface-100">
                    <h2 className="text-lg font-bold text-slate-900">{isView ? 'View fee item' : isEdit ? 'Edit fee item' : 'Add fee item'}</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
                </div>
                <form onSubmit={handleSubmit} className="p-5 space-y-4">
                    <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1">Name</label>
                        <input required value={name} onChange={(e) => setName(e.target.value)} disabled={isView} placeholder="e.g. Tuition"
                            className="w-full px-3 py-2.5 rounded-lg bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-accent disabled:opacity-60" />
                    </div>
                    {error && <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</p>}
                    <div className="flex gap-3 pt-2">
                        <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50">{isView ? 'Close' : 'Cancel'}</button>
                        {!isView && <button type="submit" disabled={saving} className="flex-1 py-2.5 rounded-lg bg-navy-900 hover:bg-navy-800 text-white text-sm font-medium disabled:opacity-60">{saving ? 'Saving...' : isEdit ? 'Save changes' : 'Add item'}</button>}
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
    const [viewing, setViewing] = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const toast = useToast();

    const load = useCallback(async () => {
        setLoading(true); setError('');
        try { const { data } = await axiosClient.get('/fee-items'); setItems(data); }
        catch { setError('Could not load fee items'); }
        finally { setLoading(false); }
    }, []);

    useEffect(() => { load(); }, [load]);

    const handleDelete = async () => {
        if (!deleteTarget) return;
        const id = deleteTarget.id;
        const name = deleteTarget.name;
        setDeleteTarget(null);
        try {
            await axiosClient.delete(`/fee-items/${id}`);
            setItems((prev) => prev.filter((i) => i.id !== id));
            toast.success(`"${name}" deleted`);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Could not delete');
        }
    };

    return (
        <div className="animate-fade-in-up">
            <Link to="/fees" className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-700 mb-4"><ArrowLeft size={15} /> Back to Fee Collection</Link>
            <div className="flex items-center justify-between mb-6">
                <div><h1 className="text-[26px] font-bold text-slate-900 tracking-tight">Fee Items</h1><p className="text-sm text-slate-500 mt-1">Fee components available when building invoices.</p></div>
                <button onClick={() => { setEditing(null); setViewing(null); setModalOpen(true); }} className="flex items-center gap-1.5 bg-navy-900 hover:bg-navy-800 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors"><Plus size={16} /> Add item</button>
            </div>

            {loading && <TableSkeleton columns={2} rows={5} />}
            {error && !loading && <div className="bg-red-50 border border-red-100 rounded-xl p-6 text-center"><p className="text-red-600 text-sm mb-3">{error}</p><button onClick={load} className="text-sm font-medium text-red-700 underline">Try again</button></div>}
            {!loading && !error && items.length === 0 && <EmptyState title="No fee items yet" description="Add tuition, transport, etc." action={<button onClick={() => { setEditing(null); setViewing(null); setModalOpen(true); }} className="flex items-center gap-1.5 bg-navy-900 hover:bg-navy-800 text-white text-sm font-medium px-4 py-2.5 rounded-lg"><Plus size={16} /> Add item</button>} />}

            {!loading && !error && items.length > 0 && (
                <div className="bg-white rounded-2xl border border-surface-200 shadow-card overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead><tr className="border-b border-surface-100 text-left text-[11px] font-semibold tracking-wider text-slate-400"><th className="px-5 py-3">NAME</th><th className="px-5 py-3 text-right">ACTIONS</th></tr></thead>
                            <tbody>
                                {items.map((i) => (
                                    <tr key={i.id} className="border-b border-surface-50 last:border-0 hover:bg-surface-50/50 transition-colors">
                                        <td className="px-5 py-3.5 font-medium text-slate-800">{i.name}</td>
                                        <td className="px-5 py-3.5 text-right whitespace-nowrap">
                                            <div className="flex items-center justify-end gap-1">
                                                <button onClick={() => { setViewing(i); setEditing(null); setModalOpen(true); }} title="View" className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-surface-100"><Eye size={16} /></button>
                                                <button onClick={() => { setEditing(i); setViewing(null); setModalOpen(true); }} title="Edit" className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-surface-100"><Pencil size={16} /></button>
                                                <button onClick={() => setDeleteTarget(i)} title="Delete" className="p-2 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50"><Trash2 size={16} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {modalOpen && <FeeItemModal initialData={editing || viewing} readOnly={!!viewing} onClose={() => setModalOpen(false)} onSaved={() => { setModalOpen(false); load(); toast.success('Fee item saved'); }} />}
            <ConfirmDialog open={!!deleteTarget} title="Delete fee item" message={`Delete "${deleteTarget?.name}"?`} confirmLabel="Delete" variant="danger" onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} />
        </div>
    );
}
