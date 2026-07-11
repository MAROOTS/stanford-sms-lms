import { useEffect, useState, useCallback } from 'react';
import { Plus } from 'lucide-react';
import axiosClient from '../../api/axiosClient';
import ExamModal from './ExamModal';

export default function Exams() {
    const [exams, setExams] = useState([]);
    const [terms, setTerms] = useState([]);
    const [classSections, setClassSections] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState(null);

    const load = useCallback(async () => {
        setLoading(true); setError('');
        try {
            const [examsRes, termsRes, sectionsRes, subjectsRes] = await Promise.all([
                axiosClient.get('/exams'),
                axiosClient.get('/terms'),
                axiosClient.get('/class-sections'),
                axiosClient.get('/subjects'),
            ]);
            setExams(examsRes.data);
            setTerms(termsRes.data);
            setClassSections(sectionsRes.data);
            setSubjects(subjectsRes.data);
        } catch { setError('Could not load exams'); }
        finally { setLoading(false); }
    }, []);

    useEffect(() => { load(); }, [load]);

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this exam? Any marks recorded against it will remain but become orphaned.')) return;
        try {
            await axiosClient.delete(`/exams/${id}`);
            setExams((prev) => prev.filter((e) => e.id !== id));
        } catch (err) {
            alert(err.response?.data?.message || 'Could not delete this exam.');
        }
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Examinations</h1>
                    <p className="text-sm text-slate-500 mt-1">Exams scheduled per term, with the classes and subjects they cover.</p>
                </div>
                <button onClick={() => { setEditing(null); setModalOpen(true); }}
                        className="flex items-center gap-1.5 bg-navy-900 hover:bg-navy-800 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors">
                    <Plus size={16} /> Add exam
                </button>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <table className="w-full text-sm">
                    <thead>
                    <tr className="border-b border-slate-100 text-left text-[11px] font-semibold tracking-wider text-slate-400">
                        <th className="px-6 py-3">EXAM</th>
                        <th className="px-6 py-3">TYPE</th>
                        <th className="px-6 py-3">TERM</th>
                        <th className="px-6 py-3">CLASSES</th>
                        <th className="px-6 py-3">SUBJECTS</th>
                        <th className="px-6 py-3 text-right">ACTIONS</th>
                    </tr>
                    </thead>
                    <tbody>
                    {loading && <tr><td colSpan={6} className="px-6 py-8 text-center text-slate-400">Loading exams...</td></tr>}
                    {error && !loading && <tr><td colSpan={6} className="px-6 py-8 text-center text-red-500">{error}</td></tr>}
                    {!loading && !error && exams.length === 0 && <tr><td colSpan={6} className="px-6 py-8 text-center text-slate-400">No exams yet.</td></tr>}
                    {exams.map((e) => (
                        <tr key={e.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50">
                            <td className="px-6 py-4 font-medium text-slate-800">{e.name}</td>
                            <td className="px-6 py-4">
                                <span className="inline-block bg-slate-100 text-slate-600 text-xs font-medium px-2.5 py-1 rounded-full">{e.examType}</span>
                            </td>
                            <td className="px-6 py-4 text-slate-600">{e.termName}</td>
                            <td className="px-6 py-4 text-slate-600">{e.classSections.length}</td>
                            <td className="px-6 py-4 text-slate-600">{e.subjects.length}</td>
                            <td className="px-6 py-4 text-right">
                                <button onClick={() => { setEditing(e); setModalOpen(true); }} className="text-slate-500 hover:text-slate-700 font-medium mr-4">Edit</button>
                                <button onClick={() => handleDelete(e.id)} className="text-red-500 hover:text-red-600 font-medium">Delete</button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>

            {modalOpen && (
                <ExamModal
                    initialData={editing}
                    terms={terms}
                    classSections={classSections}
                    subjects={subjects}
                    onClose={() => setModalOpen(false)}
                    onSaved={() => { setModalOpen(false); load(); }}
                />
            )}
        </div>
    );
}