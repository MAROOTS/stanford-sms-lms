import { AlertTriangle, X } from 'lucide-react';
import { useEffect } from 'react';

export default function ConfirmDialog({ open, title, message, confirmLabel, onConfirm, onCancel, variant = 'danger' }) {
    useEffect(() => {
        if (!open) return;
        const handler = (e) => { if (e.key === 'Escape') onCancel(); };
        document.addEventListener('keydown', handler);
        return () => document.removeEventListener('keydown', handler);
    }, [open, onCancel]);

    if (!open) return null;

    const confirmStyle = variant === 'danger'
        ? 'bg-red-600 hover:bg-red-700 shadow-sm shadow-red-500/20'
        : 'bg-primary-800 hover:bg-primary-700 shadow-sm shadow-primary-800/20';

    return (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-[9998] px-4" onClick={onCancel}>
            <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-elevated animate-fade-in" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-xl bg-red-50 flex items-center justify-center">
                            <AlertTriangle size={22} className="text-red-500" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900">{title || 'Confirm'}</h3>
                    </div>
                    <button onClick={onCancel} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-surface-50 transition-colors">
                        <X size={18} />
                    </button>
                </div>

                <p className="text-sm text-slate-600 mb-6 leading-relaxed">{message}</p>

                <div className="flex gap-3">
                    <button
                        onClick={onCancel}
                        className="flex-1 py-2.5 rounded-xl border border-surface-200 text-sm font-medium text-slate-600 hover:bg-surface-50 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        className={`flex-1 py-2.5 rounded-xl text-white text-sm font-semibold transition-colors ${confirmStyle}`}
                    >
                        {confirmLabel || 'Delete'}
                    </button>
                </div>
            </div>
        </div>
    );
}
