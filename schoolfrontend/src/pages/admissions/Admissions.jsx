import { useEffect, useState, useCallback } from 'react';
import {
    Plus,
    UserCheck,
    ChevronDown,
    AlertTriangle,
    Search,
    Trash2,
    Edit,
    ClipboardSignature,
    Loader2
} from 'lucide-react';
import axiosClient from '../../api/axiosClient';
import ApplicationModal from './ApplicationModal';
import DecisionModal from './DecisionModal';
import EnrollModal from './EnrollModal';

const STATUS_STYLES = {
    SUBMITTED: 'bg-slate-50 border-slate-200 text-slate-700',
    UNDER_REVIEW: 'bg-blue-50 border-blue-200 text-blue-700',
    ACCEPTED: 'bg-emerald-50 border-emerald-200 text-emerald-700',
    WAITLISTED: 'bg-amber-50 border-amber-200 text-amber-700',
    REJECTED: 'bg-rose-50 border-rose-200 text-rose-700',
    ENROLLED: 'bg-purple-50 border-purple-200 text-purple-700',
};

const formatStatus = (status) => status.replace('_', ' ');

export default function Admissions() {
    const [applications, setApplications] = useState([]);
    const [statusFilter, setStatusFilter] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [modalOpen, setModalOpen] = useState(false);
    const [editingApp, setEditingApp] = useState(null);
    const [decidingApp, setDecidingApp] = useState(null);
    const [enrollingApp, setEnrollingApp] = useState(null);

    const load = useCallback(async () => {
        setLoading(true); setError('');
        try {
            const { data } = await axiosClient.get('/admissions', {
                params: statusFilter ? { status: statusFilter } : {},
            });
            setApplications(data);
        } catch {
            setError('Could not load applications. Please try again.');
        } finally {
            setLoading(false);
        }
    }, [statusFilter]);

    useEffect(() => { load(); }, [load]);

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this application? This action cannot be undone.')) return;
        try {
            await axiosClient.delete(`/admissions/${id}`);
            setApplications((prev) => prev.filter((a) => a.id !== id));
        } catch (err) {
            alert(err.response?.data?.message || 'Could not delete this application.');
        }
    };

    return (
        <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 animate-in fade-in duration-500">
            {/* HEADER & CONTROLS */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">Admissions</h1>
                    <p className="text-sm text-slate-500 mt-1.5">Review applications, make decisions, and enroll new students.</p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    <div className="relative">
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="w-full sm:w-48 appearance-none px-4 py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-navy-900 focus:border-transparent text-sm font-medium text-slate-700 transition-all cursor-pointer"
                        >
                            <option value="">All Statuses</option>
                            {Object.keys(STATUS_STYLES).map((s) => (
                                <option key={s} value={s}>{formatStatus(s)}</option>
                            ))}
                        </select>
                        <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>
                    <button
                        onClick={() => { setEditingApp(null); setModalOpen(true); }}
                        className="flex items-center justify-center gap-2 bg-navy-900 hover:bg-navy-800 text-white shadow-sm text-sm font-semibold px-5 py-2.5 rounded-xl transition-all active:scale-[0.98]"
                    >
                        <Plus size={18} /> New Application
                    </button>
                </div>
            </div>

            {/* ERROR STATE */}
            {error && (
                <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700 shadow-sm animate-in fade-in">
                    <AlertTriangle size={20} className="shrink-0 mt-0.5" />
                    <div>
                        <h4 className="font-semibold text-sm">Action Failed</h4>
                        <p className="text-sm mt-1 opacity-90">{error}</p>
                    </div>
                </div>
            )}

            {/* CONTENT AREA */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col min-h-[400px]">
                {loading ? (
                    <div className="flex flex-col items-center justify-center flex-1 py-12 text-slate-400">
                        <Loader2 size={32} className="animate-spin mb-4 text-navy-900/40" />
                        <p className="text-sm font-medium">Loading applications...</p>
                    </div>
                ) : applications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center flex-1 py-16 px-4 text-center">
                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 border border-slate-100 shadow-sm">
                            <Search size={28} className="text-slate-400" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 mb-1">No applications found</h3>
                        <p className="text-slate-500 text-sm max-w-sm mb-6">
                            {statusFilter
                                ? `There are no applications currently marked as "${formatStatus(statusFilter)}".`
                                : "You haven't received any admissions applications yet."}
                        </p>
                        {statusFilter && (
                            <button
                                onClick={() => setStatusFilter('')}
                                className="text-sm font-semibold text-navy-900 hover:text-navy-800"
                            >
                                Clear filters
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="overflow-x-auto custom-scrollbar">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-slate-50 border-b border-slate-200">
                            <tr className="text-[11px] font-bold tracking-wider text-slate-500 uppercase">
                                <th className="px-6 py-4">Applicant</th>
                                <th className="px-6 py-4">Guardian</th>
                                <th className="px-6 py-4">Desired Grade</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                            {applications.map((a) => (
                                <tr key={a.id} className="group bg-white hover:bg-slate-50/80 transition-colors">
                                    <td className="px-6 py-4">
                                        <span className="font-semibold text-slate-900">{a.firstName} {a.lastName}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="font-medium text-slate-700">{a.guardianName}</p>
                                        <p className="text-xs text-slate-500 mt-0.5">{a.guardianEmail}</p>
                                    </td>
                                    <td className="px-6 py-4 text-slate-600 font-medium">
                                        {a.desiredGradeLevelName || '—'}
                                    </td>
                                    <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wide border uppercase ${STATUS_STYLES[a.status]}`}>
                                                {formatStatus(a.status)}
                                            </span>
                                    </td>
                                    <td className="px-6 py-4 text-right whitespace-nowrap">
                                        {a.status === 'ENROLLED' ? (
                                            <span className="inline-flex items-center gap-1.5 text-slate-400 text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-100 bg-slate-50 cursor-not-allowed">
                                                    <UserCheck size={14} /> Enrolled
                                                </span>
                                        ) : (
                                            <div className="flex items-center justify-end gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
                                                {a.status === 'ACCEPTED' && (
                                                    <button
                                                        onClick={() => setEnrollingApp(a)}
                                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-100 transition-colors"
                                                    >
                                                        <UserCheck size={14} /> Enroll
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => setDecidingApp(a)}
                                                    title="Review Application"
                                                    className="p-1.5 text-slate-400 hover:text-navy-900 hover:bg-slate-100 rounded-lg transition-colors"
                                                >
                                                    <ClipboardSignature size={18} />
                                                </button>
                                                <button
                                                    onClick={() => { setEditingApp(a); setModalOpen(true); }}
                                                    title="Edit Application"
                                                    className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                >
                                                    <Edit size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(a.id)}
                                                    title="Delete Application"
                                                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* MODALS */}
            {modalOpen && (
                <ApplicationModal
                    initialData={editingApp}
                    onClose={() => setModalOpen(false)}
                    onSaved={() => { setModalOpen(false); load(); }}
                />
            )}
            {decidingApp && (
                <DecisionModal
                    application={decidingApp}
                    onClose={() => setDecidingApp(null)}
                    onSaved={() => { setDecidingApp(null); load(); }}
                />
            )}
            {enrollingApp && (
                <EnrollModal
                    application={enrollingApp}
                    onClose={() => setEnrollingApp(null)}
                    onEnrolled={() => { setEnrollingApp(null); load(); }}
                />
            )}
        </div>
    );
}