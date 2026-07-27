import { useState } from 'react';
import { Copy, Check, X } from 'lucide-react';

export default function TempPasswordModal({ username, temporaryPassword, onClose }) {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(temporaryPassword);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="fixed inset-0 bg-slate-900/40 flex items-center justify-center z-50 px-4">
            <div className="bg-white rounded-xl w-full max-w-sm p-6 shadow-xl">
                <div className="flex items-center justify-between mb-2">
                    <h2 className="text-lg font-bold text-slate-900">Account credentials</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
                </div>
                <p className="text-sm text-slate-500 mb-5">
                    Share these with the user directly — this password will not be shown again.
                </p>

                <div className="space-y-3 mb-5">
                    <div>
                        <p className="text-xs font-semibold tracking-wider text-slate-400 mb-1">USERNAME</p>
                        <p className="font-mono text-sm bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">{username}</p>
                    </div>
                    <div>
                        <p className="text-xs font-semibold tracking-wider text-slate-400 mb-1">TEMPORARY PASSWORD</p>
                        <div className="flex items-center gap-2">
                            <p className="font-mono text-sm bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 flex-1 break-all">
                                {temporaryPassword}
                            </p>
                            <button onClick={handleCopy} className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:text-slate-700 hover:bg-slate-50 shrink-0">
                                {copied ? <Check size={16} className="text-teal-600" /> : <Copy size={16} />}
                            </button>
                        </div>
                    </div>
                </div>

                <button onClick={onClose} className="w-full py-2.5 rounded-lg bg-navy-900 hover:bg-navy-800 text-white text-sm font-medium">
                    Done
                </button>
            </div>
        </div>
    );
}