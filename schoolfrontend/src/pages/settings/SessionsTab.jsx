import { useEffect, useState, useCallback } from 'react';
import { Monitor, ShieldOff } from 'lucide-react';
import axiosClient from '../../api/axiosClient';
import { useToast } from '../../context/useToast';

function getCurrentToken() {
    return localStorage.getItem('refreshToken') || sessionStorage.getItem('refreshToken');
}

export default function SessionsTab() {
    const toast = useToast();
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const { data } = await axiosClient.get('/auth/sessions', { params: { currentToken: getCurrentToken() } });
            setSessions(data);
        } catch { toast.error('Could not load sessions'); }
        finally { setLoading(false); }
    }, [toast]);

    useEffect(() => { load(); }, [load]);

    const handleRevoke = async (id) => {
        try {
            await axiosClient.delete(`/auth/sessions/${id}`);
            load();
            toast.success('Session revoked.');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Could not revoke session');
        }
    };

    if (loading) return <p className="text-sm text-slate-400">Loading sessions...</p>;

    return (
        <div className="space-y-3 max-w-lg">
            {sessions.map((s) => (
                <div key={s.id} className="flex items-center justify-between bg-white border border-slate-200 rounded-lg px-4 py-3">
                    <div className="flex items-center gap-3">
                        <Monitor size={18} className="text-slate-400" />
                        <div>
                            <p className="text-sm font-medium text-slate-800">
                                {s.device} {s.current && <span className="ml-1.5 text-xs font-medium text-teal-700 bg-teal-accent/15 px-2 py-0.5 rounded-full">This device</span>}
                            </p>
                            <p className="text-xs text-slate-400">{s.ipAddress || 'Unknown IP'} · expires {new Date(s.expiresAt).toLocaleDateString()}</p>
                        </div>
                    </div>
                    {!s.current && (
                        <button onClick={() => handleRevoke(s.id)} className="flex items-center gap-1 text-red-500 hover:text-red-600 text-sm font-medium">
                            <ShieldOff size={14} /> Revoke
                        </button>
                    )}
                </div>
            ))}
            {sessions.length === 0 && <p className="text-sm text-slate-400">No active sessions found.</p>}
        </div>
    );
}