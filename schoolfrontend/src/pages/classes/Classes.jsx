import { useEffect, useState, useCallback } from 'react';
import { Plus, Layers3, Eye, Pencil, Trash2, GraduationCap, Users } from 'lucide-react';
import axiosClient from '../../api/axiosClient';
import ClassSectionModal from './ClassSectionModal';
import ConfirmDialog from '../../components/shared/ConfirmDialog';
import EmptyState from '../../components/shared/EmptyState';
import { TableSkeleton } from '../../components/shared/LoadingSkeleton';
import { useToast } from '../../context/useToast';

export default function Classes() {
  const [sections, setSections] = useState([]);
  const [gradeLevels, setGradeLevels] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSection, setEditingSection] = useState(null);
  const [viewingSection, setViewingSection] = useState(null);
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

  useEffect(() => { queueMicrotask(() => loadAll()); }, [loadAll]);

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

  const openAddModal = () => { setEditingSection(null); setViewingSection(null); setModalOpen(true); };
  const openEditModal = (section) => { setEditingSection(section); setViewingSection(null); setModalOpen(true); };
  const openViewModal = (section) => { setViewingSection(section); setEditingSection(null); setModalOpen(true); };
  const handleSaved = () => { setModalOpen(false); loadAll(); toast.success('Class saved successfully.'); };

  return (
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 animate-in fade-in duration-500">
        {/* HEADER & CONTROLS */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Classes</h1>
            <p className="text-sm text-slate-500 mt-1.5">Manage your school's classes, organized by grade level and stream.</p>
          </div>
          <button
              onClick={openAddModal}
              className="flex items-center justify-center gap-2 bg-navy-900 hover:bg-navy-800 text-white shadow-sm text-sm font-semibold px-5 py-2.5 rounded-xl transition-all active:scale-[0.98]"
          >
            <Plus size={18} /> Add Class
          </button>
        </div>

        {/* LOADING STATE */}
        {loading && <TableSkeleton columns={4} rows={5} />}

        {/* ERROR STATE */}
        {error && !loading && (
            <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 text-center shadow-sm">
              <p className="text-rose-700 text-sm font-medium mb-3">{error}</p>
              <button onClick={loadAll} className="text-sm font-semibold text-rose-800 hover:text-rose-900 underline">Try again</button>
            </div>
        )}

        {/* EMPTY STATE */}
        {!loading && !error && sections.length === 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-12">
              <EmptyState
                  icon={Layers3}
                  title="No classes yet"
                  description="Create your first class section to organize students and assign teachers."
                  action={
                    <button onClick={openAddModal}
                            className="flex items-center gap-2 bg-navy-900 hover:bg-navy-800 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-all shadow-sm">
                      <Plus size={16} /> Add Class
                    </button>
                  }
              />
            </div>
        )}

        {/* DATA TABLE */}
        {!loading && !error && sections.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50 border-b border-slate-200">
                  <tr className="text-[11px] font-bold tracking-wider text-slate-500 uppercase">
                    <th className="px-6 py-4">Class</th>
                    <th className="px-6 py-4">Stage / Grade</th>
                    <th className="px-6 py-4">Class Teacher</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                  {sections.map((s) => (
                      <tr key={s.id} className="group bg-white hover:bg-slate-50/80 transition-colors">
                        <td className="px-6 py-4 font-semibold text-slate-900">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 font-bold text-xs">
                              {s.name.substring(0, 2).toUpperCase()}
                            </div>
                            {s.name}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {s.gradeLevelStage ? (
                              <span className="inline-flex items-center gap-1 bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold px-2.5 py-1 rounded-lg">
                                <GraduationCap size={14} className="text-slate-400" />
                                {s.gradeLevelStage}
                              </span>
                          ) : (
                              <span className="text-slate-400">—</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-slate-700 font-medium">
                          {s.homeroomTeacherName ? (
                              <div className="flex items-center gap-2">
                                <Users size={14} className="text-slate-400" />
                                {s.homeroomTeacherName}
                              </div>
                          ) : (
                              <span className="text-slate-400 font-normal">Unassigned</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
                            <button
                                onClick={() => openViewModal(s)}
                                title="View Details"
                                className="p-2 rounded-xl text-slate-400 hover:text-navy-900 hover:bg-slate-100 transition-colors"
                            >
                              <Eye size={16} />
                            </button>
                            <button
                                onClick={() => openEditModal(s)}
                                title="Edit Class"
                                className="p-2 rounded-xl text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                            >
                              <Pencil size={16} />
                            </button>
                            <button
                                onClick={() => setDeleteTarget(s)}
                                title="Delete Class"
                                className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
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
            <ClassSectionModal
                initialData={editingSection || viewingSection}
                gradeLevels={gradeLevels}
                teachers={teachers}
                readOnly={!!viewingSection}
                onClose={() => setModalOpen(false)}
                onSaved={handleSaved}
            />
        )}

        {/* CONFIRMATION DIALOG */}
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