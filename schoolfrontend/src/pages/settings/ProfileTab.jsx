import { useState, useEffect } from 'react';
import axiosClient from '../../api/axiosClient';
import { useAuth } from '../../context/useAuth';
import { useToast } from '../../context/useToast';

export default function ProfileTab() {
    const { user, updateUserProfile } = useAuth();
    const toast = useToast();
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        axiosClient.get('/users/me').then((res) => {
            setFirstName(res.data.firstName);
            setLastName(res.data.lastName);
            setEmail(res.data.email);
        });
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(''); setSaving(true);
        try {
            const { data } = await axiosClient.put('/users/me', { firstName, lastName, email });
            updateUserProfile({ firstName: data.firstName, email: data.email });
            toast.success('Profile updated.');
        } catch (err) {
            setError(err.response?.data?.message || 'Could not update profile');
        } finally { setSaving(false); }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Username</label>
                <input disabled value={user?.username || ''} className="w-full px-3 py-2.5 rounded-lg bg-slate-100 border border-slate-200 text-sm font-mono text-slate-500" />
            </div>
            <div className="grid grid-cols-2 gap-3">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">First name</label>
                    <input required value={firstName} onChange={(e) => setFirstName(e.target.value)}
                           className="w-full px-3 py-2.5 rounded-lg bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-accent" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Last name</label>
                    <input required value={lastName} onChange={(e) => setLastName(e.target.value)}
                           className="w-full px-3 py-2.5 rounded-lg bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-accent" />
                </div>
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                       className="w-full px-3 py-2.5 rounded-lg bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-accent" />
            </div>
            {error && <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</p>}
            <button type="submit" disabled={saving} className="bg-navy-900 hover:bg-navy-800 text-white text-sm font-medium px-4 py-2.5 rounded-lg disabled:opacity-60">
                {saving ? 'Saving...' : 'Save changes'}
            </button>
        </form>
    );
}