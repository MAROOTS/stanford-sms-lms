import { useEffect, useState, useCallback } from 'react';
import { Plus, UserCheck } from 'lucide-react';
import axiosClient from '../../api/axiosClient';
import ApplicationModal from './ApplicationModal';
import DecisionModal from './DecisionModal';
import EnrollModal from './EnrollModal';

const STATUS_STYLES = {
    SUBMITTED: 'bg-slate-100 text-slate-600',
    UNDER_REVIEW: 'bg-blue-50 text-blue-600',
    ACCEPTED: 'bg-teal-accent/15 text-teal-700',
    WAITLISTED: 'bg-amber-50 text-amber-700',
    REJECTED: 'bg-red-50 text-red-600',
    ENROLLED: 'bg-purple-50 text-purple-700',
};

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
        } catch { setError('Could not load applications'); }
        finally { setLoading(false); }
    }, [statusFilter]);

    useEffect(() => { load(); }, [load]);

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this application?')) return;
        try {
            await axiosClient.delete(`/admissions/${id}`);
            setApplications((prev) => prev.filter((a) => a.id !== id));
        } catch (err) {
            alert(err.response?.data?.message || 'Could not delete this application.');
        }
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Admissions</h1>
                    <p className="text-sm text-slate-500 mt-1">Review applications and enroll new students.</p>
                </div>
                <div className="flex items-center gap-3">
                    <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
                            className="px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm font-medium text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-teal-accent">
                        <option value="">All statuses</option>
                        {Object.keys(STATUS_STYLES).map((s) => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
                    </select>
                    <button onClick={() => { setEditingApp(null); setModalOpen(true); }}
                            className="flex items-center gap-1.5 bg-navy-900 hover:bg-navy-800 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors">
                        <Plus size={16} /> New application
                    </button>
                </div>
            </div>

            {error && <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2 mb-4">{error}</p>}
            {loading && <p className="text-sm text-slate-400">Loading applications...</p>}
            {!loading && applications.length === 0 && <p className="text-sm text-slate-400">No applications yet.</p>}

            {!loading && applications.length > 0 && (
                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                    <table className="w-full text-sm">
                        <thead>
                        <tr className="border-b border-slate-100 text-left text-[11px] font-semibold tracking-wider text-slate-400">
                            <th className="px-6 py-3">APPLICANT</th>
                            <th className="px-6 py-3">GUARDIAN</th>
                            <th className="px-6 py-3">DESIRED GRADE</th>
                            <th className="px-6 py-3">STATUS</th>
                            <th className="px-6 py-3 text-right">ACTIONS</th>
                        </tr>
                        </thead>
                        <tbody>
                        {applications.map((a) => (
                            <tr key={a.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50">
                                <td className="px-6 py-4 font-medium text-slate-800">{a.firstName} {a.lastName}</td>
                                <td className="px-6 py-4 text-slate-600">
                                    <p>{a.guardianName}</p>
                                    <p className="text-xs text-slate-400">{a.guardianEmail}</p>
                                </td>
                                <td className="px-6 py-4 text-slate-600">{a.desiredGradeLevelName || '—'}</td>
                                <td className="px-6 py-4">
                                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_STYLES[a.status]}`}>{a.status.replace('_', ' ')}</span>
                                </td>
                                <td className="px-6 py-4 text-right whitespace-nowrap">
                                    {a.status === 'ENROLLED' ? (
                                        <span className="text-slate-400 text-xs">Enrolled</span>
                                    ) : (
                                        <>
                                            {a.status === 'ACCEPTED' && (
                                                <button onClick={() => setEnrollingApp(a)} className="inline-flex items-center gap-1 text-teal-600 hover:text-teal-700 font-medium mr-4">
                                                    <UserCheck size={14} /> Enroll
                                                </button>
                                            )}
                                            <button onClick={() => setDecidingApp(a)} className="text-slate-500 hover:text-slate-700 font-medium mr-4">Review</button>
                                            <button onClick={() => { setEditingApp(a); setModalOpen(true); }} className="text-slate-500 hover:text-slate-700 font-medium mr-4">Edit</button>
                                            <button onClick={() => handleDelete(a.id)} className="text-red-500 hover:text-red-600 font-medium">Delete</button>
                                        </>
                                    )}
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            )}

            {modalOpen && (
                <ApplicationModal initialData={editingApp} onClose={() => setModalOpen(false)} onSaved={() => { setModalOpen(false); load(); }} />
            )}
            {decidingApp && (
                <DecisionModal application={decidingApp} onClose={() => setDecidingApp(null)} onSaved={() => { setDecidingApp(null); load(); }} />
            )}
            {enrollingApp && (
                <EnrollModal application={enrollingApp} onClose={() => setEnrollingApp(null)} onEnrolled={() => { setEnrollingApp(null); load(); }} />
            )}
        </div>
    );
}