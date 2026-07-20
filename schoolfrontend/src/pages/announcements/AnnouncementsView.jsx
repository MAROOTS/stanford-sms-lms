import { useEffect, useState } from 'react';
import { Megaphone } from 'lucide-react';
import axiosClient from '../../api/axiosClient';

export default function AnnouncementsView() {
    const [announcements, setAnnouncements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        axiosClient.get('/announcements/school-wide/for-me')
            .then((res) => setAnnouncements(res.data))
            .catch(() => setError('Could not load announcements'))
            .finally(() => setLoading(false));
    }, []);

    return (
        <div>
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-slate-900">Announcements</h1>
                <p className="text-sm text-slate-500 mt-1">Messages from the school administration.</p>
            </div>

            {error && <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2 mb-4">{error}</p>}
            {loading && <p className="text-sm text-slate-400">Loading...</p>}
            {!loading && announcements.length === 0 && <p className="text-sm text-slate-400">No announcements yet.</p>}

            <div className="space-y-3">
                {announcements.map((a) => (
                    <div key={a.id} className="bg-white rounded-xl border border-slate-200 p-5">
                        <div className="flex items-start gap-3">
                            <div className="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center shrink-0">
                                <Megaphone size={16} className="text-amber-600" />
                            </div>
                            <div>
                                <p className="font-medium text-slate-800">{a.title}</p>
                                <p className="text-sm text-slate-600 mt-1">{a.content}</p>
                                <p className="text-xs text-slate-400 mt-2">{a.teacherName} · {new Date(a.postedAt).toLocaleString()}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}