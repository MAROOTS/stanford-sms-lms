import { useState } from 'react';
import { User, ShieldCheck, Bell, Building2 } from 'lucide-react';
import { useAuth } from '../../context/useAuth';
import ProfileTab from './ProfileTab';
import SessionsTab from './SessionsTab';
import NotificationsTab from './NotificationsTab';
import SchoolProfileTab from './SchoolProfileTab';

export default function Settings() {
    const { user } = useAuth();
    const isAdmin = user?.role === 'ADMIN';

    const tabs = [
        { key: 'profile', label: 'My Profile', icon: User },
        { key: 'sessions', label: 'Active Sessions', icon: ShieldCheck },
        { key: 'notifications', label: 'Notifications', icon: Bell },
        ...(isAdmin ? [{ key: 'school', label: 'School Profile', icon: Building2 }] : []),
    ];

    const [activeTab, setActiveTab] = useState('profile');

    return (
        <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 animate-in fade-in duration-500">
            {/* HEADER */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">Settings</h1>
                <p className="text-sm text-slate-500 mt-1.5">
                    Manage your personal account settings, security sessions, and school profile.
                </p>
            </div>

            {/* TAB NAVIGATION */}
            <div className="border-b border-slate-200 mb-8 overflow-x-auto custom-scrollbar">
                <nav className="flex gap-2 -mb-px min-w-max" aria-label="Settings Tabs">
                    {tabs.map((t) => {
                        const Icon = t.icon;
                        const isActive = activeTab === t.key;
                        return (
                            <button
                                key={t.key}
                                type="button"
                                onClick={() => setActiveTab(t.key)}
                                className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold transition-all border-b-2 cursor-pointer ${
                                    isActive
                                        ? 'border-navy-900 text-navy-900'
                                        : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
                                }`}
                            >
                                <Icon size={17} className={isActive ? 'text-navy-900' : 'text-slate-400'} />
                                {t.label}
                            </button>
                        );
                    })}
                </nav>
            </div>

            {/* TAB CONTENT */}
            <div className="mt-6">
                {activeTab === 'profile' && <ProfileTab />}
                {activeTab === 'sessions' && <SessionsTab />}
                {activeTab === 'notifications' && <NotificationsTab />}
                {activeTab === 'school' && isAdmin && <SchoolProfileTab />}
            </div>
        </div>
    );
}