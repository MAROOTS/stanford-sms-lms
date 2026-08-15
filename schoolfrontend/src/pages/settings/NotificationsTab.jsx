import { useEffect, useState } from 'react';
import axiosClient from '../../api/axiosClient';
import { useToast } from '../../context/useToast';

export default function NotificationsTab() {
    const toast = useToast();
    const [prefs, setPrefs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        axiosClient.get('/notification-preferences').then((res) => setPrefs(res.data)).finally(() => setLoading(false));
    }, []);

    const toggle = (type) => {
        setPrefs((prev) => prev.map((p) => (p.type === type ? { ...p, enabled: !p.enabled } : p)));
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await axiosClient.put('/notification-preferences', {
                preferences: prefs.map((p) => ({ type: p.type, enabled: p.enabled })),
            });
            toast.success('Preferences saved.');
        } catch {
            toast.error('Could not save preferences');
        } finally { setSaving(false); }
    };

    if (loading) return <p className="text-sm text-slate-400">Loading preferences...</p>;

    return (
        <div className="max-w-lg space-y-2">
            {prefs.map((p) => (
                <label key={p.type} className="flex items-center justify-between bg-white border border-slate-200 rounded-lg px-4 py-3 cursor-pointer">
                    <span className="text-sm text-slate-700">{p.label}</span>
                    <input type="checkbox" checked={p.enabled} onChange={() => toggle(p.type)}
                           className="rounded border-slate-300 text-teal-600 focus:ring-teal-accent w-4 h-4" />
                </label>
            ))}
            <button onClick={handleSave} disabled={saving}
                    className="mt-2 bg-navy-900 hover:bg-navy-800 text-white text-sm font-medium px-4 py-2.5 rounded-lg disabled:opacity-60">
                {saving ? 'Saving...' : 'Save preferences'}
            </button>
        </div>
    );
}