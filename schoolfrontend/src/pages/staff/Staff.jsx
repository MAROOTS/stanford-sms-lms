import { useEffect, useState, useCallback } from 'react';
import { Plus, UserCog, KeyRound, Unlock, Sparkles, RotateCcw } from 'lucide-react';
import axiosClient from '../../api/axiosClient';
import StaffModal from './StaffModal';
import TempPasswordModal from '../../components/shared/TempPasswordModal';
import EmptyState from '../../components/shared/EmptyState';
import { TableSkeleton } from '../../components/shared/LoadingSkeleton';
import { useToast } from '../../context/useToast';
import { useAccountActions } from "../../hooks/useAccountActions";

const ROLE_STYLES = {
    LIBRARIAN: 'bg-blue-50 text-blue-700 border-blue-200',
    ACCOUNTANT: 'bg-amber-50 text-amber-700 border-amber-200',
    ADMIN: 'bg-slate-100 text-slate-700 border-slate-200',
};

const ROLE_LABELS = {
    LIBRARIAN: 'Librarian',
    ACCOUNTANT: 'Accountant',
    ADMIN: 'Admin',
};

export default function Staff() {
    const [staff, setStaff] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [modalOpen, setModalOpen] = useState(false);
    const toast = useToast();

    const load = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const { data } = await axiosClient.get('/admin/users', {
                params: { roles: ['LIBRARIAN', 'ACCOUNTANT', 'ADMIN'] },
            });
            setStaff(data || []);
        } catch {
            setError('Could not load staff accounts. Please try again.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        load();
    }, [load]);

    const { resetCredentials, setResetCredentials, handleResetPassword, handleUnlock } =
        useAccountActions(toast, { entityLabel: 'staff' });

    return (
        <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 animate-in fade-in duration-500">
            {/* HEADER */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-navy-900/5 text-navy-900 text-xs font-semibold mb-2">
                        System Administration
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">Staff</h1>
                    <p className="text-sm text-slate-500 mt-1.5">
                        Manage librarians, accountants, and administrator system access.
                    </p>
                </div>
                <button
                    type="button"
                    onClick={() => setModalOpen(true)}
                    className="flex items-center justify-center gap-2 bg-navy-900 hover:bg-navy-800 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-all shadow-sm active:scale-[0.98] cursor-pointer self-start sm:self-auto"
                >
                    <Plus size={18} /> Add Staff
                </button>
            </div>

            {/* LOADING SKELETON */}
            {loading && <TableSkeleton columns={4} rows={5} />}

            {/* ERROR STATE */}
            {error && !loading && (
                <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 text-center shadow-2xs mb-6">
                    <p className="text-rose-700 font-medium text-sm mb-3">{error}</p>
                    <button
                        type="button"
                        onClick={load}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-800 hover:text-rose-900 underline underline-offset-4 cursor-pointer"
                    >
                        <RotateCcw size={14} /> Try again
                    </button>
                </div>
            )}

            {/* EMPTY STATE */}
            {!loading && !error && staff.length === 0 && (
                <EmptyState
                    icon={UserCog}
                    title="No staff members yet"
                    description="Get started by adding your first librarian, accountant, or administrator account."
                    action={
                        <button
                            type="button"
                            onClick={() => setModalOpen(true)}
                            className="flex items-center justify-center gap-2 bg-navy-900 hover:bg-navy-800 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-all shadow-sm active:scale-[0.98] cursor-pointer"
                        >
                            <Plus size={18} /> Add Staff
                        </button>
                    }
                />
            )}

            {/* TABLE CONTAINER */}
            {!loading && !error && staff.length > 0 && (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-6">
                    <div className="overflow-x-auto custom-scrollbar">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-slate-50/50 border-b border-slate-200">
                            <tr className="text-[11px] font-bold tracking-wider text-slate-500 uppercase">
                                <th className="px-6 py-4">Name</th>
                                <th className="px-6 py-4">Role</th>
                                <th className="px-6 py-4">Email</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                            {staff.map((s) => (
                                <tr
                                    key={s.id}
                                    className="group bg-white hover:bg-slate-50/80 transition-colors"
                                >
                                    <td className="px-6 py-4 font-semibold text-slate-900 whitespace-nowrap">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200/80 flex items-center justify-center text-xs font-bold text-slate-600 shrink-0">
                                                {s.firstName?.[0]}
                                                {s.lastName?.[0]}
                                            </div>
                                            <span className="font-semibold text-slate-900 group-hover:text-navy-900 transition-colors">
                                                    {s.firstName} {s.lastName}
                                                </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                            <span
                                                className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                                                    ROLE_STYLES[s.role] || ROLE_STYLES.ADMIN
                                                }`}
                                            >
                                                {ROLE_LABELS[s.role] || s.role}
                                            </span>
                                    </td>
                                    <td className="px-6 py-4 text-slate-600 whitespace-nowrap">
                                        {s.email}
                                    </td>
                                    <td className="px-6 py-4 text-right whitespace-nowrap">
                                        <div className="flex items-center justify-end gap-1">
                                            <button
                                                type="button"
                                                onClick={() => handleResetPassword(s.id)}
                                                title="Reset Password"
                                                className="p-2 rounded-xl text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-colors cursor-pointer"
                                            >
                                                <KeyRound size={16} />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleUnlock(s.id)}
                                                title="Unlock Account"
                                                className="p-2 rounded-xl text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors cursor-pointer"
                                            >
                                                <Unlock size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* MODALS */}
            {modalOpen && (
                <StaffModal
                    onClose={() => setModalOpen(false)}
                    onSaved={() => {
                        setModalOpen(false);
                        load();
                    }}
                />
            )}

            {resetCredentials && (
                <TempPasswordModal
                    username={resetCredentials.username}
                    temporaryPassword={resetCredentials.temporaryPassword}
                    onClose={() => setResetCredentials(null)}
                />
            )}
        </div>
    );
}