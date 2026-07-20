import { useEffect, useState, useCallback } from 'react';
import { Plus, X, Megaphone, Trash2 } from 'lucide-react';
import axiosClient from '../../api/axiosClient';

const AUDIENCE_STYLES = {
    ALL: 'bg-slate-100 text-slate-600',
    TEACHERS: 'bg-blue-50 text-blue-600',
    STUDENTS: 'bg-teal-accent/15 text-teal-700',
};

function AnnouncementModal({ onClose, onSaved }) {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [audience, setAudience] = useState('ALL');
    const [error, setError] = useState('');
    const [saving, setSaving] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(''); setSaving(true);
        try {
            await axiosClient.post('/announcements', { title, content, audience });
            onSaved();
        } catch (err) {
            setError(err.response?.data?.message || 'Something went wrong');
        } finally { setSaving(false); }
    };

    return (
        <div className="fixed inset-0 bg-slate-900/40 flex items-center justify-center z-50 px-4">
            <div className="bg-white rounded-xl w-full max-w-md p-6 shadow-xl">
                <div className="flex items-center justify-between mb-5">
                    <h2 className="text-lg font-bold text-slate-900">New announcement</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Title</label>
                        <input required value={title} onChange={(e) => setTitle(e.target.value)}
                               className="w-full px-3 py-2.5 rounded-lg bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-accent" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Message</label>
                        <textarea required rows={4} value={content} onChange={(e) => setContent(e.target.value)}
                                  className="w-full px-3 py-2.5 rounded-lg bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-accent resize-none" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Audience</label>
                        <div className="grid grid-cols-3 gap-2">
                            {['ALL', 'TEACHERS', 'STUDENTS'].map((a) => (
                                <button key={a} type="button" onClick={() => setAudience(a)}
                                        className={`text-xs font-medium py-2 rounded-lg border transition-colors ${
                                            audience === a ? 'bg-navy-900 text-white border-navy-900' : 'text-slate-600 border-slate-200 hover:border-slate-300'
                                        }`}>
                                    {a === 'ALL' ? 'Everyone' : a.charAt(0) + a.slice(1).toLowerCase()}
                                </button>
                            ))}
                        </div>
                    </div>
                    {error && <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</p>}
                    <div className="flex gap-3 pt-2">
                        <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50">Cancel</button>
                        <button type="submit" disabled={saving} className="flex-1 py-2.5 rounded-lg bg-navy-900 hover:bg-navy-800 text-white text-sm font-medium disabled:opacity-60">
                            {saving ? 'Posting...' : 'Post announcement'}
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
        setLoading(true); setError('');
        try {
            const { data } = await axiosClient.get('/announcements/school-wide');
            setAnnouncements(data);
        } catch { setError('Could not load announcements'); }
        finally { setLoading(false); }
    }, []);

    useEffect(() => { load(); }, [load]);

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this announcement?')) return;
        try {
            await axiosClient.delete(`/announcements/${id}`);
            setAnnouncements((prev) => prev.filter((a) => a.id !== id));
        } catch (err) {
            alert(err.response?.data?.message || 'Could not delete this announcement.');
        }
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Announcements</h1>
                    <p className="text-sm text-slate-500 mt-1">School-wide messages to teachers and students.</p>
                </div>
                <button onClick={() => setModalOpen(true)}
                        className="flex items-center gap-1.5 bg-navy-900 hover:bg-navy-800 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors">
                    <Plus size={16} /> New announcement
                </button>
            </div>

            {error && <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2 mb-4">{error}</p>}
            {loading && <p className="text-sm text-slate-400">Loading...</p>}
            {!loading && announcements.length === 0 && <p className="text-sm text-slate-400">No announcements posted yet.</p>}

            <div className="space-y-3">
                {announcements.map((a) => (
                    <div key={a.id} className="bg-white rounded-xl border border-slate-200 p-5">
                        <div className="flex items-start justify-between gap-4">
                            <div className="flex items-start gap-3">
                                <div className="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center shrink-0">
                                    <Megaphone size={16} className="text-amber-600" />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <p className="font-medium text-slate-800">{a.title}</p>
                                        <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${AUDIENCE_STYLES[a.audience]}`}>
                      {a.audience === 'ALL' ? 'Everyone' : a.audience}
                    </span>
                                    </div>
                                    <p className="text-sm text-slate-600">{a.content}</p>
                                    <p className="text-xs text-slate-400 mt-2">{a.teacherName} · {new Date(a.postedAt).toLocaleString()}</p>
                                </div>
                            </div>
                            <button onClick={() => handleDelete(a.id)} className="text-slate-400 hover:text-red-500 shrink-0">
                                <Trash2 size={16} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {modalOpen && <AnnouncementModal onClose={() => setModalOpen(false)} onSaved={() => { setModalOpen(false); load(); }} />}
        </div>
    );
}