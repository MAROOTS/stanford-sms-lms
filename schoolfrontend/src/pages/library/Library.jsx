import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { Plus, BookOpen, Send, Edit, Layers, Bookmark, Trash2, ArrowUpRight } from "lucide-react";
import axiosClient from "../../api/axiosClient";
import BookModal from "./BookModal";
import CopiesModal from "./CopiesModal";
import IssueLoanModal from "./IssueLoanModal";
import HoldsModal from './HoldsModal';

export default function Library() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [bookModalOpen, setBookModalOpen] = useState(false);
  const [editingBook, setEditingBook] = useState(null);
  const [copiesModalBook, setCopiesModalBook] = useState(null);
  const [loanModalBook, setLoanModalBook] = useState(null);
  const [holdsModalBook, setHoldsModalBook] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await axiosClient.get("/library/books");
      setBooks(data);
    } catch {
      setError("Could not load the library catalog");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    queueMicrotask(() => load());
  }, [load]);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this book?")) return;
    try {
      await axiosClient.delete(`/library/books/${id}`);
      setBooks((prev) => prev.filter((b) => b.id !== id));
    } catch (err) {
      alert(err.response?.data?.message || "Could not delete this book.");
    }
  };

  return (
      <div className="p-6 max-w-7xl mx-auto w-full">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Library</h1>
            <p className="text-sm text-slate-500 mt-1">Manage your book catalog, copies, and active loans.</p>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Link
                to="/library/loans"
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900 text-sm font-medium px-4 py-2 rounded-lg transition-all shadow-sm"
            >
              <Send size={16} />
              View loans
            </Link>
            <button
                onClick={() => {
                  setEditingBook(null);
                  setBookModalOpen(true);
                }}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-all shadow-sm shadow-indigo-200"
            >
              <Plus size={16} />
              Add book
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
            <div className="mb-6 flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-4 py-3 shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
              {error}
            </div>
        )}

        {/* Main Table */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50/50 border-b border-slate-200 text-xs font-semibold tracking-wider text-slate-500 uppercase">
              <tr>
                <th className="px-6 py-4">Title</th>
                <th className="px-6 py-4">Author</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
              {loading && (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center justify-center text-slate-400 gap-2">
                        <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                        <p>Loading catalog...</p>
                      </div>
                    </td>
                  </tr>
              )}

              {!loading && books.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center justify-center text-slate-400 gap-3">
                        <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mb-1">
                          <BookOpen size={24} className="text-slate-300" />
                        </div>
                        <p className="text-slate-500 font-medium text-base">No books yet</p>
                        <p className="text-xs">Add a book to start building your library.</p>
                      </div>
                    </td>
                  </tr>
              )}

              {books.map((b) => (
                  <tr
                      key={b.id}
                      className="hover:bg-slate-50/70 transition-colors group"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-indigo-50/50 border border-indigo-100 flex items-center justify-center shrink-0">
                          <BookOpen size={18} className="text-indigo-500" />
                        </div>
                        <span className="font-semibold text-slate-800">
                        {b.title}
                      </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600 font-medium">
                      {b.author || "—"}
                    </td>
                    <td className="px-6 py-4">
                    <span
                        className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border ${
                            b.availableCopies > 0
                                ? "bg-emerald-50 text-emerald-700 border-emerald-100/50"
                                : "bg-red-50 text-red-700 border-red-100/50"
                        }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${b.availableCopies > 0 ? "bg-emerald-500" : "bg-red-500"}`}></span>
                      {b.availableCopies} / {b.totalCopies} available
                    </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2 opacity-90 group-hover:opacity-100 transition-opacity">
                        <button
                            onClick={() => setLoanModalBook(b)}
                            disabled={b.availableCopies === 0}
                            className="inline-flex items-center gap-1.5 rounded-md bg-indigo-50 px-2.5 py-1.5 text-xs font-semibold text-indigo-700 transition hover:bg-indigo-100 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-indigo-50"
                            title="Issue Loan"
                        >
                          <ArrowUpRight size={14} />
                          Loan
                        </button>

                        <div className="h-4 w-px bg-slate-200 mx-1"></div>

                        <button
                            onClick={() => setCopiesModalBook(b)}
                            className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-900 hover:border-slate-300"
                            title="Manage Copies"
                        >
                          <Layers size={14} />
                          <span className="hidden sm:inline">Copies</span>
                        </button>
                        <button
                            onClick={() => setHoldsModalBook(b)}
                            className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-900 hover:border-slate-300"
                            title="View Holds"
                        >
                          <Bookmark size={14} />
                          <span className="hidden sm:inline">Holds</span>
                        </button>
                        <button
                            onClick={() => {
                              setEditingBook(b);
                              setBookModalOpen(true);
                            }}
                            className="inline-flex items-center justify-center rounded-md border border-slate-200 bg-white w-7 h-7 text-slate-500 transition hover:bg-slate-50 hover:text-indigo-600 hover:border-indigo-200"
                            title="Edit Book"
                        >
                          <Edit size={14} />
                        </button>
                        <button
                            onClick={() => handleDelete(b.id)}
                            className="inline-flex items-center justify-center rounded-md border border-slate-200 bg-white w-7 h-7 text-slate-500 transition hover:bg-red-50 hover:text-red-600 hover:border-red-200"
                            title="Delete Book"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
              ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modals */}
        {bookModalOpen && (
            <BookModal
                initialData={editingBook}
                onClose={() => setBookModalOpen(false)}
                onSaved={() => {
                  setBookModalOpen(false);
                  load();
                }}
            />
        )}
        {copiesModalBook && (
            <CopiesModal
                book={copiesModalBook}
                onClose={() => setCopiesModalBook(null)}
                onChanged={load}
            />
        )}
        {loanModalBook && (
            <IssueLoanModal
                book={loanModalBook}
                onClose={() => setLoanModalBook(null)}
                onIssued={() => {
                  setLoanModalBook(null);
                  load();
                }}
            />
        )}
        {holdsModalBook && (
            <HoldsModal
                book={holdsModalBook}
                onClose={() => setHoldsModalBook(null)}
                onChanged={load}
            />
        )}
      </div>
  );
}