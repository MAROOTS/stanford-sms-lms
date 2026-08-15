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
        <div>
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
                <p className="text-sm text-slate-500 mt-1">Manage your account and preferences.</p>
            </div>

            <div className="flex gap-1 border-b border-slate-200 mb-6">
                {tabs.map((t) => (
                    <button key={t.key} onClick={() => setActiveTab(t.key)}
                            className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                                activeTab === t.key ? 'border-teal-accent text-teal-700' : 'border-transparent text-slate-500 hover:text-slate-700'
                            }`}>
                        <t.icon size={15} /> {t.label}
                    </button>
                ))}
            </div>

            {activeTab === 'profile' && <ProfileTab />}
            {activeTab === 'sessions' && <SessionsTab />}
            {activeTab === 'notifications' && <NotificationsTab />}
            {activeTab === 'school' && isAdmin && <SchoolProfileTab />}
        </div>
    );
}