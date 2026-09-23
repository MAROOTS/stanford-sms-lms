import { useEffect, useState, useCallback } from 'react';
import {
    Users,
    Eye,
    Pencil,
    Trash2,
    Unlock,
    KeyRound,
    Upload,
    Filter,
    UserX,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';
import StudentModal from './StudentModal';
import ConfirmDialog from '../../components/shared/ConfirmDialog';
import EmptyState from '../../components/shared/EmptyState';
import { TableSkeleton } from '../../components/shared/LoadingSkeleton';
import { useToast } from '../../context/useToast';
import { useAuth } from "../../context/useAuth.js";
import TempPasswordModal from "../../components/shared/TempPasswordModal";
import { useAccountActions } from "../../hooks/useAccountActions";

const getAvatarStyle = (name) => {
    const colors = [
        'bg-blue-100 text-blue-700',
        'bg-emerald-100 text-emerald-700',
        'bg-violet-100 text-violet-700',
        'bg-amber-100 text-amber-700',
        'bg-pink-100 text-pink-700',
        'bg-rose-100 text-rose-700',
        'bg-indigo-100 text-indigo-700',
        'bg-cyan-100 text-cyan-700',
    ];

    if (!name) return colors[0];

    const charCode = name.charCodeAt(0);
    return colors[charCode % colors.length];
};

export default function Students() {
    const [students, setStudents] = useState([]);
    const [classSections, setClassSections] = useState([]);
    const [classFilter, setClassFilter] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [modalOpen, setModalOpen] = useState(false);
    const [editingStudent, setEditingStudent] = useState(null);
    const [viewingStudent, setViewingStudent] = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null);

    const toast = useToast();
    const { user } = useAuth();

    const loadAll = useCallback(async (currentClassFilter) => {
        setLoading(true);
        setError('');

        try {
            const [studentsRes, sectionsRes] = await Promise.all([
                axiosClient.get('/students', {
                    params: currentClassFilter
                        ? { classSectionId: currentClassFilter }
                        : {},
                }),
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

    useEffect(() => {
        queueMicrotask(() => loadAll(classFilter));
    }, [classFilter, loadAll]);

    const handleDelete = async () => {
        if (!deleteTarget) return;

        const id = deleteTarget.id;
        const name =
            `${deleteTarget.firstName} ${deleteTarget.lastName}`.trim();

        setDeleteTarget(null);

        try {
            await axiosClient.delete(`/students/${id}`);

            setStudents((prev) =>
                prev.filter((s) => s.id !== id)
            );

            toast.success(`${name} has been deleted.`);
        } catch (err) {
            toast.error(
                err.response?.data?.message ||
                'Could not delete this student.'
            );
        }
    };

    const {
        resetCredentials,
        setResetCredentials,
        handleResetPassword,
        handleUnlock,
    } = useAccountActions(toast, {
        entityLabel: 'student',
    });

    const handleStudentUnlock = async (studentId) => {
        const unlocked = await handleUnlock(studentId);

        if (unlocked) {
            loadAll(classFilter);
        }
    };

    const openEditModal = (student) => {
        setEditingStudent(student);
        setViewingStudent(null);
        setModalOpen(true);
    };

    const openViewModal = (student) => {
        setViewingStudent(student);
        setEditingStudent(null);
        setModalOpen(true);
    };

    const handleSaved = () => {
        setModalOpen(false);
        loadAll(classFilter);
        toast.success('Student saved successfully.');
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 animate-in fade-in duration-500">

            {/* HEADER SECTION */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
                        Students
                    </h1>

                    <p className="text-sm text-slate-500 mt-1">
                        {classFilter
                            ? `Showing students in ${
                                classSections.find(
                                    (c) =>
                                        c.id === Number(classFilter)
                                )?.name || 'selected class'
                            }.`
                            : 'Manage all students enrolled at your school.'}
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">

                    {/* CLASS FILTER */}
                    <div className="relative w-full sm:w-auto">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Filter
                                size={16}
                                className="text-slate-400"
                            />
                        </div>

                        <select
                            value={classFilter}
                            onChange={(e) =>
                                setClassFilter(e.target.value)
                            }
                            className="w-full sm:w-auto pl-10 pr-8 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-navy-900 focus:border-transparent transition-all cursor-pointer appearance-none sm:min-w-[160px]"
                        >
                            <option value="">All Classes</option>

                            {classSections.map((c) => (
                                <option
                                    key={c.id}
                                    value={c.id}
                                >
                                    {c.name} ({c.gradeLevelName})
                                </option>
                            ))}
                        </select>

                        <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
                            <svg
                                className="w-4 h-4 text-slate-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M19 9l-7 7-7-7"
                                />
                            </svg>
                        </div>
                    </div>

                    {user?.role === 'ADMIN' && (
                        <Link
                            to="/students/import"
                            className="flex items-center justify-center gap-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900 shadow-sm text-sm font-semibold px-4 py-2.5 rounded-xl transition-all active:scale-[0.98] w-full sm:w-auto"
                        >
                            <Upload size={16} />
                            Import Data
                        </Link>
                    )}
                </div>
            </div>

            {/* CONTENT AREA */}
            {loading && (
                <TableSkeleton columns={4} rows={6} />
            )}

            {error && !loading && (
                <div className="bg-red-50 border border-red-100 rounded-2xl p-6 sm:p-8 text-center animate-in zoom-in-95">
                    <UserX
                        size={40}
                        className="mx-auto text-red-400 mb-3"
                    />

                    <p className="text-red-700 font-medium mb-3">
                        {error}
                    </p>

                    <button
                        type="button"
                        onClick={() => loadAll(classFilter)}
                        className="text-sm font-bold text-red-700 hover:text-red-900 bg-red-100/50 hover:bg-red-100 px-4 py-2 rounded-lg transition-colors"
                    >
                        Try again
                    </button>
                </div>
            )}

            {!loading &&
                !error &&
                students.length === 0 && (
                    <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm">
                        <EmptyState
                            icon={Users}
                            title={
                                classFilter
                                    ? 'No students in this class'
                                    : 'No students yet'
                            }
                            description={
                                classFilter
                                    ? 'Try selecting a different class from the filter menu, or clear it.'
                                    : user?.role === 'ADMIN'
                                        ? 'Add your first student or run a bulk import to get started.'
                                        : "You don't have any students assigned to your homeroom class yet."
                            }
                        />
                    </div>
                )}

            {!loading &&
                !error &&
                students.length > 0 && (
                    <>
                        {/* MOBILE CARD VIEW */}
                        <div className="grid grid-cols-1 gap-4 md:hidden">
                            {students.map((s) => (
                                <div
                                    key={s.id}
                                    className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-3"
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex items-center gap-3 min-w-0">

                                            {/* AVATAR */}
                                            {s.photoUrl ? (
                                                <img
                                                    src={s.photoUrl}
                                                    alt=""
                                                    className="w-10 h-10 rounded-full object-cover shadow-sm border border-black/5 shrink-0"
                                                />
                                            ) : (
                                                <div
                                                    className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold shadow-sm border border-black/5 shrink-0 ${getAvatarStyle(
                                                        s.firstName
                                                    )}`}
                                                >
                                                    {s.firstName?.[0]}
                                                    {s.lastName?.[0]}
                                                </div>
                                            )}

                                            {/* NAME */}
                                            <div className="flex flex-col min-w-0">
                                                <div className="flex items-center min-w-0">
                                                    <span className="font-semibold text-slate-900 text-base truncate">
                                                        {s.firstName} {s.lastName}
                                                    </span>

                                                    {s.accountLocked && (
                                                        <span className="ml-2 shrink-0 text-[10px] font-semibold uppercase tracking-wide text-amber-800 bg-amber-50 border border-amber-100 rounded px-1.5 py-0.5">
                                                            Locked
                                                        </span>
                                                    )}
                                                </div>

                                                {s.studentId && (
                                                    <span className="text-xs text-slate-400">
                                                        ID: {s.studentId}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {s.classSectionName ? (
                                            <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-teal-50 border border-teal-100 text-teal-700 text-xs font-semibold shrink-0">
                                                {s.classSectionName}
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-500 text-xs font-semibold shrink-0">
                                                Unassigned
                                            </span>
                                        )}
                                    </div>

                                    {s.email && (
                                        <div className="text-xs text-slate-600 bg-slate-50 px-3 py-2 rounded-xl border border-slate-100 truncate">
                                            <span className="font-medium text-slate-400 mr-2">
                                                Email:
                                            </span>
                                            {s.email}
                                        </div>
                                    )}

                                    {/* MOBILE ACTIONS */}
                                    <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-1.5">
                                        <button
                                            type="button"
                                            onClick={() =>
                                                openViewModal(s)
                                            }
                                            title="View Profile"
                                            className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
                                        >
                                            <Eye size={16} />
                                            View
                                        </button>

                                        {user?.role === 'ADMIN' && (
                                            <>
                                                {/* RESET PASSWORD */}
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleResetPassword(
                                                            s.id
                                                        )
                                                    }
                                                    title="Reset Password"
                                                    className="p-2 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-amber-50 bg-slate-50 border border-slate-200/60 transition-colors"
                                                >
                                                    <KeyRound size={16} />
                                                </button>

                                                {/* UNLOCK — ONLY WHEN LOCKED */}
                                                {s.accountLocked && (
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            handleStudentUnlock(
                                                                s.id
                                                            )
                                                        }
                                                        title="Unlock account (too many failed logins)"
                                                        className="p-2 rounded-lg text-amber-600 hover:bg-amber-50 bg-slate-50 border border-amber-100 transition-colors"
                                                    >
                                                        <Unlock size={16} />
                                                    </button>
                                                )}

                                                {/* EDIT */}
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        openEditModal(s)
                                                    }
                                                    title="Edit Student"
                                                    className="p-2 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 bg-slate-50 border border-slate-200/60 transition-colors"
                                                >
                                                    <Pencil size={16} />
                                                </button>

                                                {/* DELETE */}
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setDeleteTarget(s)
                                                    }
                                                    title="Delete Student"
                                                    className="p-2 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 bg-slate-50 border border-slate-200/60 transition-colors"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* DESKTOP TABLE VIEW */}
                        <div className="hidden md:block bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                            <div className="overflow-x-auto custom-scrollbar">
                                <table className="w-full text-sm text-left">

                                    <thead className="bg-slate-50 border-b border-slate-200">
                                    <tr className="text-[11px] font-bold tracking-wider text-slate-500 uppercase">
                                        <th className="px-6 py-4">
                                            Student
                                        </th>

                                        <th className="px-6 py-4 lg:table-cell">
                                            Email
                                        </th>

                                        <th className="px-6 py-4">
                                            Class
                                        </th>

                                        <th className="px-6 py-4 text-right">
                                            Actions
                                        </th>
                                    </tr>
                                    </thead>

                                    <tbody className="divide-y divide-slate-100">
                                    {students.map((s) => (
                                        <tr
                                            key={s.id}
                                            className="group bg-white hover:bg-slate-50/80 transition-colors"
                                        >
                                            {/* STUDENT */}
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">

                                                    {s.photoUrl ? (
                                                        <img
                                                            src={s.photoUrl}
                                                            alt=""
                                                            className="w-9 h-9 rounded-full object-cover shadow-sm border border-black/5 shrink-0"
                                                        />
                                                    ) : (
                                                        <div
                                                            className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shadow-sm border border-black/5 shrink-0 ${getAvatarStyle(
                                                                s.firstName
                                                            )}`}
                                                        >
                                                            {s.firstName?.[0]}
                                                            {s.lastName?.[0]}
                                                        </div>
                                                    )}

                                                    <div className="flex flex-col min-w-0">
                                                        <div className="flex items-center min-w-0">
                                                                <span className="font-semibold text-slate-900 truncate">
                                                                    {s.firstName}{' '}
                                                                    {s.lastName}
                                                                </span>

                                                            {s.accountLocked && (
                                                                <span className="ml-2 shrink-0 text-[10px] font-semibold uppercase tracking-wide text-amber-800 bg-amber-50 border border-amber-100 rounded px-1.5 py-0.5">
                                                                        Locked
                                                                    </span>
                                                            )}
                                                        </div>

                                                        {s.studentId && (
                                                            <span className="text-xs text-slate-400">
                                                                    ID: {s.studentId}
                                                                </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>

                                            {/* EMAIL */}
                                            <td className="px-6 py-4 lg:table-cell">
                                                    <span className="text-slate-600 font-medium">
                                                        {s.email || (
                                                            <span className="text-slate-400 italic font-normal">
                                                                No email
                                                            </span>
                                                        )}
                                                    </span>
                                            </td>

                                            {/* CLASS */}
                                            <td className="px-6 py-4">
                                                {s.classSectionName ? (
                                                    <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-teal-50 border border-teal-100 text-teal-700 text-xs font-semibold">
                                                            {s.classSectionName}
                                                        </span>
                                                ) : (
                                                    <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-500 text-xs font-semibold">
                                                            Unassigned
                                                        </span>
                                                )}
                                            </td>

                                            {/* ACTIONS */}
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-1.5">

                                                    {/* VIEW */}
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            openViewModal(s)
                                                        }
                                                        title="View Profile"
                                                        className="p-2 rounded-lg text-slate-400 hover:text-navy-600 hover:bg-navy-50 transition-colors"
                                                    >
                                                        <Eye size={18} />
                                                    </button>

                                                    {user?.role === 'ADMIN' && (
                                                        <>
                                                            <div className="w-px h-4 bg-slate-200 mx-1"></div>

                                                            {/* RESET PASSWORD */}
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    handleResetPassword(
                                                                        s.id
                                                                    )
                                                                }
                                                                title="Reset Password"
                                                                className="p-2 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                                                            >
                                                                <KeyRound
                                                                    size={18}
                                                                />
                                                            </button>

                                                            {/* UNLOCK — ONLY WHEN LOCKED */}
                                                            {s.accountLocked && (
                                                                <button
                                                                    type="button"
                                                                    onClick={() =>
                                                                        handleStudentUnlock(
                                                                            s.id
                                                                        )
                                                                    }
                                                                    title="Unlock account (too many failed logins)"
                                                                    className="p-2 rounded-lg text-amber-600 hover:bg-amber-50 transition-colors"
                                                                >
                                                                    <Unlock
                                                                        size={18}
                                                                    />
                                                                </button>
                                                            )}

                                                            {/* EDIT */}
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    openEditModal(
                                                                        s
                                                                    )
                                                                }
                                                                title="Edit Student"
                                                                className="p-2 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                                                            >
                                                                <Pencil
                                                                    size={18}
                                                                />
                                                            </button>

                                                            {/* DELETE */}
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    setDeleteTarget(
                                                                        s
                                                                    )
                                                                }
                                                                title="Delete Student"
                                                                className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                                                            >
                                                                <Trash2
                                                                    size={18}
                                                                />
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </>
                )}

            {/* MODALS & DIALOGS */}
            {modalOpen && (
                <StudentModal
                    initialData={editingStudent || viewingStudent}
                    classSections={classSections}
                    readOnly={!!viewingStudent}
                    onClose={() => setModalOpen(false)}
                    onSaved={handleSaved}
                />
            )}

            {resetCredentials && (
                <TempPasswordModal
                    username={resetCredentials.username}
                    temporaryPassword={resetCredentials.temporaryPassword}
                    onClose={() => setResetCredentials(null)}
                />
            )}

            <ConfirmDialog
                open={!!deleteTarget}
                title="Delete Student"
                message={
                    <>
                        Are you sure you want to delete{' '}
                        <strong className="text-slate-900">
                            {deleteTarget?.firstName}{' '}
                            {deleteTarget?.lastName}
                        </strong>
                        ?
                        <br />
                        This action cannot be undone and will remove all their
                        associated data.
                    </>
                }
                confirmLabel="Delete Student"
                variant="danger"
                onConfirm={handleDelete}
                onCancel={() => setDeleteTarget(null)}
            />
        </div>
    );
}