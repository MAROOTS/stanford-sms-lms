import { useEffect, useState, useCallback } from 'react';
import { Plus, Layers3 } from 'lucide-react';
import axiosClient from '../../api/axiosClient';
import ClassSectionModal from './ClassSectionModal';
import ConfirmDialog from '../../components/shared/ConfirmDialog';
import EmptyState from '../../components/shared/EmptyState';
import { TableSkeleton } from '../../components/shared/LoadingSkeleton';
import { useToast } from '../../context/ToastContext';

export default function Classes() {
  const [sections, setSections] = useState([]);
  const [gradeLevels, setGradeLevels] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSection, setEditingSection] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const toast = useToast();

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

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const id = deleteTarget.id;
    const name = deleteTarget.name;
    setDeleteTarget(null);
    try {
      await axiosClient.delete(`/class-sections/${id}`);
      setSections((prev) => prev.filter((s) => s.id !== id));
      toast.success(`${name} has been deleted.`);
    } catch {
      toast.error('Could not delete this class.');
    }
  };

  const openAddModal = () => { setEditingSection(null); setModalOpen(true); };
  const openEditModal = (section) => { setEditingSection(section); setModalOpen(true); };
  const handleSaved = () => { setModalOpen(false); loadAll(); toast.success('Class saved successfully.'); };

  return (
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Classes</h1>
            <p className="text-sm text-slate-500 mt-1">Your school's classes, by grade level and stream.</p>
          </div>
          <button
              onClick={openAddModal}
              className="flex items-center gap-1.5 bg-navy-900 hover:bg-navy-800 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors"
          >
            <Plus size={16} /> Add class
          </button>
        </div>

        {loading && <TableSkeleton columns={4} rows={5} />}

        {error && !loading && (
            <div className="bg-red-50 border border-red-100 rounded-xl p-6 text-center">
              <p className="text-red-600 text-sm mb-3">{error}</p>
              <button onClick={loadAll} className="text-sm font-medium text-red-700 hover:text-red-800 underline">Try again</button>
            </div>
        )}

        {!loading && !error && sections.length === 0 && (
            <EmptyState
                icon={Layers3}
                title="No classes yet"
                description="Create your first class section to organize students."
                action={
                    <button onClick={openAddModal}
                            className="flex items-center gap-1.5 bg-navy-900 hover:bg-navy-800 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors">
                      <Plus size={16} /> Add class
                    </button>
                }
            />
        )}

        {!loading && !error && sections.length > 0 && (
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <div className="overflow-x-auto">
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
                  {sections.map((s) => (
                      <tr key={s.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4 font-medium text-slate-800">{s.name}</td>
                        <td className="px-6 py-4">
                          {s.gradeLevelStage
                              ? <span className="inline-block bg-slate-100 text-slate-600 text-xs font-medium px-2.5 py-1 rounded-full">{s.gradeLevelStage}</span>
                              : <span className="text-slate-400">—</span>}
                        </td>
                        <td className="px-6 py-4 text-slate-600">{s.homeroomTeacherName || '—'}</td>
                        <td className="px-6 py-4 text-right">
                          <button onClick={() => openEditModal(s)} className="text-slate-500 hover:text-slate-700 font-medium mr-4 transition-colors">Edit</button>
                          <button onClick={() => setDeleteTarget(s)} className="text-red-500 hover:text-red-600 font-medium transition-colors">Delete</button>
                        </td>
                      </tr>
                  ))}
                  </tbody>
                </table>
              </div>
            </div>
        )}

        {modalOpen && (
            <ClassSectionModal
                initialData={editingSection}
                gradeLevels={gradeLevels}
                teachers={teachers}
                onClose={() => setModalOpen(false)}
                onSaved={handleSaved}
            />
        )}

        <ConfirmDialog
            open={!!deleteTarget}
            title="Delete class"
            message={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
            confirmLabel="Delete"
            variant="danger"
            onConfirm={handleDelete}
            onCancel={() => setDeleteTarget(null)}
        />
      </div>
  );
}
