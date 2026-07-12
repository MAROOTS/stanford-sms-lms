import { ClipboardList } from 'lucide-react';

export default function EmptyState({ icon: Icon, title, description, action }) {
    return (
        <div className="flex flex-col items-center justify-center py-14 px-6 text-center">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
                {Icon ? <Icon size={26} className="text-slate-400" /> : <ClipboardList size={26} className="text-slate-400" />}
            </div>
            <h3 className="text-base font-semibold text-slate-700 mb-1">{title || 'Nothing here yet'}</h3>
            {description && <p className="text-sm text-slate-400 max-w-xs mb-5">{description}</p>}
            {action && action}
        </div>
    );
}
