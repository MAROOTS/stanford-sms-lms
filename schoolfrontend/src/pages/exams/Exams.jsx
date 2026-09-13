import { useState, useEffect, useCallback } from 'react';
import {
    Plus,
    Search,
    Calendar,
    Edit3,
    Trash2,
    Eye,
    BookOpen,
    Users,
    RefreshCw,
    AlertCircle,
    FileText,
    Filter
} from 'lucide-react';
import axiosClient from '../../api/axiosClient';
import ExamModal from './ExamModal';

export default function Exams() {
    // Data States
    const [exams, setExams] = useState([]);
    const [terms, setTerms] = useState([]);
    const [classSections, setClassSections] = useState([]);
    const [subjects, setSubjects] = useState([]);

    // UI & Loading States
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedTermFilter, setSelectedTermFilter] = useState('');

    // Modal Control State
    const [modalConfig, setModalConfig] = useState({
        isOpen: false,
        mode: 'create', // 'create' | 'edit' | 'view'
        initialData: null,
    });

    // Delete Confirmation Modal State
    const [deleteModal, setDeleteModal] = useState({
        isOpen: false,
        examId: null,
        examName: '',
        isDeleting: false,
    });

    // Fetch All Required Page Data
    const fetchData = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const [examsRes, termsRes, classesRes, subjectsRes] = await Promise.allSettled([
                axiosClient.get('/exams'),
                axiosClient.get('/terms'),
                axiosClient.get('/class-sections'),
                axiosClient.get('/subjects'),
            ]);

            if (examsRes.status === 'fulfilled') {
                setExams(Array.isArray(examsRes.value.data) ? examsRes.value.data : []);
            } else {
                throw new Error(examsRes.reason?.response?.data?.message || 'Failed to load exams.');
            }

            if (termsRes.status === 'fulfilled') {
                setTerms(Array.isArray(termsRes.value.data) ? termsRes.value.data : []);
            }

            if (classesRes.status === 'fulfilled') {
                setClassSections(Array.isArray(classesRes.value.data) ? classesRes.value.data : []);
            }

            if (subjectsRes.status === 'fulfilled') {
                setSubjects(Array.isArray(subjectsRes.value.data) ? subjectsRes.value.data : []);
            }
        } catch (err) {
            setError(err.message || 'An error occurred while loading page data.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Handlers for Opening Modal
    const handleOpenCreate = () => {
        setModalConfig({
            isOpen: true,
            mode: 'create',
            initialData: null,
        });
    };

    const handleOpenEdit = (exam) => {
        setModalConfig({
            isOpen: true,
            mode: 'edit',
            initialData: exam,
        });
    };

    const handleOpenView = (exam) => {
        setModalConfig({
            isOpen: true,
            mode: 'view',
            initialData: exam,
        });
    };

    const handleCloseModal = () => {
        setModalConfig({
            isOpen: false,
            mode: 'create',
            initialData: null,
        });
    };

    const handleExamSaved = () => {
        handleCloseModal();
        fetchData();
    };

    // Delete Handlers
    const handleConfirmDelete = (exam) => {
        setDeleteModal({
            isOpen: true,
            examId: exam.id,
            examName: exam.name,
            isDeleting: false,
        });
    };

    const executeDelete = async () => {
        if (!deleteModal.examId) return;

        setDeleteModal((prev) => ({ ...prev, isDeleting: true }));
        try {
            await axiosClient.delete(`/exams/${deleteModal.examId}`);
            setDeleteModal({ isOpen: false, examId: null, examName: '', isDeleting: false });
            fetchData();
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to delete the exam record.');
            setDeleteModal((prev) => ({ ...prev, isDeleting: false }));
        }
    };

    // Filter Logic
    const filteredExams = exams.filter((exam) => {
        const matchesSearch =
            (exam.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (exam.examType || '').toLowerCase().includes(searchTerm.toLowerCase());

        const matchesTerm = selectedTermFilter
            ? String(exam.termId || exam.term?.id) === String(selectedTermFilter)
            : true;

        return matchesSearch && matchesTerm;
    });

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">

            {/* PAGE HEADER */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Examinations</h1>
                    <p className="text-sm text-slate-500 mt-1">
                        Manage academic exams, assign target classes, and map relevant curriculum subjects.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={fetchData}
                        disabled={loading}
                        className="p-2.5 rounded-xl border border-slate-200 bg-white text-slate-600 hover:text-navy-900 hover:border-slate-300 transition-colors shadow-xs"
                        title="Refresh list"
                    >
                        <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                    </button>
                    <button
                        onClick={handleOpenCreate}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-navy-900 hover:bg-navy-800 shadow-sm transition-all"
                    >
                        <Plus size={18} />
                        Schedule Exam
                    </button>
                </div>
            </div>

            {/* CONTROLS & FILTER BAR */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 bg-white border border-slate-200 rounded-2xl shadow-xs">

                {/* Search Field */}
                <div className="relative w-full sm:w-80">
                    <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search exams by name or type..."
                        className="w-full pl-10 pr-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-navy-900/10 focus:border-navy-900 bg-slate-50/50"
                    />
                </div>

                {/* Term Filter */}
                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <Filter size={16} className="text-slate-400 shrink-0" />
                    <select
                        value={selectedTermFilter}
                        onChange={(e) => setSelectedTermFilter(e.target.value)}
                        className="w-full sm:w-48 py-2 px-3 text-sm rounded-xl border border-slate-200 bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-navy-900/10 focus:border-navy-900"
                    >
                        <option value="">All Terms</option>
                        {terms.map((term) => (
                            <option key={term.id} value={term.id}>
                                {term.name}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* ERROR DISPLAY */}
            {error && (
                <div className="flex items-center gap-3 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm font-medium">
                    <AlertCircle size={20} className="shrink-0" />
                    <p className="flex-1">{error}</p>
                    <button
                        onClick={fetchData}
                        className="underline hover:no-underline font-semibold"
                    >
                        Retry
                    </button>
                </div>
            )}

            {/* EXAMS GRID / LIST */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div
                            key={i}
                            className="h-48 rounded-2xl bg-slate-100 border border-slate-200 animate-pulse"
                        />
                    ))}
                </div>
            ) : filteredExams.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredExams.map((exam) => {
                        const classesCount = exam.classSections?.length || exam.classSectionIds?.length || 0;
                        const subjectsCount = exam.subjects?.length || exam.subjectIds?.length || 0;
                        const termName = exam.term?.name || terms.find((t) => t.id === exam.termId)?.name || 'No Term';

                        return (
                            <div
                                key={exam.id}
                                className="flex flex-col justify-between p-5 bg-white border border-slate-200 rounded-2xl shadow-xs hover:border-slate-300 transition-all group"
                            >
                                <div>
                                    {/* Exam Badges */}
                                    <div className="flex items-center justify-between gap-2 mb-3">
                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700">
                                            <Calendar size={12} />
                                            {termName}
                                        </span>
                                        {exam.examType && (
                                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-100">
                                                <FileText size={12} />
                                                {exam.examType}
                                            </span>
                                        )}
                                    </div>

                                    {/* Title */}
                                    <h3 className="text-base font-bold text-slate-900 group-hover:text-navy-900 transition-colors line-clamp-1">
                                        {exam.name}
                                    </h3>

                                    {/* Stats Meta */}
                                    <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-slate-100 text-xs text-slate-600">
                                        <div className="flex items-center gap-2">
                                            <Users size={14} className="text-slate-400" />
                                            <span>{classesCount} {classesCount === 1 ? 'Class' : 'Classes'}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <BookOpen size={14} className="text-slate-400" />
                                            <span>{subjectsCount} {subjectsCount === 1 ? 'Subject' : 'Subjects'}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex items-center justify-end gap-1.5 mt-5 pt-3 border-t border-slate-100">
                                    <button
                                        onClick={() => handleOpenView(exam)}
                                        className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
                                        title="View Exam Details"
                                    >
                                        <Eye size={16} />
                                    </button>
                                    <button
                                        onClick={() => handleOpenEdit(exam)}
                                        className="p-2 rounded-xl text-slate-500 hover:text-navy-900 hover:bg-slate-100 transition-colors"
                                        title="Edit Exam"
                                    >
                                        <Edit3 size={16} />
                                    </button>
                                    <button
                                        onClick={() => handleConfirmDelete(exam)}
                                        className="p-2 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                                        title="Delete Exam"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                /* EMPTY STATE */
                <div className="flex flex-col items-center justify-center py-16 px-4 bg-white border border-slate-200 rounded-2xl text-center">
                    <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
                        <FileText size={24} />
                    </div>
                    <h3 className="text-sm font-bold text-slate-900">No exams found</h3>
                    <p className="text-xs text-slate-500 max-w-sm mt-1 mb-4">
                        {searchTerm || selectedTermFilter
                            ? 'No examination records match your selected filter criteria.'
                            : 'Get started by creating your first scheduled examination.'}
                    </p>
                    {!searchTerm && !selectedTermFilter && (
                        <button
                            onClick={handleOpenCreate}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-navy-900 hover:bg-navy-800 transition-colors"
                        >
                            <Plus size={14} />
                            Schedule First Exam
                        </button>
                    )}
                </div>
            )}

            {/* EXAM FORM & DETAILS MODAL */}
            {modalConfig.isOpen && (
                <ExamModal
                    readOnly={modalConfig.mode === 'view'}
                    initialData={modalConfig.initialData}
                    terms={terms}
                    classSections={classSections}
                    subjects={subjects}
                    onClose={handleCloseModal}
                    onSaved={handleExamSaved}
                />
            )}

            {/* DELETE CONFIRMATION DIALOG */}
            {deleteModal.isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
                    <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 border border-slate-200 animate-in zoom-in-95 duration-200">
                        <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mb-4">
                            <Trash2 size={20} />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900">Delete Exam</h3>
                        <p className="text-xs text-slate-500 mt-1">
                            Are you sure you want to delete <span className="font-semibold text-slate-800">"{deleteModal.examName}"</span>? This action cannot be undone and will remove all linked subject configurations.
                        </p>

                        <div className="flex items-center justify-end gap-3 mt-6">
                            <button
                                type="button"
                                disabled={deleteModal.isDeleting}
                                onClick={() => setDeleteModal({ isOpen: false, examId: null, examName: '', isDeleting: false })}
                                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                disabled={deleteModal.isDeleting}
                                onClick={executeDelete}
                                className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 transition-colors disabled:opacity-50"
                            >
                                {deleteModal.isDeleting ? 'Deleting...' : 'Confirm Delete'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}