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
        ? 'bg-red-600 hover:bg-red-700'
        : 'bg-navy-900 hover:bg-navy-800';

    return (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-[9998] px-4" onClick={onCancel}>
            <div className="bg-white rounded-xl w-full max-w-sm p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center">
                            <AlertTriangle size={20} className="text-red-600" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900">{title || 'Confirm'}</h3>
                    </div>
                    <button onClick={onCancel} className="text-slate-400 hover:text-slate-600">
                        <X size={18} />
                    </button>
                </div>

                <p className="text-sm text-slate-600 mb-6">{message}</p>

                <div className="flex gap-3">
                    <button
                        onClick={onCancel}
                        className="flex-1 py-2.5 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        className={`flex-1 py-2.5 rounded-lg text-white text-sm font-medium ${confirmStyle}`}
                    >
                        {confirmLabel || 'Delete'}
                    </button>
                </div>
            </div>
        </div>
    );
}
