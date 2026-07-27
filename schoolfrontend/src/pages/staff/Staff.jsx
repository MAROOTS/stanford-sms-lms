import { useEffect, useState, useCallback } from 'react';
import { Plus, UserCog, KeyRound, Unlock } from 'lucide-react';
import axiosClient from '../../api/axiosClient';
import StaffModal from './StaffModal';
import TempPasswordModal from '../../components/shared/TempPasswordModal';
import EmptyState from '../../components/shared/EmptyState';
import { TableSkeleton } from '../../components/shared/LoadingSkeleton';
import { useToast } from '../../context/useToast';

const ROLE_STYLES = {
    LIBRARIAN: 'bg-blue-50 text-blue-600',
    ACCOUNTANT: 'bg-amber-50 text-amber-700',
    ADMIN: 'bg-slate-100 text-slate-600',
};

export default function Staff() {
    const [staff, setStaff] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [modalOpen, setModalOpen] = useState(false);
    const [resetCredentials, setResetCredentials] = useState(null);
    const toast = useToast();

    const load = useCallback(async () => {
        setLoading(true); setError('');
        try {
            const { data } = await axiosClient.get('/admin/users', {
                params: { roles: ['LIBRARIAN', 'ACCOUNTANT', 'ADMIN'] },
            });
            setStaff(data);
        } catch { setError('Could not load staff'); }
        finally { setLoading(false); }
    }, []);

    useEffect(() => { load(); }, [load]);

    const handleResetPassword = async (userId) => {
        if (!window.confirm('Generate a new temporary password for this account?')) return;
        try {
            const { data } = await axiosClient.post(`/admin/users/${userId}/reset-password`);
            setResetCredentials(data);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Could not reset password');
        }
    };

    const handleUnlock = async (userId) => {
        try {
            await axiosClient.post(`/admin/users/${userId}/unlock`);
            toast.success('Account unlocked.');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Could not unlock account');
        }
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Staff</h1>
                    <p className="text-sm text-slate-500 mt-1">Librarians, accountants, and other administrators.</p>
                </div>
                <button onClick={() => setModalOpen(true)}
                        className="flex items-center gap-1.5 bg-navy-900 hover:bg-navy-800 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors">
                    <Plus size={16} /> Add staff
                </button>
            </div>

            {loading && <TableSkeleton columns={3} rows={4} />}
            {error && !loading && <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</p>}
            {!loading && !error && staff.length === 0 && (
                <EmptyState icon={UserCog} title="No staff yet" description="Add your first librarian or accountant account." />
            )}

            {!loading && !error && staff.length > 0 && (
                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                    <table className="w-full text-sm">
                        <thead>
                        <tr className="border-b border-slate-100 text-left text-[11px] font-semibold tracking-wider text-slate-400">
                            <th className="px-6 py-3">NAME</th>
                            <th className="px-6 py-3">ROLE</th>
                            <th className="px-6 py-3">EMAIL</th>
                            <th className="px-6 py-3 text-right">ACTIONS</th>
                        </tr>
                        </thead>
                        <tbody>
                        {staff.map((s) => (
                            <tr key={s.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50">
                                <td className="px-6 py-4 font-medium text-slate-800">{s.firstName} {s.lastName}</td>
                                <td className="px-6 py-4">
                                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${ROLE_STYLES[s.role]}`}>{s.role}</span>
                                </td>
                                <td className="px-6 py-4 text-slate-600">{s.email}</td>
                                <td className="px-6 py-4 text-right">
                                    <button onClick={() => handleResetPassword(s.id)} title="Reset password" className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 mr-1">
                                        <KeyRound size={16} />
                                    </button>
                                    <button onClick={() => handleUnlock(s.id)} title="Unlock account" className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100">
                                        <Unlock size={16} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            )}

            {modalOpen && <StaffModal onClose={() => setModalOpen(false)} onSaved={() => { setModalOpen(false); load(); }} />}
            {resetCredentials && (
                <TempPasswordModal username={resetCredentials.username} temporaryPassword={resetCredentials.temporaryPassword} onClose={() => setResetCredentials(null)} />
            )}
        </div>
    );
}