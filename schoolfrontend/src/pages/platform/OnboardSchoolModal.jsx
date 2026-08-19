import { useState } from 'react';
import { X } from 'lucide-react';
import axiosClient from '../../api/axiosClient';
import TempPasswordModal from '../../components/shared/TempPasswordModal';

export default function OnboardSchoolModal({ onClose, onOnboarded }) {
    const [schoolName, setSchoolName] = useState('');
    const [slug, setSlug] = useState('');
    const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);

    const [adminFirstName, setAdminFirstName] = useState('');
    const [adminLastName, setAdminLastName] = useState('');
    const [adminEmail, setAdminEmail] = useState('');

    const [error, setError] = useState('');
    const [saving, setSaving] = useState(false);
    const [credentials, setCredentials] = useState(null);

    const slugify = (text) => text
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');

    const handleSchoolNameChange = (value) => {
        setSchoolName(value);

        if (!slugManuallyEdited) {
            setSlug(slugify(value));
        }
    };

    const handleSlugChange = (value) => {
        setSlugManuallyEdited(true);
        setSlug(slugify(value));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSaving(true);

        try {
            const { data } = await axiosClient.post('/platform/schools', {
                schoolName,
                slug,
                adminFirstName,
                adminLastName,
                adminEmail
            });

            setCredentials({
                username: data.adminUsername,
                temporaryPassword: data.adminTemporaryPassword
            });
        } catch (err) {
            setError(
                err.response?.data?.message ||
                'Could not onboard this school'
            );
        } finally {
            setSaving(false);
        }
    };

    if (credentials) {
        return (
            <TempPasswordModal
                username={credentials.username}
                temporaryPassword={credentials.temporaryPassword}
                onClose={onOnboarded}
            />
        );
    }

    return (
        <div className="fixed inset-0 bg-slate-900/40 flex items-center justify-center z-50 px-4">
            <div className="bg-white rounded-xl w-full max-w-md p-6 shadow-xl">

                <div className="flex items-center justify-between mb-5">
                    <h2 className="text-lg font-bold text-slate-900">
                        Onboard a new school
                    </h2>

                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-slate-600"
                    >
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">

                    {/* School Name */}
                    <input
                        required
                        placeholder="School name"
                        value={schoolName}
                        onChange={(e) =>
                            handleSchoolNameChange(e.target.value)
                        }
                        className="w-full px-3 py-2.5 rounded-lg bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-accent"
                    />

                    {/* Subdomain */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">
                            Subdomain
                        </label>

                        <input
                            required
                            value={slug}
                            onChange={(e) =>
                                handleSlugChange(e.target.value)
                            }
                            placeholder="school-name"
                            className="w-full px-3 py-2.5 rounded-lg bg-slate-50 border border-slate-200 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-teal-accent"
                        />

                        <p className="text-xs text-slate-400 mt-1.5">
                            Login address:{' '}
                            <span className="font-mono">
                                {slug || 'subdomain'}.localhost:5173
                            </span>{' '}
                            (dev) — will become{' '}
                            <span className="font-mono">
                                {slug || 'subdomain'}.yourapp.com
                            </span>{' '}
                            in production
                        </p>
                    </div>

                    {/* First Admin Account */}
                    <p className="text-xs font-semibold tracking-wider text-slate-400 pt-2">
                        FIRST ADMIN ACCOUNT
                    </p>

                    <div className="grid grid-cols-2 gap-3">
                        <input
                            required
                            placeholder="First name"
                            value={adminFirstName}
                            onChange={(e) =>
                                setAdminFirstName(e.target.value)
                            }
                            className="w-full px-3 py-2.5 rounded-lg bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-accent"
                        />

                        <input
                            required
                            placeholder="Last name"
                            value={adminLastName}
                            onChange={(e) =>
                                setAdminLastName(e.target.value)
                            }
                            className="w-full px-3 py-2.5 rounded-lg bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-accent"
                        />
                    </div>

                    <input
                        required
                        type="email"
                        placeholder="Admin email"
                        value={adminEmail}
                        onChange={(e) =>
                            setAdminEmail(e.target.value)
                        }
                        className="w-full px-3 py-2.5 rounded-lg bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-accent"
                    />

                    {error && (
                        <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                            {error}
                        </p>
                    )}

                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-2.5 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            disabled={saving}
                            className="flex-1 py-2.5 rounded-lg bg-navy-900 hover:bg-navy-800 text-white text-sm font-medium disabled:opacity-60"
                        >
                            {saving ? 'Onboarding...' : 'Onboard school'}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
}