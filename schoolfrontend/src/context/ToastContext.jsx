import { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

const ICONS = {
    success: CheckCircle,
    error: XCircle,
    warning: AlertTriangle,
    info: Info,
};

const STYLES = {
    success: 'border-emerald-200 bg-emerald-50 text-emerald-800',
    error: 'border-red-200 bg-red-50 text-red-800',
    warning: 'border-amber-200 bg-amber-50 text-amber-800',
    info: 'border-sky-200 bg-sky-50 text-sky-800',
};

let toastId = 0;

export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([]);

    const addToast = useCallback((message, type = 'info', duration = 5000, undoAction = null) => {
        const id = ++toastId;
        setToasts((prev) => [...prev, { id, message, type, undoAction }]);
        if (duration > 0 && !undoAction) {
            setTimeout(() => {
                setToasts((prev) => prev.filter((t) => t.id !== id));
            }, duration);
        }
        return id;
    }, []);

    const removeToast = useCallback((id) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    const toast = {
        success: (msg) => addToast(msg, 'success'),
        error: (msg) => addToast(msg, 'error', 7000),
        warning: (msg) => addToast(msg, 'warning'),
        info: (msg) => addToast(msg, 'info'),
        // Undo toast (#13) — stays until user dismisses or clicks undo
        undo: (msg, onUndo) => addToast(msg, 'info', 0, onUndo),
    };

    return (
        <ToastContext.Provider value={toast}>
            {children}
            {/* Toast container — fixed bottom-right */}
            <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-2 pointer-events-none">
                {toasts.map((t) => {
                    const Icon = ICONS[t.type];
                    return (
                        <div
                            key={t.id}
                            className={`pointer-events-auto flex items-start gap-3 px-4 py-3 rounded-xl border shadow-lg max-w-sm animate-[slideIn_0.2s_ease-out] ${STYLES[t.type]}`}
                        >
                            <Icon size={18} className="mt-0.5 shrink-0" />
                            <p className="text-sm font-medium flex-1">{t.message}</p>
                            {t.undoAction && (
                                <button
                                    onClick={() => { t.undoAction(); removeToast(t.id); }}
                                    className="shrink-0 text-sm font-semibold underline hover:no-underline"
                                >
                                    Undo
                                </button>
                            )}
                            <button
                                onClick={() => removeToast(t.id)}
                                className="shrink-0 opacity-60 hover:opacity-100"
                            >
                                <X size={14} />
                            </button>
                        </div>
                    );
                })}
            </div>
        </ToastContext.Provider>
    );
}

export function useToast() {
    const ctx = useContext(ToastContext);
    if (!ctx) throw new Error('useToast must be used within ToastProvider');
    return ctx;
}
