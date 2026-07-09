import { useEffect, useState, useCallback } from 'react';
import { Plus } from 'lucide-react';
import axiosClient from '../../api/axiosClient';
import StudentModal from './StudentModal';

export default function Students() {
    const [students, setStudents] = useState([]);
    const [classSections, setClassSections] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [modalOpen, setModalOpen] = useState(false);
    const [editingStudent, setEditingStudent] = useState(null);

    const loadAll = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const [studentsRes, sectionsRes] = await Promise.all([
                axiosClient.get('/students'),
                axiosClient.get('/class-sections'),
            ]);
            setStudents(studentsRes.data);
            setClassSections(sectionsRes.data);
        } catch {
            setError('Could not load students');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { loadAll(); }, [loadAll]);

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this student? This cannot be undone.')) return;
        try {
            await axiosClient.delete(`/students/${id}`);
            setStudents((prev) => prev.filter((s) => s.id !== id));
        } catch (err) {
            alert(err.response?.data?.message || 'Could not delete this student.');
        }
    };

    const openAddModal = () => { setEditingStudent(null); setModalOpen(true); };
    const openEditModal = (student) => { setEditingStudent(student); setModalOpen(true); };
    const handleSaved = () => { setModalOpen(false); loadAll(); };

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Students</h1>
                    <p className="text-sm text-slate-500 mt-1">All students enrolled at your school.</p>
                </div>
                <button
                    onClick={openAddModal}
                    className="flex items-center gap-1.5 bg-navy-900 hover:bg-navy-800 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors"
                >
                    <Plus size={16} /> Add student
                </button>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <table className="w-full text-sm">
                    <thead>
                    <tr className="border-b border-slate-100 text-left text-[11px] font-semibold tracking-wider text-slate-400">
                        <th className="px-6 py-3">STUDENT</th>
                        <th className="px-6 py-3">EMAIL</th>
                        <th className="px-6 py-3">CLASS</th>
                        <th className="px-6 py-3 text-right">ACTIONS</th>
                    </tr>
                    </thead>
                    <tbody>
                    {loading && (
                        <tr><td colSpan={4} className="px-6 py-8 text-center text-slate-400">Loading students...</td></tr>
                    )}
                    {error && !loading && (
                        <tr><td colSpan={4} className="px-6 py-8 text-center text-red-500">{error}</td></tr>
                    )}
                    {!loading && !error && students.length === 0 && (
                        <tr><td colSpan={4} className="px-6 py-8 text-center text-slate-400">No students yet.</td></tr>
                    )}
                    {students.map((s) => (
                        <tr key={s.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50">
                            <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-semibold text-slate-600">
                                        {s.firstName[0]}{s.lastName[0]}
                                    </div>
                                    <span className="font-medium text-slate-800">{s.firstName} {s.lastName}</span>
                                </div>
                            </td>
                            <td className="px-6 py-4 text-slate-600">{s.email}</td>
                            <td className="px-6 py-4">
                                {s.classSectionName
                                    ? <span className="inline-block bg-slate-100 text-slate-600 text-xs font-medium px-2.5 py-1 rounded-full">{s.classSectionName}</span>
                                    : <span className="text-slate-400">Unassigned</span>}
                            </td>
                            <td className="px-6 py-4 text-right">
                                <button onClick={() => openEditModal(s)} className="text-slate-500 hover:text-slate-700 font-medium mr-4">Edit</button>
                                <button onClick={() => handleDelete(s.id)} className="text-red-500 hover:text-red-600 font-medium">Delete</button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>

            {modalOpen && (
                <StudentModal
                    initialData={editingStudent}
                    classSections={classSections}
                    onClose={() => setModalOpen(false)}
                    onSaved={handleSaved}
                />
            )}
        </div>
    );
}