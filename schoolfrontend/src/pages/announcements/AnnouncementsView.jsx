import { useEffect, useState } from 'react';
import { Megaphone, Loader2, Calendar, User, BellOff } from 'lucide-react';
import axiosClient from '../../api/axiosClient';
import EmptyState from '../../components/shared/EmptyState';

export default function AnnouncementsView() {
    const [announcements, setAnnouncements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        axiosClient
            .get('/announcements/school-wide/for-me')
            .then((res) => setAnnouncements(res.data || []))
            .catch(() => setError('Could not load announcements. Please try again later.'))
            .finally(() => setLoading(false));
    }, []);

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
            <div className="mb-8">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-700 text-xs font-semibold mb-2">
                    School Bulletin
                </div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">Announcements</h1>
                <p className="text-sm text-slate-500 mt-1.5">
                    Official news, notices, and updates from the school administration.
                </p>
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
                    <Loader2 size={24} className="animate-spin text-amber-600 mr-2.5" />
                    <span className="text-sm font-medium text-slate-500">Loading announcements...</span>
                </div>
            )}

            {/* ANNOUNCEMENTS LIST */}
            {!loading && announcements.length > 0 && (
                <div className="space-y-4 max-w-4xl">
                    {announcements.map((a) => (
                        <div
                            key={a.id}
                            className="bg-white rounded-2xl border border-slate-200 shadow-2xs hover:shadow-md hover:border-slate-300 transition-all p-6 group"
                        >
                            <div className="flex items-start gap-4">
                                <div className="w-11 h-11 rounded-xl bg-amber-50 border border-amber-200/60 flex items-center justify-center shrink-0 text-amber-600 group-hover:bg-amber-100/70 transition-colors">
                                    <Megaphone size={20} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h2 className="text-base font-bold text-slate-900 group-hover:text-amber-900 transition-colors leading-snug">
                                        {a.title}
                                    </h2>
                                    <p className="text-sm text-slate-600 leading-relaxed mt-2 whitespace-pre-line">
                                        {a.content}
                                    </p>

                                    <div className="flex flex-wrap items-center gap-4 mt-4 pt-4 border-t border-slate-100 text-xs text-slate-500">
                                        {a.teacherName && (
                                            <span className="flex items-center gap-1.5 font-medium text-slate-700">
                                                <User size={14} className="text-slate-400" />
                                                {a.teacherName}
                                            </span>
                                        )}
                                        <span className="flex items-center gap-1.5 text-slate-400">
                                            <Calendar size={14} />
                                            {formatDate(a.postedAt)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* EMPTY STATE */}
            {!loading && announcements.length === 0 && !error && (
                <EmptyState
                    icon={BellOff}
                    title="No announcements found"
                    description="There are no school-wide announcements posted at this time."
                />
            )}
        </div>
    );
}