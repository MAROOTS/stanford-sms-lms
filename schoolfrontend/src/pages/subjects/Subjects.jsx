import { useEffect, useState, useCallback } from 'react';
import { Plus } from 'lucide-react';
import axiosClient from '../../api/axiosClient';
import SubjectModal from './SubjectModal';

export default function Subjects() {
    const [subjects, setSubjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState(null);

    const load = useCallback(async () => {
        setLoading(true); setError('');
        try {
            const { data } = await axiosClient.get('/subjects');
            setSubjects(data);
        } catch { setError('Could not load subjects'); }
        finally { setLoading(false); }
    }, []);

    useEffect(() => { load(); }, [load]);

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this subject?')) return;
        try {
            await axiosClient.delete(`/subjects/${id}`);
            setSubjects((prev) => prev.filter((s) => s.id !== id));
        } catch (err) {
            alert(err.response?.data?.message || 'Could not delete this subject.');
        }
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Subjects</h1>
                    <p className="text-sm text-slate-500 mt-1">Subjects taught across your school.</p>
                </div>
                <button onClick={() => { setEditing(null); setModalOpen(true); }}
                        className="flex items-center gap-1.5 bg-navy-900 hover:bg-navy-800 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors">
                    <Plus size={16} /> Add subject
                </button>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <table className="w-full text-sm">
                    <thead>
                    <tr className="border-b border-slate-100 text-left text-[11px] font-semibold tracking-wider text-slate-400">
                        <th className="px-6 py-3">SUBJECT</th>
                        <th className="px-6 py-3">CODE</th>
                        <th className="px-6 py-3 text-right">ACTIONS</th>
                    </tr>
                    </thead>
                    <tbody>
                    {loading && <tr><td colSpan={3} className="px-6 py-8 text-center text-slate-400">Loading...</td></tr>}
                    {error && !loading && <tr><td colSpan={3} className="px-6 py-8 text-center text-red-500">{error}</td></tr>}
                    {!loading && !error && subjects.length === 0 && <tr><td colSpan={3} className="px-6 py-8 text-center text-slate-400">No subjects yet.</td></tr>}
                    {subjects.map((s) => (
                        <tr key={s.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50">
                            <td className="px-6 py-4 font-medium text-slate-800">{s.name}</td>
                            <td className="px-6 py-4 text-slate-600">{s.code || '—'}</td>
                            <td className="px-6 py-4 text-right">
                                <button onClick={() => { setEditing(s); setModalOpen(true); }} className="text-slate-500 hover:text-slate-700 font-medium mr-4">Edit</button>
                                <button onClick={() => handleDelete(s.id)} className="text-red-500 hover:text-red-600 font-medium">Delete</button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>

            {modalOpen && <SubjectModal initialData={editing} onClose={() => setModalOpen(false)} onSaved={() => { setModalOpen(false); load(); }} />}
        </div>
    );
}