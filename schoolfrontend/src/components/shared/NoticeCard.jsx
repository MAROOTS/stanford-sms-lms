import { ShieldOff, CircleAlert, RefreshCw } from 'lucide-react';

const TONES = {
    forbidden: {
        wrap: 'border-amber-200 bg-amber-50/70',
        iconWrap: 'bg-amber-100 text-amber-700',
        title: 'text-amber-950',
        body: 'text-amber-800/80',
        Icon: ShieldOff,
    },
    mismatch: {
        wrap: 'border-slate-200 bg-white',
        iconWrap: 'bg-slate-100 text-slate-500',
        title: 'text-slate-900',
        body: 'text-slate-500',
        Icon: CircleAlert,
    },
    notfound: {
        wrap: 'border-slate-200 bg-white',
        iconWrap: 'bg-slate-100 text-slate-500',
        title: 'text-slate-900',
        body: 'text-slate-500',
        Icon: CircleAlert,
    },
    error: {
        wrap: 'border-rose-100 bg-rose-50/80',
        iconWrap: 'bg-rose-100 text-rose-600',
        title: 'text-rose-950',
        body: 'text-rose-800/80',
        Icon: CircleAlert,
    },
};

export default function NoticeCard({ notice, onRetry, retryLabel = 'Try again' }) {
    if (!notice) return null;
    const t = TONES[notice.kind] || TONES.error;
    const Icon = t.Icon;
    return (
        <div className={`rounded-2xl border px-6 py-10 text-center mb-4 ${t.wrap}`}>
            <div className={`mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl ${t.iconWrap}`}>
                <Icon size={26} />
            </div>
            <h3 className={`text-base font-semibold ${t.title}`}>{notice.title}</h3>
            <p className={`mx-auto mt-1.5 max-w-md text-sm leading-relaxed ${t.body}`}>{notice.description}</p>
            {onRetry && (
                <button type="button" onClick={onRetry}
                        className="mt-5 inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50">
                    <RefreshCw size={15} /> {retryLabel}
                </button>
            )}
        </div>
    );
}