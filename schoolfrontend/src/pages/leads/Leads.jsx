import { useEffect, useState, useCallback } from 'react';
import { Inbox } from 'lucide-react';
import axiosClient from '../../api/axiosClient';

const STATUS_STYLES = {
    NEW: 'bg-blue-50 text-blue-600',
    CONTACTED: 'bg-amber-50 text-amber-700',
    CONVERTED: 'bg-teal-accent/15 text-teal-700',
    CLOSED: 'bg-slate-100 text-slate-600',
};

export default function Leads() {
    const [inquiries, setInquiries] = useState([]);
    const [statusFilter, setStatusFilter] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const load = useCallback(async () => {
        setLoading(true); setError('');
        try {
            const { data } = await axiosClient.get('/contact-inquiries', {
                params: statusFilter ? { status: statusFilter } : {},
            });
            setInquiries(data);
        } catch { setError('Could not load inquiries'); }
        finally { setLoading(false); }
    }, [statusFilter]);

    useEffect(() => { load(); }, [load]);

    const handleStatusChange = async (id, status) => {
        try {
            await axiosClient.patch(`/contact-inquiries/${id}/status`, { status });
            await load();
        } catch (err) {
            alert(err.response?.data?.message || 'Could not update status');
        }
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Leads</h1>
                    <p className="text-sm text-slate-500 mt-1">Inquiries submitted through the public contact form.</p>
                </div>
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm font-medium text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-teal-accent">
                    <option value="">All statuses</option>
                    {Object.keys(STATUS_STYLES).map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
            </div>

            {error && <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2 mb-4">{error}</p>}
            {loading && <p className="text-sm text-slate-400">Loading inquiries...</p>}
            {!loading && inquiries.length === 0 && (
                <div className="bg-white rounded-xl border border-slate-200 p-10 text-center">
                    <Inbox size={40} className="mx-auto text-slate-300 mb-4" />
                    <p className="text-slate-600 font-medium">No inquiries yet</p>
                </div>
            )}

            {!loading && inquiries.length > 0 && (
                <div className="space-y-3">
                    {inquiries.map((i) => (
                        <div key={i.id} className="bg-white rounded-xl border border-slate-200 p-5">
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <p className="font-medium text-slate-800">{i.schoolName}</p>
                                    <p className="text-sm text-slate-600">{i.contactName} · {i.email}{i.phone ? ` · ${i.phone}` : ''}</p>
                                    {i.studentCountEstimate && <p className="text-xs text-slate-400 mt-0.5">~{i.studentCountEstimate} students</p>}
                                    <p className="text-sm text-slate-600 mt-2">{i.message}</p>
                                    <p className="text-xs text-slate-400 mt-2">{new Date(i.submittedAt).toLocaleString()}</p>
                                </div>
                                <select value={i.status} onChange={(e) => handleStatusChange(i.id, e.target.value)}
                                        className={`text-xs font-medium px-2.5 py-1.5 rounded-full border-0 focus:outline-none focus:ring-2 focus:ring-teal-accent ${STATUS_STYLES[i.status]}`}>
                                    {Object.keys(STATUS_STYLES).map((s) => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}