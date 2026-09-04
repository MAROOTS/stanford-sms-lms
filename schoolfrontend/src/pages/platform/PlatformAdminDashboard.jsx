import { useEffect, useState, useCallback } from 'react';
import {
    Plus,
    Building2,
    Users,
    UserCog,
    Ban,
    Play,
    School
} from 'lucide-react';
import axiosClient from '../../api/axiosClient';
import OnboardSchoolModal from './OnboardSchoolModal';
import EmptyState from '../../components/shared/EmptyState';

// Helper component for rich status badges
const StatusBadge = ({ status }) => {
    if (status === 'ACTIVE') {
        return (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-semibold tracking-wide">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_4px_rgba(16,185,129,0.5)] animate-pulse"></span>
                ACTIVE
            </span>
        );
    }
    return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-50 border border-red-100 text-red-700 text-xs font-semibold tracking-wide">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
            SUSPENDED
        </span>
    );
};

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

        try {
            await axiosClient.patch(`/platform/schools/${school.id}/status`, { status: newStatus });
            load();
        } catch {
            alert('Could not change school status. Please try again.');
        }
    };

    return (
        <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 animate-in fade-in duration-500">
            {/* HEADER */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">Platform Schools</h1>
                    <p className="text-sm text-slate-500 mt-1.5">Manage and monitor all institutions currently running on the platform.</p>
                </div>
                <button
                    onClick={() => setModalOpen(true)}
                    className="flex items-center justify-center gap-2 bg-navy-900 hover:bg-navy-800 text-white shadow-sm text-sm font-semibold px-5 py-2.5 rounded-xl transition-all active:scale-[0.98]"
                >
                    <Plus size={18} /> Onboard New School
                </button>
            </div>

            {/* CONTENT AREA */}
            {loading ? (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="p-6 space-y-4">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <div key={i} className="flex items-center justify-between py-2 animate-pulse">
                                <div className="flex items-center gap-4 w-1/3">
                                    <div className="w-10 h-10 rounded-xl bg-slate-100"></div>
                                    <div className="h-4 bg-slate-100 rounded-md w-3/4"></div>
                                </div>
                                <div className="h-4 bg-slate-100 rounded-md w-16"></div>
                                <div className="h-4 bg-slate-100 rounded-md w-16"></div>
                                <div className="h-6 bg-slate-100 rounded-full w-20"></div>
                                <div className="h-8 bg-slate-100 rounded-lg w-24"></div>
                            </div>
                        ))}
                    </div>
                </div>
            ) : schools.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
                    <EmptyState
                        icon={School}
                        title="No schools on the platform yet"
                        description="Click 'Onboard New School' to add your first institution and get started."
                    />
                </div>
            ) : (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto custom-scrollbar">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-slate-50 border-b border-slate-200">
                            <tr className="text-[11px] font-bold tracking-wider text-slate-500 uppercase">
                                <th className="px-6 py-4">Institution</th>
                                <th className="px-6 py-4">Students</th>
                                <th className="px-6 py-4">Teachers</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                            {schools.map((s) => (
                                <tr
                                    key={s.id}
                                    className="group bg-white hover:bg-slate-50/80 transition-colors"
                                >
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500 shadow-sm">
                                                <Building2 size={18} />
                                            </div>
                                            <span className="font-semibold text-slate-900">{s.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2 text-slate-600 font-medium">
                                            <Users size={16} className="text-slate-400" />
                                            {s.studentCount?.toLocaleString() || 0}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2 text-slate-600 font-medium">
                                            <UserCog size={16} className="text-slate-400" />
                                            {s.teacherCount?.toLocaleString() || 0}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <StatusBadge status={s.status} />
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button
                                            onClick={() => toggleStatus(s)}
                                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all active:scale-[0.97]
                                                    ${s.status === 'ACTIVE'
                                                ? 'text-slate-600 border-slate-200 bg-white hover:text-red-700 hover:bg-red-50 hover:border-red-200'
                                                : 'text-slate-600 border-slate-200 bg-white hover:text-emerald-700 hover:bg-emerald-50 hover:border-emerald-200'
                                            }
                                                `}
                                        >
                                            {s.status === 'ACTIVE' ? (
                                                <><Ban size={14} /> Suspend</>
                                            ) : (
                                                <><Play size={14} /> Reactivate</>
                                            )}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* MODAL */}
            {modalOpen && (
                <OnboardSchoolModal
                    onClose={() => setModalOpen(false)}
                    onOnboarded={() => { setModalOpen(false); load(); }}
                />
            )}
        </div>
    );
}