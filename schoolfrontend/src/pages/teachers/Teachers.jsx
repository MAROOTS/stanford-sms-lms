import { useEffect, useState, useCallback } from 'react';
import { Plus } from 'lucide-react';
import axiosClient from '../../api/axiosClient';
import TeacherModal from './TeacherModal';

export default function Teachers() {
    const [teachers, setTeachers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [modalOpen, setModalOpen] = useState(false);
    const [editingTeacher, setEditingTeacher] = useState(null);

    const loadAll = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const { data } = await axiosClient.get('/teachers');
            setTeachers(data);
        } catch {
            setError('Could not load teachers');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { loadAll(); }, [loadAll]);

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this teacher? This cannot be undone.')) return;
        try {
            await axiosClient.delete(`/teachers/${id}`);
            setTeachers((prev) => prev.filter((t) => t.id !== id));
        } catch (err) {
            alert(err.response?.data?.message || 'Could not delete this teacher.');
        }
    };

    const openAddModal = () => { setEditingTeacher(null); setModalOpen(true); };
    const openEditModal = (teacher) => { setEditingTeacher(teacher); setModalOpen(true); };
    const handleSaved = () => { setModalOpen(false); loadAll(); };

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Teachers</h1>
                    <p className="text-sm text-slate-500 mt-1">All teaching staff at your school.</p>
                </div>
                <button
                    onClick={openAddModal}
                    className="flex items-center gap-1.5 bg-navy-900 hover:bg-navy-800 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors"
                >
                    <Plus size={16} /> Add teacher
                </button>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <table className="w-full text-sm">
                    <thead>
                    <tr className="border-b border-slate-100 text-left text-[11px] font-semibold tracking-wider text-slate-400">
                        <th className="px-6 py-3">TEACHER</th>
                        <th className="px-6 py-3">EMAIL</th>
                        <th className="px-6 py-3 text-right">ACTIONS</th>
                    </tr>
                    </thead>
                    <tbody>
                    {loading && (
                        <tr><td colSpan={3} className="px-6 py-8 text-center text-slate-400">Loading teachers...</td></tr>
                    )}
                    {error && !loading && (
                        <tr><td colSpan={3} className="px-6 py-8 text-center text-red-500">{error}</td></tr>
                    )}
                    {!loading && !error && teachers.length === 0 && (
                        <tr><td colSpan={3} className="px-6 py-8 text-center text-slate-400">No teachers yet.</td></tr>
                    )}
                    {teachers.map((t) => (
                        <tr key={t.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50">
                            <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-teal-accent/15 flex items-center justify-center text-xs font-semibold text-teal-700">
                                        {t.firstName[0]}{t.lastName[0]}
                                    </div>
                                    <span className="font-medium text-slate-800">{t.firstName} {t.lastName}</span>
                                </div>
                            </td>
                            <td className="px-6 py-4 text-slate-600">{t.email}</td>
                            <td className="px-6 py-4 text-right">
                                <button onClick={() => openEditModal(t)} className="text-slate-500 hover:text-slate-700 font-medium mr-4">Edit</button>
                                <button onClick={() => handleDelete(t.id)} className="text-red-500 hover:text-red-600 font-medium">Delete</button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>

            {modalOpen && (
                <TeacherModal
                    initialData={editingTeacher}
                    onClose={() => setModalOpen(false)}
                    onSaved={handleSaved}
                />
            )}
        </div>
    );
}