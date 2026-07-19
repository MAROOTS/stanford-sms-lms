import { useEffect, useState, useCallback } from 'react';
import { Plus, Megaphone, Eye, Trash2, X } from 'lucide-react';
import axiosClient from '../../api/axiosClient';
import ConfirmDialog from '../../components/shared/ConfirmDialog';
import EmptyState from '../../components/shared/EmptyState';
import { TableSkeleton } from '../../components/shared/LoadingSkeleton';
import { useToast } from '../../context/ToastContext';

function AnnouncementModal({ initialData, courses, onClose, onSaved, readOnly }) {
    const isView = readOnly && Boolean(initialData);
    const [title, setTitle] = useState(initialData?.title || '');
    const [content, setContent] = useState(initialData?.content || '');
    const [courseId, setCourseId] = useState(initialData?.courseId?.toString() || initialData?.course?.id?.toString() || '');
    const [schoolWide, setSchoolWide] = useState(!initialData?.courseId && !initialData?.course?.id);
    const [error, setError] = useState('');
    const [saving, setSaving] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!title.trim()) { setError('Title is required'); return; }
        if (!content.trim()) { setError('Content is required'); return; }
        setError(''); setSaving(true);
        try {
            const payload = {
                title: title.trim(),
                content: content.trim(),
                courseId: schoolWide ? null : (courseId ? Number(courseId) : null),
            };
            await axiosClient.post('/announcements', payload);
            onSaved();
        } catch (err) {
            setError(err.response?.data?.message || 'Something went wrong');
        } finally { setSaving(false); }
    };

    return (
        <div className="fixed inset-0 bg-slate-900/40 flex items-center justify-center z-50 px-4" onClick={onClose}>
            <div className="bg-white rounded-2xl w-full max-w-lg shadow-elevated animate-fade-in" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between px-5 py-4 border-b border-surface-100">
                    <h2 className="text-lg font-bold text-slate-900">{isView ? 'View announcement' : 'New announcement'}</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-surface-50"><X size={20} /></button>
                </div>
                <form onSubmit={handleSubmit} className="p-5 space-y-4">
                    <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1">Title *</label>
                        <input value={title} onChange={(e) => setTitle(e.target.value)} disabled={isView}
                            className="w-full px-3 py-2.5 rounded-lg bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-accent disabled:opacity-60" />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1">Content *</label>
                        <textarea value={content} onChange={(e) => setContent(e.target.value)} disabled={isView} rows={4}
                            className="w-full px-3 py-2.5 rounded-lg bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-accent disabled:opacity-60" />
                    </div>
                    <div className="flex items-center gap-2">
                        <input type="checkbox" checked={schoolWide} onChange={(e) => setSchoolWide(e.target.checked)} disabled={isView}
                            className="rounded border-slate-300 text-teal-600 focus:ring-teal-accent" />
                        <span className="text-sm text-slate-600">School-wide announcement</span>
                    </div>
                    {!schoolWide && (
                        <div>
                            <label className="block text-xs font-medium text-slate-500 mb-1">Course</label>
                            <select value={courseId} onChange={(e) => setCourseId(e.target.value)} disabled={isView}
                                className="w-full px-3 py-2.5 rounded-lg bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-accent disabled:opacity-60">
                                <option value="">Select course...</option>
                                {courses.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
                            </select>
                        </div>
                    )}
                    {error && <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</p>}
                    <div className="flex gap-3 pt-2">
                        <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50">{isView ? 'Close' : 'Cancel'}</button>
                        {!isView && <button type="submit" disabled={saving} className="flex-1 py-2.5 rounded-lg bg-navy-900 hover:bg-navy-800 text-white text-sm font-medium disabled:opacity-60">{saving ? 'Posting...' : 'Post announcement'}</button>}
                    </div>
                </form>
            </div>
        </div>
    );
}

export default function Announcements() {
    const [announcements, setAnnouncements] = useState([]);
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [modalOpen, setModalOpen] = useState(false);
    const [viewing, setViewing] = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const toast = useToast();

    const load = useCallback(async () => {
        setLoading(true); setError('');
        try {
            const [aRes, cRes] = await Promise.all([
                axiosClient.get('/announcements/school-wide'),
                axiosClient.get('/courses'),
            ]);
            setAnnouncements(Array.isArray(aRes.data) ? aRes.data : []);
            setCourses(Array.isArray(cRes.data) ? cRes.data : []);
        } catch { setError('Could not load announcements'); }
        finally { setLoading(false); }
    }, []);

    useEffect(() => { load(); }, [load]);

    const handleDelete = async () => {
        if (!deleteTarget) return;
        const id = deleteTarget.id;
        const name = deleteTarget.title;
        setDeleteTarget(null);
        try {
            await axiosClient.delete(`/announcements/${id}`);
            setAnnouncements((prev) => prev.filter((a) => a.id !== id));
            toast.success(`"${name}" deleted`);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Could not delete');
        }
    };

    return (
        <div className="animate-fade-in-up">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-[26px] font-bold text-slate-900 tracking-tight">Announcements</h1>
                    <p className="text-sm text-slate-500 mt-1">School-wide and course announcements.</p>
                </div>
                <button onClick={() => { setViewing(null); setModalOpen(true); }}
                    className="flex items-center gap-1.5 bg-navy-900 hover:bg-navy-800 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors">
                    <Plus size={16} /> New announcement
                </button>
            </div>

            {loading && <TableSkeleton columns={4} rows={5} />}
            {error && !loading && <div className="bg-red-50 border border-red-100 rounded-xl p-6 text-center"><p className="text-red-600 text-sm mb-3">{error}</p><button onClick={load} className="text-sm font-medium text-red-700 underline">Try again</button></div>}
            {!loading && !error && announcements.length === 0 && (
                <EmptyState icon={Megaphone} title="No announcements yet" description="Post your first school or course announcement." action={<button onClick={() => { setViewing(null); setModalOpen(true); }} className="flex items-center gap-1.5 bg-navy-900 hover:bg-navy-800 text-white text-sm font-medium px-4 py-2.5 rounded-lg"><Plus size={16} /> New announcement</button>} />
            )}

            {!loading && !error && announcements.length > 0 && (
                <div className="bg-white rounded-2xl border border-surface-200 shadow-card overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead><tr className="border-b border-surface-100 text-left text-[11px] font-semibold tracking-wider text-slate-400"><th className="px-5 py-3">TITLE</th><th className="px-5 py-3">COURSE</th><th className="px-5 py-3">POSTED</th><th className="px-5 py-3 text-right">ACTIONS</th></tr></thead>
                            <tbody>
                                {announcements.map((a) => (
                                    <tr key={a.id} className="border-b border-surface-50 last:border-0 hover:bg-surface-50/50 transition-colors">
                                        <td className="px-5 py-3.5 font-medium text-slate-800">{a.title}</td>
                                        <td className="px-5 py-3.5 text-slate-600">{a.courseName || a.course?.title || 'School-wide'}</td>
                                        <td className="px-5 py-3.5 text-slate-500 text-xs">{a.postedAt ? new Date(a.postedAt).toLocaleDateString() : '—'}</td>
                                        <td className="px-5 py-3.5 text-right whitespace-nowrap">
                                            <div className="flex items-center justify-end gap-1">
                                                <button onClick={() => { setViewing(a); setModalOpen(true); }} title="View" className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-surface-100"><Eye size={16} /></button>
                                                <button onClick={() => setDeleteTarget(a)} title="Delete" className="p-2 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50"><Trash2 size={16} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {modalOpen && <AnnouncementModal initialData={viewing} courses={courses} readOnly={!!viewing} onClose={() => setModalOpen(false)} onSaved={() => { setModalOpen(false); load(); toast.success('Announcement posted'); }} />}
            <ConfirmDialog open={!!deleteTarget} title="Delete announcement" message={`Delete "${deleteTarget?.title}"?`} confirmLabel="Delete" variant="danger" onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} />
        </div>
    );
}
