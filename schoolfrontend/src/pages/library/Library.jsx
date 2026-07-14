import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Plus, BookOpen, PackagePlus, Send } from 'lucide-react';
import axiosClient from '../../api/axiosClient';
import BookModal from './BookModal';
import CopiesModal from './CopiesModal';
import IssueLoanModal from './IssueLoanModal';

export default function Library() {
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [bookModalOpen, setBookModalOpen] = useState(false);
    const [editingBook, setEditingBook] = useState(null);
    const [copiesModalBook, setCopiesModalBook] = useState(null);
    const [loanModalBook, setLoanModalBook] = useState(null);

    const load = useCallback(async () => {
        setLoading(true); setError('');
        try {
            const { data } = await axiosClient.get('/library/books');
            setBooks(data);
        } catch { setError('Could not load the library catalog'); }
        finally { setLoading(false); }
    }, []);

    useEffect(() => { load(); }, [load]);

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this book?')) return;
        try {
            await axiosClient.delete(`/library/books/${id}`);
            setBooks((prev) => prev.filter((b) => b.id !== id));
        } catch (err) {
            alert(err.response?.data?.message || 'Could not delete this book.');
        }
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Library</h1>
                    <p className="text-sm text-slate-500 mt-1">Book catalog, copies, and loans.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Link to="/library/loans" className="flex items-center gap-1.5 border border-slate-200 text-slate-600 hover:bg-slate-50 text-sm font-medium px-4 py-2.5 rounded-lg transition-colors">
                        <Send size={16} /> View loans
                    </Link>
                    <button onClick={() => { setEditingBook(null); setBookModalOpen(true); }}
                            className="flex items-center gap-1.5 bg-navy-900 hover:bg-navy-800 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors">
                        <Plus size={16} /> Add book
                    </button>
                </div>
            </div>

            {error && <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2 mb-4">{error}</p>}

            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <table className="w-full text-sm">
                    <thead>
                    <tr className="border-b border-slate-100 text-left text-[11px] font-semibold tracking-wider text-slate-400">
                        <th className="px-6 py-3">TITLE</th>
                        <th className="px-6 py-3">AUTHOR</th>
                        <th className="px-6 py-3">COPIES</th>
                        <th className="px-6 py-3 text-right">ACTIONS</th>
                    </tr>
                    </thead>
                    <tbody>
                    {loading && <tr><td colSpan={4} className="px-6 py-8 text-center text-slate-400">Loading catalog...</td></tr>}
                    {!loading && books.length === 0 && <tr><td colSpan={4} className="px-6 py-8 text-center text-slate-400">No books yet.</td></tr>}
                    {books.map((b) => (
                        <tr key={b.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50">
                            <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center"><BookOpen size={15} className="text-slate-500" /></div>
                                    <span className="font-medium text-slate-800">{b.title}</span>
                                </div>
                            </td>
                            <td className="px-6 py-4 text-slate-600">{b.author || '—'}</td>
                            <td className="px-6 py-4">
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                      b.availableCopies > 0 ? 'bg-teal-accent/15 text-teal-700' : 'bg-red-50 text-red-600'
                  }`}>
                    {b.availableCopies} / {b.totalCopies} available
                  </span>
                            </td>
                            <td className="px-6 py-4 text-right space-x-4">
                                <button onClick={() => setLoanModalBook(b)} disabled={b.availableCopies === 0}
                                        className="text-teal-600 hover:text-teal-700 font-medium disabled:opacity-30 disabled:cursor-not-allowed">
                                    Issue loan
                                </button>
                                <button onClick={() => setCopiesModalBook(b)} className="text-slate-500 hover:text-slate-700 font-medium">
                                    Copies
                                </button>
                                <button onClick={() => { setEditingBook(b); setBookModalOpen(true); }} className="text-slate-500 hover:text-slate-700 font-medium">
                                    Edit
                                </button>
                                <button onClick={() => handleDelete(b.id)} className="text-red-500 hover:text-red-600 font-medium">
                                    Delete
                                </button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>

            {bookModalOpen && (
                <BookModal initialData={editingBook} onClose={() => setBookModalOpen(false)} onSaved={() => { setBookModalOpen(false); load(); }} />
            )}
            {copiesModalBook && (
                <CopiesModal book={copiesModalBook} onClose={() => setCopiesModalBook(null)} onChanged={load} />
            )}
            {loanModalBook && (
                <IssueLoanModal book={loanModalBook} onClose={() => setLoanModalBook(null)} onIssued={() => { setLoanModalBook(null); load(); }} />
            )}
        </div>
    );
}