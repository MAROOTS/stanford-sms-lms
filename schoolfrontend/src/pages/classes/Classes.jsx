import { useEffect, useState, useCallback } from 'react';
import { Plus } from 'lucide-react';
import axiosClient from '../../api/axiosClient';
import ClassSectionModal from './ClassSectionModal';

export default function Classes() {
  const [sections, setSections] = useState([]);
  const [gradeLevels, setGradeLevels] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSection, setEditingSection] = useState(null);

  const loadAll = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [sectionsRes, gradeLevelsRes, teachersRes] = await Promise.all([
        axiosClient.get('/class-sections'),
        axiosClient.get('/grade-levels'),
        axiosClient.get('/teachers'),
      ]);
      setSections(sectionsRes.data);
      setGradeLevels(gradeLevelsRes.data);
      setTeachers(teachersRes.data);
    } catch {
      setError('Could not load classes');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this class? This cannot be undone.')) return;
    try {
      await axiosClient.delete(`/class-sections/${id}`);
      setSections((prev) => prev.filter((s) => s.id !== id));
    } catch {
      alert('Could not delete this class.');
    }
  };

  const openAddModal = () => { setEditingSection(null); setModalOpen(true); };
  const openEditModal = (section) => { setEditingSection(section); setModalOpen(true); };
  const handleSaved = () => { setModalOpen(false); loadAll(); };

  return (
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Classes</h1>
            <p className="text-sm text-slate-500 mt-1">Your school's classes, by grade level and stream.</p>
          </div>
          <button
              onClick={openAddModal}
              className="flex items-center gap-1.5 bg-navy-900 hover:bg-navy-800 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors cursor-pointer"
          >
            <Plus size={16} /> Add class
          </button>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
            <tr className="border-b border-slate-100 text-left text-[11px] font-semibold tracking-wider text-slate-400">
              <th className="px-6 py-3">CLASS</th>
              <th className="px-6 py-3">STAGE</th>
              <th className="px-6 py-3">CLASS TEACHER</th>
              <th className="px-6 py-3 text-right">ACTIONS</th>
            </tr>
            </thead>
            <tbody>
            {loading && (
                <tr><td colSpan={4} className="px-6 py-8 text-center text-slate-400">Loading classes...</td></tr>
            )}
            {error && !loading && (
                <tr><td colSpan={4} className="px-6 py-8 text-center text-red-500">{error}</td></tr>
            )}
            {!loading && !error && sections.length === 0 && (
                <tr><td colSpan={4} className="px-6 py-8 text-center text-slate-400">No classes yet.</td></tr>
            )}
            {sections.map((s) => (
                <tr key={s.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50">
                  <td className="px-6 py-4 font-medium text-slate-800">{s.name}</td>
                  <td className="px-6 py-4">
                    {s.gradeLevelStage
                        ? <span className="inline-block bg-slate-100 text-slate-600 text-xs font-medium px-2.5 py-1 rounded-full">{s.gradeLevelStage}</span>
                        : <span className="text-slate-400">—</span>}
                  </td>
                  <td className="px-6 py-4 text-slate-600">{s.homeroomTeacherName || '—'}</td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => openEditModal(s)} className="text-slate-500 hover:text-slate-700 font-medium mr-4 cursor-pointer">Edit</button>
                    <button onClick={() => handleDelete(s.id)} className="text-red-500 hover:text-red-600 font-medium cursor-pointer">Delete</button>
                  </td>
                </tr>
            ))}
            </tbody>
          </table>
        </div>

        {modalOpen && (
            <ClassSectionModal
                initialData={editingSection}
                gradeLevels={gradeLevels}
                teachers={teachers}
                onClose={() => setModalOpen(false)}
                onSaved={handleSaved}
            />
        )}
      </div>
  );
}