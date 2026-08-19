import { useEffect, useState, useCallback } from 'react';
import { Plus, Building2 } from 'lucide-react';
import axiosClient from '../../api/axiosClient';
import OnboardSchoolModal from './OnboardSchoolModal';

const STATUS_STYLES = { ACTIVE: 'bg-teal-accent/15 text-teal-700', SUSPENDED: 'bg-red-50 text-red-600' };

export default function PlatformAdminDashboard() {
    const [schools, setSchools] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const { data } = await axiosClient.get('/platform/schools');
            setSchools(data);
        } finally { setLoading(false); }
    }, []);

    useEffect(() => { load(); }, [load]);

    const toggleStatus = async (school) => {
        const newStatus = school.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
        if (!window.confirm(`${newStatus === 'SUSPENDED' ? 'Suspend' : 'Reactivate'} ${school.name}?`)) return;
        await axiosClient.patch(`/platform/schools/${school.id}/status`, { status: newStatus });
        load();
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Schools</h1>
                    <p className="text-sm text-slate-500 mt-1">Every school running on the platform.</p>
                </div>
                <button onClick={() => setModalOpen(true)}
                        className="flex items-center gap-1.5 bg-navy-900 hover:bg-navy-800 text-white text-sm font-medium px-4 py-2.5 rounded-lg">
                    <Plus size={16} /> Onboard school
                </button>
            </div>

            {loading && <p className="text-sm text-slate-400">Loading schools...</p>}

            {!loading && (
                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                    <table className="w-full text-sm">
                        <thead>
                        <tr className="border-b border-slate-100 text-left text-[11px] font-semibold tracking-wider text-slate-400">
                            <th className="px-6 py-3">SCHOOL</th>
                            <th className="px-6 py-3">STUDENTS</th>
                            <th className="px-6 py-3">TEACHERS</th>
                            <th className="px-6 py-3">STATUS</th>
                            <th className="px-6 py-3 text-right">ACTIONS</th>
                        </tr>
                        </thead>
                        <tbody>
                        {schools.map((s) => (
                            <tr key={s.id} className="border-b border-slate-50 last:border-0">
                                <td className="px-6 py-4 font-medium text-slate-800 flex items-center gap-2">
                                    <Building2 size={15} className="text-slate-400" /> {s.name}
                                </td>
                                <td className="px-6 py-4 text-slate-600">{s.studentCount}</td>
                                <td className="px-6 py-4 text-slate-600">{s.teacherCount}</td>
                                <td className="px-6 py-4">
                                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_STYLES[s.status]}`}>{s.status}</span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button onClick={() => toggleStatus(s)} className="text-sm font-medium text-slate-600 hover:text-slate-800">
                                        {s.status === 'ACTIVE' ? 'Suspend' : 'Reactivate'}
                                    </button>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            )}

            {modalOpen && <OnboardSchoolModal onClose={() => setModalOpen(false)} onOnboarded={() => { setModalOpen(false); load(); }} />}
        </div>
    );
}