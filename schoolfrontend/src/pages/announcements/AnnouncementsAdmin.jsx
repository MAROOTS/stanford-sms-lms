import { useEffect, useState, useCallback } from 'react';
import { Plus, X, Megaphone, Trash2, Loader2, Sparkles, BellOff, Users } from 'lucide-react';
import axiosClient from '../../api/axiosClient';
import EmptyState from '../../components/shared/EmptyState';

const AUDIENCE_STYLES = {
    ALL: 'bg-slate-100 text-slate-700 border-slate-200',
    TEACHERS: 'bg-blue-50 text-blue-700 border-blue-200',
    STUDENTS: 'bg-teal-50 text-teal-700 border-teal-200',
    PARENTS: 'bg-purple-50 text-purple-700 border-purple-200',
};

const AUDIENCE_LABELS = {
    ALL: 'Everyone',
    TEACHERS: 'Teachers',
    STUDENTS: 'Students',
    PARENTS: 'Parents',
};

function AnnouncementModal({ onClose, onSaved }) {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [audience, setAudience] = useState('ALL');
    const [error, setError] = useState('');
    const [saving, setSaving] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSaving(true);
        try {
            await axiosClient.post('/announcements', { title, content, audience });
            onSaved();
        } catch (err) {
            setError(err.response?.data?.message || 'Something went wrong posting the announcement.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl border border-slate-100 animate-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
                    <div>
                        <h2 className="text-lg font-bold text-slate-900">New Announcement</h2>
                        <p className="text-xs text-slate-500 mt-0.5">Publish a school-wide broadcast</p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                    >
                        <X size={18} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold tracking-wider text-slate-400 uppercase mb-1.5">
                            Title
                        </label>
                        <input
                            required
                            type="text"
                            placeholder="e.g. End of Term Sports Day"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-navy-900/20"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold tracking-wider text-slate-400 uppercase mb-1.5">
                            Message
                        </label>
                        <textarea
                            required
                            rows={4}
                            placeholder="Write your announcement message here..."
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-navy-900/20 resize-none"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold tracking-wider text-slate-400 uppercase mb-2">
                            Audience Target
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                            {['ALL', 'TEACHERS', 'STUDENTS', 'PARENTS'].map((a) => (
                                <button
                                    key={a}
                                    type="button"
                                    onClick={() => setAudience(a)}
                                    className={`text-xs font-semibold py-2 px-1 rounded-xl border transition-all active:scale-[0.97] cursor-pointer ${
                                        audience === a
                                            ? 'bg-navy-900 text-white border-navy-900 shadow-2xs'
                                            : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                                    }`}
                                >
                                    {AUDIENCE_LABELS[a]}
                                </button>
                            ))}
                        </div>
                    </div>

                    {error && (
                        <div className="text-xs font-medium text-rose-700 bg-rose-50 border border-rose-200 rounded-xl p-3">
                            {error}
                        </div>
                    )}

                    <div className="flex gap-3 pt-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={saving}
                            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-navy-900 hover:bg-navy-800 text-white text-sm font-semibold transition-all shadow-sm disabled:opacity-50 active:scale-[0.98] cursor-pointer"
                        >
                            {saving ? <Loader2 size={16} className="animate-spin" /> : <Megaphone size={16} />}
                            {saving ? 'Posting...' : 'Post Announcement'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default function AnnouncementsAdmin() {
    const [announcements, setAnnouncements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [modalOpen, setModalOpen] = useState(false);

    const load = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const { data } = await axiosClient.get('/announcements/school-wide');
            setAnnouncements(data || []);
        } catch {
            setError('Could not load announcements. Please check your connection.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        load();
    }, [load]);

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this announcement?')) return;
        try {
            await axiosClient.delete(`/announcements/${id}`);
            setAnnouncements((prev) => prev.filter((a) => a.id !== id));
        } catch (err) {
            alert(err.response?.data?.message || 'Could not delete this announcement.');
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString(undefined, {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 animate-in fade-in duration-500">
            {/* HEADER */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-700 text-xs font-semibold mb-2">

                        Admin Dashboard
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">Announcements</h1>
                    <p className="text-sm text-slate-500 mt-1.5">
                        Manage and broadcast school-wide messages to staff, students, and parents.
                    </p>
                </div>
                <button
                    type="button"
                    onClick={() => setModalOpen(true)}
                    className="flex items-center justify-center gap-2 bg-navy-900 hover:bg-navy-800 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-all shadow-sm active:scale-[0.98] cursor-pointer self-start sm:self-auto"
                >
                    <Plus size={18} /> New Announcement
                </button>
            </div>

            {/* ERROR ALERT */}
            {error && (
                <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 text-sm font-medium text-rose-700 mb-6 shadow-2xs">
                    {error}
                </div>
            )}

            {/* LOADING STATE */}
            {loading && (
                <div className="flex items-center justify-center py-20 bg-white rounded-2xl border border-slate-200 shadow-2xs">
                    <Loader2 size={24} className="animate-spin text-navy-900 mr-2.5" />
                    <span className="text-sm font-medium text-slate-500">Loading announcements...</span>
                </div>
            )}

            {/* ANNOUNCEMENT LIST */}
            {!loading && announcements.length > 0 && (
                <div className="space-y-4 max-w-4xl">
                    {announcements.map((a) => (
                        <div
                            key={a.id}
                            className="bg-white rounded-2xl border border-slate-200 shadow-2xs hover:shadow-md hover:border-slate-300 transition-all p-6 group"
                        >
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex items-start gap-4 flex-1 min-w-0">
                                    <div className="w-11 h-11 rounded-xl bg-amber-50 border border-amber-200/60 flex items-center justify-center shrink-0 text-amber-600 group-hover:bg-amber-100/70 transition-colors">
                                        <Megaphone size={20} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex flex-wrap items-center gap-2 mb-1.5">
                                            <h2 className="text-base font-bold text-slate-900 leading-snug">
                                                {a.title}
                                            </h2>
                                            <span
                                                className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                                                    AUDIENCE_STYLES[a.audience] || AUDIENCE_STYLES.ALL
                                                }`}
                                            >
                                                {AUDIENCE_LABELS[a.audience] || a.audience}
                                            </span>
                                        </div>
                                        <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                                            {a.content}
                                        </p>
                                        <div className="flex items-center gap-2 text-xs font-medium text-slate-400 mt-3 pt-3 border-t border-slate-100">
                                            <span>{a.teacherName || 'Administrator'}</span>
                                            <span>•</span>
                                            <span>{formatDate(a.postedAt)}</span>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => handleDelete(a.id)}
                                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors shrink-0 cursor-pointer"
                                    title="Delete announcement"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* EMPTY STATE */}
            {!loading && announcements.length === 0 && !error && (
                <EmptyState
                    icon={BellOff}
                    title="No announcements posted"
                    description="You have not created any school-wide announcements yet."
                />
            )}

            {/* MODAL */}
            {modalOpen && (
                <AnnouncementModal
                    onClose={() => setModalOpen(false)}
                    onSaved={() => {
                        setModalOpen(false);
                        load();
                    }}
                />
            )}
        </div>
    );
}