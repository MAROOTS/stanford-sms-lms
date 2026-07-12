import { ClipboardList } from 'lucide-react';

export default function EmptyState({ icon: Icon, title, description, action }) {
    return (
        <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
            <div className="w-16 h-16 rounded-2xl bg-surface-100 flex items-center justify-center mb-5 shadow-sm">
                {Icon ? <Icon size={28} className="text-slate-400" /> : <ClipboardList size={28} className="text-slate-400" />}
            </div>
            <h3 className="text-base font-bold text-slate-700 mb-1.5">{title || 'Nothing here yet'}</h3>
            {description && <p className="text-sm text-slate-500 max-w-xs mb-6 leading-relaxed">{description}</p>}
            {action && action}
        </div>
    );
}
