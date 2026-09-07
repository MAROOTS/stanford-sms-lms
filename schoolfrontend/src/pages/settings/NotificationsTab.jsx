import { useEffect, useState } from 'react';
import { Save, Bell, Loader2, CheckCircle2 } from 'lucide-react';
import axiosClient from '../../api/axiosClient';
import { useToast } from '../../context/useToast';

export default function NotificationsTab() {
    const toast = useToast();
    const [prefs, setPrefs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        axiosClient
            .get('/notification-preferences')
            .then((res) => setPrefs(res.data || []))
            .catch(() => toast.error('Failed to load notification settings'))
            .finally(() => setLoading(false));
    }, []);

    const toggle = (type) => {
        setPrefs((prev) =>
            prev.map((p) => (p.type === type ? { ...p, enabled: !p.enabled } : p))
        );
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await axiosClient.put('/notification-preferences', {
                preferences: prefs.map((p) => ({ type: p.type, enabled: p.enabled })),
            });
            toast.success('Preferences saved successfully.');
        } catch {
            toast.error('Could not save preferences');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-16 bg-white rounded-2xl border border-slate-200 shadow-sm max-w-2xl">
                <Loader2 size={24} className="animate-spin text-navy-900 mr-2.5" />
                <span className="text-sm font-medium text-slate-500">Loading notification preferences...</span>
            </div>
        );
    }

    return (
        <div className="max-w-2xl bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
            {/* TAB SECTION HEADER */}
            <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 shrink-0">
                    <Bell size={20} />
                </div>
                <div>
                    <h2 className="text-base font-bold text-slate-900">Notification Preferences</h2>
                    <p className="text-xs text-slate-500">
                        Choose which notifications and alerts you wish to receive.
                    </p>
                </div>
            </div>

            {/* PREFERENCES TOGGLE LIST */}
            {prefs.length === 0 ? (
                <p className="text-sm text-slate-500 py-4 text-center">No notification settings available.</p>
            ) : (
                <div className="space-y-3">
                    {prefs.map((p) => (
                        <div
                            key={p.type}
                            onClick={() => toggle(p.type)}
                            className="flex items-center justify-between p-4 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-all cursor-pointer group select-none"
                        >
                            <div className="pr-4">
                                <span className="text-sm font-semibold text-slate-800 group-hover:text-slate-900 transition-colors block">
                                    {p.label}
                                </span>
                                {p.description && (
                                    <span className="text-xs text-slate-500 mt-0.5 block leading-relaxed">
                                        {p.description}
                                    </span>
                                )}
                            </div>

                            {/* CUSTOM TOGGLE SWITCH */}
                            <button
                                type="button"
                                role="switch"
                                aria-checked={p.enabled}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    toggle(p.type);
                                }}
                                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-navy-900/20 ${
                                    p.enabled ? 'bg-navy-900' : 'bg-slate-200'
                                }`}
                            >
                                <span
                                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                                        p.enabled ? 'translate-x-5' : 'translate-x-0'
                                    }`}
                                />
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* ACTION FOOTER */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-400 flex items-center gap-1">
                    <CheckCircle2 size={14} className="text-slate-400" /> Changes apply instantly upon saving
                </span>

                <button
                    type="button"
                    onClick={handleSave}
                    disabled={saving || prefs.length === 0}
                    className="flex items-center gap-2 bg-navy-900 hover:bg-navy-800 text-white text-sm font-semibold px-6 py-2.5 rounded-xl transition-all shadow-sm disabled:opacity-50 active:scale-[0.98] cursor-pointer"
                >
                    {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                    {saving ? 'Saving...' : 'Save Preferences'}
                </button>
            </div>
        </div>
    );
}