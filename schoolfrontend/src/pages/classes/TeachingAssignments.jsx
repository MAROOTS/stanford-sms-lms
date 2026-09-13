import { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import {
    Plus,
    BookOpen,
    Trash2,
    AlertTriangle,
    ChevronDown,
    RotateCcw,
    Search,
    Check,
    X
} from 'lucide-react';
import axiosClient from '../../api/axiosClient';
import ConfirmDialog from '../../components/shared/ConfirmDialog';
import EmptyState from '../../components/shared/EmptyState';
import { TableSkeleton } from '../../components/shared/LoadingSkeleton';
import { useToast } from '../../context/useToast';

// Safe array parser for backend responses
const extractArray = (data) => (Array.isArray(data) ? data : data?.content || []);

/* ==========================================================================
   REUSABLE SEARCHABLE COMBOBOX COMPONENT
   ========================================================================== */
function Combobox({
                      options = [],
                      value,
                      onChange,
                      placeholder = 'Select option...',
                      disabled = false,
                      className = '',
                      compact = false
                  }) {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState('');
    const containerRef = useRef(null);
    const searchInputRef = useRef(null);

    // Get current option object regardless of string vs number ID type
    const selectedOption = useMemo(
        () => options.find((opt) => String(opt.id) === String(value)),
        [options, value]
    );

    // Close dropdown on outside click
    useEffect(() => {
        function handleClickOutside(e) {
            if (containerRef.current && !containerRef.current.contains(e.target)) {
                setIsOpen(false);
                setSearch('');
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Focus input when popover opens
    useEffect(() => {
        if (isOpen && searchInputRef.current) {
            searchInputRef.current.focus();
        }
    }, [isOpen]);

    // Filtered options based on user search term
    const filteredOptions = useMemo(() => {
        if (!search.trim()) return options;
        const query = search.toLowerCase();
        return options.filter((opt) => opt.label.toLowerCase().includes(query));
    }, [options, search]);

    const handleSelect = (optionId) => {
        onChange(optionId);
        setIsOpen(false);
        setSearch('');
    };

    return (
        <div ref={containerRef} className={`relative w-full ${className}`}>
            <button
                type="button"
                disabled={disabled}
                onClick={() => setIsOpen((prev) => !prev)}
                className={`w-full flex items-center justify-between text-left transition-all cursor-pointer ${
                    compact
                        ? 'px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-white border border-slate-200 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-navy-900/20 text-xs font-semibold text-slate-800'
                        : 'px-4 py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-navy-900 focus:border-transparent text-sm font-medium text-slate-700'
                } ${disabled ? 'opacity-50 pointer-events-none' : ''}`}
            >
                <span className={selectedOption ? 'text-slate-900 font-medium truncate' : 'text-slate-400 truncate'}>
                    {selectedOption ? selectedOption.label : placeholder}
                </span>
                <ChevronDown
                    size={compact ? 14 : 16}
                    className={`shrink-0 ml-2 text-slate-400 transition-transform duration-200 ${
                        isOpen ? 'rotate-180 text-navy-900' : ''
                    }`}
                />
            </button>

            {isOpen && (
                <div className="absolute left-0 z-50 mt-1 w-full bg-white rounded-xl border border-slate-200 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 min-w-[220px]">
                    <div className="p-2 border-b border-slate-100 flex items-center gap-2 bg-slate-50/50">
                        <Search size={14} className="text-slate-400 shrink-0 ml-1" />
                        <input
                            ref={searchInputRef}
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Type to search..."
                            className="w-full bg-transparent text-xs sm:text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none"
                        />
                        {search && (
                            <button
                                type="button"
                                onClick={() => setSearch('')}
                                className="p-0.5 rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-600 transition-colors"
                            >
                                <X size={12} />
                            </button>
                        )}
                    </div>

                    <ul className="max-h-56 overflow-y-auto py-1 text-xs sm:text-sm custom-scrollbar">
                        {filteredOptions.length === 0 ? (
                            <li className="px-3 py-2.5 text-xs text-slate-400 text-center font-medium">
                                No results found
                            </li>
                        ) : (
                            filteredOptions.map((opt) => {
                                const isSelected = String(opt.id) === String(value);
                                return (
                                    <li
                                        key={opt.id}
                                        onClick={() => handleSelect(opt.id)}
                                        className={`px-3 py-2 flex items-center justify-between cursor-pointer transition-colors ${
                                            isSelected
                                                ? 'bg-slate-100 font-semibold text-navy-900'
                                                : 'hover:bg-slate-50 text-slate-700'
                                        }`}
                                    >
                                        <span className="truncate">{opt.label}</span>
                                        {isSelected && <Check size={14} className="text-navy-900 shrink-0 ml-2" />}
                                    </li>
                                );
                            })
                        )}
                    </ul>
                </div>
            )}
        </div>
    );
}

/* ==========================================================================
   MAIN PAGE COMPONENT
   ========================================================================== */
export default function TeachingAssignments() {
    const [rows, setRows] = useState([]);
    const [teachers, setTeachers] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [classes, setClasses] = useState([]);

    const [teacherId, setTeacherId] = useState('');
    const [subjectId, setSubjectId] = useState('');
    const [classSectionId, setClassSectionId] = useState('');

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [deleteTarget, setDeleteTarget] = useState(null);
    const toast = useToast();

    const loadAll = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const [a, t, s, c] = await Promise.all([
                axiosClient.get('/teaching-assignments'),
                axiosClient.get('/teachers'),
                axiosClient.get('/subjects'),
                axiosClient.get('/class-sections'),
            ]);
            setRows(extractArray(a.data));
            setTeachers(extractArray(t.data));
            setSubjects(extractArray(s.data));
            setClasses(extractArray(c.data));
        } catch {
            setError('Could not load teaching assignments. Please try again.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        let isMounted = true;
        loadAll().catch(() => {
            if (isMounted) setError('Could not load teaching assignments.');
        });
        return () => {
            isMounted = false;
        };
    }, [loadAll]);

    // Format options array for Comboboxes
    const teacherOptions = useMemo(
        () => teachers.map((t) => ({ id: t.id, label: `${t.firstName} ${t.lastName}` })),
        [teachers]
    );

    const subjectOptions = useMemo(
        () => subjects.map((s) => ({ id: s.id, label: s.name })),
        [subjects]
    );

    const classOptions = useMemo(
        () => classes.map((c) => ({ id: c.id, label: c.name })),
        [classes]
    );

    const handleAdd = async (e) => {
        e.preventDefault();
        if (!teacherId || !subjectId || !classSectionId) return;

        setSaving(true);
        setError('');
        try {
            await axiosClient.post('/teaching-assignments', {
                teacherId: Number(teacherId),
                subjectId: Number(subjectId),
                classSectionId: Number(classSectionId),
            });
            setTeacherId('');
            setSubjectId('');
            setClassSectionId('');
            toast.success('Assignment saved successfully.');
            await loadAll();
        } catch (err) {
            setError(err.response?.data?.message || 'Could not save — that class may already have a teacher for this subject');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteTarget) return;
        const id = deleteTarget.id;
        setDeleteTarget(null);
        try {
            await axiosClient.delete(`/teaching-assignments/${id}`);
            setRows((prev) => prev.filter((r) => r.id !== id));
            toast.success('Assignment removed successfully.');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Could not delete assignment.');
        }
    };

    const handleChangeTeacher = async (id, newTeacherId) => {
        const parsedTeacherId = Number(newTeacherId);
        if (!parsedTeacherId) return;

        try {
            const { data } = await axiosClient.put(`/teaching-assignments/${id}`, { teacherId: parsedTeacherId });

            setRows((prev) =>
                prev.map((row) => {
                    if (row.id !== id) return row;
                    const matchedTeacher = teachers.find((t) => t.id === parsedTeacherId);
                    const teacherName = matchedTeacher
                        ? `${matchedTeacher.firstName} ${matchedTeacher.lastName}`
                        : row.teacherName;

                    return {
                        ...row,
                        ...data,
                        teacherId: parsedTeacherId,
                        teacherName,
                    };
                })
            );
            toast.success('Teacher updated successfully.');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Could not change teacher');
        }
    };

    return (
        <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 animate-in fade-in duration-500">
            {/* HEADER */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">Teaching Assignments</h1>
                <p className="text-sm text-slate-500 mt-1.5">
                    Manage who teaches which subject to which class. This controls who can enter marks.
                </p>
            </div>

            {/* ERROR ALERT FOR ACTIONS */}
            {error && !loading && rows.length > 0 && (
                <div className="mb-6 flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-rose-700 shadow-sm animate-in fade-in">
                    <AlertTriangle size={20} className="shrink-0 mt-0.5" />
                    <div>
                        <h4 className="font-semibold text-sm">Action Failed</h4>
                        <p className="text-sm mt-1 opacity-90">{error}</p>
                    </div>
                </div>
            )}

            {/* ASSIGNMENT FORM */}
            <form
                onSubmit={handleAdd}
                className="bg-white rounded-2xl border border-slate-200 p-6 mb-8 shadow-sm flex flex-col md:flex-row gap-4 items-end"
            >
                <div className="w-full flex-1">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                        Teacher
                    </label>
                    <Combobox
                        options={teacherOptions}
                        value={teacherId}
                        onChange={setTeacherId}
                        placeholder="Select a teacher..."
                    />
                </div>

                <div className="w-full flex-1">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                        Subject
                    </label>
                    <Combobox
                        options={subjectOptions}
                        value={subjectId}
                        onChange={setSubjectId}
                        placeholder="Select a subject..."
                    />
                </div>

                <div className="w-full flex-1">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                        Class
                    </label>
                    <Combobox
                        options={classOptions}
                        value={classSectionId}
                        onChange={setClassSectionId}
                        placeholder="Select a class..."
                    />
                </div>

                <button
                    type="submit"
                    disabled={saving || !teacherId || !subjectId || !classSectionId}
                    className="w-full md:w-auto h-11 flex items-center justify-center gap-2 bg-navy-900 hover:bg-navy-800 text-white shadow-sm text-sm font-semibold px-6 py-2.5 rounded-xl transition-all active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
                >
                    <Plus size={18} /> {saving ? 'Assigning...' : 'Assign'}
                </button>
            </form>

            {/* LOADING STATE */}
            {loading && <TableSkeleton columns={4} rows={5} />}

            {/* FETCH ERROR STATE */}
            {error && !loading && rows.length === 0 && (
                <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 text-center shadow-sm mb-6">
                    <p className="text-rose-700 text-sm font-medium mb-3">{error}</p>
                    <button
                        type="button"
                        onClick={loadAll}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-800 hover:text-rose-900 underline underline-offset-4 cursor-pointer"
                    >
                        <RotateCcw size={14} /> Try again
                    </button>
                </div>
            )}

            {/* EMPTY STATE */}
            {!loading && !error && rows.length === 0 && (
                <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
                    <EmptyState
                        icon={BookOpen}
                        title="No assignments yet"
                        description="Assign a teacher to a subject and class above to allow them to enter marks."
                    />
                </div>
            )}

            {/* DATA TABLE */}
            {!loading && rows.length > 0 && (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-visible">
                    <div className="overflow-x-auto custom-scrollbar">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-slate-50 border-b border-slate-200">
                            <tr className="text-[11px] font-bold tracking-wider text-slate-500 uppercase">
                                <th className="px-6 py-4 w-1/3">Teacher</th>
                                <th className="px-6 py-4 w-1/4">Subject</th>
                                <th className="px-6 py-4 w-1/4">Class</th>
                                <th className="px-6 py-4 text-right w-32">Action</th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                            {rows.map((r) => (
                                <tr key={r.id} className="group bg-white hover:bg-slate-50/80 transition-colors">
                                    <td className="px-6 py-3 relative">
                                        <div className="w-full max-w-[240px]">
                                            <Combobox
                                                compact
                                                options={teacherOptions}
                                                value={r.teacherId}
                                                onChange={(newId) => handleChangeTeacher(r.id, newId)}
                                                placeholder="Select teacher..."
                                            />
                                        </div>
                                    </td>
                                    <td className="px-6 py-3">
                                        <span className="font-medium text-slate-800">{r.subjectName}</span>
                                    </td>
                                    <td className="px-6 py-3">
        <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 text-xs font-semibold tracking-wide border border-slate-200/60">
            {r.classSectionName}
        </span>
                                    </td>
                                    <td className="px-6 py-3 text-right">
                                        <button
                                            type="button"
                                            onClick={() => setDeleteTarget(r)}
                                            title="Remove Assignment"
                                            className="p-2 rounded-lg text-slate-400 opacity-60 group-hover:opacity-100 hover:text-rose-600 hover:bg-rose-50 transition-all cursor-pointer"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* CONFIRMATION DIALOG */}
            <ConfirmDialog
                open={!!deleteTarget}
                title="Remove Assignment"
                message={
                    deleteTarget ? (
                        <>
                            Are you sure you want to remove <strong className="text-slate-900">{deleteTarget.teacherName}</strong>'s assignment for <strong className="text-slate-900">{deleteTarget.subjectName} / {deleteTarget.classSectionName}</strong>?
                        </>
                    ) : ''
                }
                confirmLabel="Remove"
                variant="danger"
                onConfirm={handleDelete}
                onCancel={() => setDeleteTarget(null)}
            />
        </div>
    );
}