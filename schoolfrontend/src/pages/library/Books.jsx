import { useEffect, useState, useCallback } from 'react';
import { Plus, Library, Eye, Pencil, Trash2, X, Copy, Bookmark } from 'lucide-react';
import axiosClient from '../../api/axiosClient';
import ConfirmDialog from '../../components/shared/ConfirmDialog';
import EmptyState from '../../components/shared/EmptyState';
import { TableSkeleton } from '../../components/shared/LoadingSkeleton';
import { useToast } from '../../context/ToastContext';

function BookModal({ initialData, onClose, onSaved, readOnly }) {
    const isEdit = Boolean(initialData);
    const isView = readOnly && isEdit;
    const [title, setTitle] = useState(initialData?.title || '');
    const [author, setAuthor] = useState(initialData?.author || '');
    const [isbn, setIsbn] = useState(initialData?.isbn || '');
    const [publisher, setPublisher] = useState(initialData?.publisher || '');
    const [error, setError] = useState('');
    const [saving, setSaving] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!title.trim()) { setError('Title is required'); return; }
        setError(''); setSaving(true);
        try {
            const payload = { title, author: author || null, isbn: isbn || null, publisher: publisher || null };
            if (isEdit) await axiosClient.put(`/library/books/${initialData.id}`, payload);
            else await axiosClient.post('/library/books', payload);
            onSaved();
        } catch (err) {
            setError(err.response?.data?.message || 'Something went wrong');
        } finally { setSaving(false); }
    };

    return (
        <div className="fixed inset-0 bg-slate-900/40 flex items-center justify-center z-50 px-4" onClick={onClose}>
            <div className="bg-white rounded-2xl w-full max-w-md shadow-elevated animate-fade-in" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between px-5 py-4 border-b border-surface-100">
                    <h2 className="text-lg font-bold text-slate-900">{isView ? 'View book' : isEdit ? 'Edit book' : 'Add book'}</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-surface-50"><X size={20} /></button>
                </div>
                <form onSubmit={handleSubmit} className="p-5 space-y-4">
                    <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1">Title *</label>
                        <input value={title} onChange={(e) => setTitle(e.target.value)} disabled={isView} className="w-full px-3 py-2.5 rounded-lg bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-accent disabled:opacity-60" />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1">Author</label>
                        <input value={author} onChange={(e) => setAuthor(e.target.value)} disabled={isView} className="w-full px-3 py-2.5 rounded-lg bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-accent disabled:opacity-60" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-medium text-slate-500 mb-1">ISBN</label>
                            <input value={isbn} onChange={(e) => setIsbn(e.target.value)} disabled={isView} className="w-full px-3 py-2.5 rounded-lg bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-accent disabled:opacity-60" />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-slate-500 mb-1">Publisher</label>
                            <input value={publisher} onChange={(e) => setPublisher(e.target.value)} disabled={isView} className="w-full px-3 py-2.5 rounded-lg bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-accent disabled:opacity-60" />
                        </div>
                    </div>
                    {error && <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</p>}
                    <div className="flex gap-3 pt-2">
                        <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50">{isView ? 'Close' : 'Cancel'}</button>
                        {!isView && <button type="submit" disabled={saving} className="flex-1 py-2.5 rounded-lg bg-navy-900 hover:bg-navy-800 text-white text-sm font-medium disabled:opacity-60">{saving ? 'Saving...' : isEdit ? 'Save changes' : 'Add book'}</button>}
                    </div>
                </form>
            </div>
        </div>
    );
}

export default function Books() {
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState(null);
    const [viewing, setViewing] = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const toast = useToast();

    const load = useCallback(async () => {
        setLoading(true); setError('');
        try {
            const { data } = await axiosClient.get('/library/books');
            setBooks(Array.isArray(data) ? data : []);
        } catch { setError('Could not load books'); }
        finally { setLoading(false); }
    }, []);

    useEffect(() => { load(); }, [load]);

    const handleDelete = async () => {
        if (!deleteTarget) return;
        const id = deleteTarget.id;
        const name = deleteTarget.title;
        setDeleteTarget(null);
        try {
            await axiosClient.delete(`/library/books/${id}`);
            setBooks((prev) => prev.filter((b) => b.id !== id));
            toast.success(`"${name}" deleted`);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Could not delete');
        }
    };

    return (
        <div className="animate-fade-in-up">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-[26px] font-bold text-slate-900 tracking-tight">Library Books</h1>
                    <p className="text-sm text-slate-500 mt-1">Manage your school library catalog.</p>
                </div>
                <button onClick={() => { setEditing(null); setViewing(null); setModalOpen(true); }}
                    className="flex items-center gap-1.5 bg-navy-900 hover:bg-navy-800 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors">
                    <Plus size={16} /> Add book
                </button>
            </div>

            {loading && <TableSkeleton columns={5} rows={5} />}
            {error && !loading && <div className="bg-red-50 border border-red-100 rounded-xl p-6 text-center"><p className="text-red-600 text-sm mb-3">{error}</p><button onClick={load} className="text-sm font-medium text-red-700 underline">Try again</button></div>}
            {!loading && !error && books.length === 0 && (
                <EmptyState icon={Library} title="No books yet" description="Add your first book to the library catalog." action={<button onClick={() => { setEditing(null); setViewing(null); setModalOpen(true); }} className="flex items-center gap-1.5 bg-navy-900 hover:bg-navy-800 text-white text-sm font-medium px-4 py-2.5 rounded-lg"><Plus size={16} /> Add book</button>} />
            )}

            {!loading && !error && books.length > 0 && (
                <div className="bg-white rounded-2xl border border-surface-200 shadow-card overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead><tr className="border-b border-surface-100 text-left text-[11px] font-semibold tracking-wider text-slate-400"><th className="px-5 py-3">TITLE</th><th className="px-5 py-3">AUTHOR</th><th className="px-5 py-3">ISBN</th><th className="px-5 py-3">PUBLISHER</th><th className="px-5 py-3 text-right">ACTIONS</th></tr></thead>
                            <tbody>
                                {books.map((b) => (
                                    <tr key={b.id} className="border-b border-surface-50 last:border-0 hover:bg-surface-50/50 transition-colors">
                                        <td className="px-5 py-3.5 font-medium text-slate-800">{b.title}</td>
                                        <td className="px-5 py-3.5 text-slate-600">{b.author || '—'}</td>
                                        <td className="px-5 py-3.5 text-slate-500 text-xs font-mono">{b.isbn || '—'}</td>
                                        <td className="px-5 py-3.5 text-slate-500">{b.publisher || '—'}</td>
                                        <td className="px-5 py-3.5 text-right whitespace-nowrap">
                                            <div className="flex items-center justify-end gap-1">
                                                <button onClick={() => { setViewing(b); setEditing(null); setModalOpen(true); }} title="View" className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-surface-100"><Eye size={16} /></button>
                                                <button onClick={() => { setEditing(b); setViewing(null); setModalOpen(true); }} title="Edit" className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-surface-100"><Pencil size={16} /></button>
                                                <button onClick={() => setDeleteTarget(b)} title="Delete" className="p-2 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50"><Trash2 size={16} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {modalOpen && <BookModal initialData={editing || viewing} readOnly={!!viewing} onClose={() => setModalOpen(false)} onSaved={() => { setModalOpen(false); load(); toast.success('Book saved'); }} />}
            <ConfirmDialog open={!!deleteTarget} title="Delete book" message={`Delete "${deleteTarget?.title}"?`} confirmLabel="Delete" variant="danger" onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} />
        </div>
    );
}
