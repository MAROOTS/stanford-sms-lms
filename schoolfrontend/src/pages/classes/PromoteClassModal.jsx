import { useEffect, useMemo, useState } from 'react';
import {
    X,
    ArrowRightLeft,
    ArrowRight,
    Users,
    GraduationCap,
    CheckCircle2,
    AlertCircle,
    Loader2,
} from 'lucide-react';
import axiosClient from '../../api/axiosClient';

export default function PromoteClassModal({ sections, onClose, onDone }) {
    const [fromId, setFromId] = useState('');
    const [toId, setToId] = useState('');
    const [students, setStudents] = useState([]);
    const [selected, setSelected] = useState([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const fromSection = useMemo(
        () => sections.find((s) => String(s.id) === String(fromId)),
        [sections, fromId]
    );

    const toSection = useMemo(
        () => sections.find((s) => String(s.id) === String(toId)),
        [sections, toId]
    );

    const destinations = useMemo(
        () => sections.filter((s) => String(s.id) !== String(fromId)),
        [sections, fromId]
    );

    useEffect(() => {
        setStudents([]);
        setSelected([]);
        setError('');

        if (!fromId) return;

        setLoading(true);

        axiosClient
            .get('/students', { params: { classSectionId: fromId } })
            .then(({ data }) => {
                const list = Array.isArray(data) ? data : [];
                setStudents(list);
                setSelected(list.map((s) => s.id));
            })
            .catch(() => setError('Could not load students in this class'))
            .finally(() => setLoading(false));
    }, [fromId]);

    const toggle = (id) => {
        setSelected((prev) =>
            prev.includes(id)
                ? prev.filter((x) => x !== id)
                : [...prev, id]
        );
    };

    const toggleAll = () => {
        if (selected.length === students.length) {
            setSelected([]);
        } else {
            setSelected(students.map((s) => s.id));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!fromId) {
            return setError('Choose the class they are leaving');
        }

        if (selected.length === 0) {
            return setError('Select at least one student');
        }

        setSaving(true);
        setError('');

        try {
            const { data } = await axiosClient.post('/students/promote', {
                fromClassSectionId: Number(fromId),
                toClassSectionId: toId ? Number(toId) : null,
                studentIds: selected,
            });

            onDone(data);
        } catch (err) {
            setError(
                err.response?.data?.message || 'Promotion failed'
            );
        } finally {
            setSaving(false);
        }
    };

    const allSelected =
        students.length > 0 && selected.length === students.length;

    const someSelected =
        selected.length > 0 && selected.length < students.length;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-4 py-6 backdrop-blur-sm"
            role="dialog"
            aria-modal="true"
            aria-labelledby="promote-class-title"
        >
            <div className="relative flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl bg-white shadow-[0_30px_100px_-20px_rgba(15,23,42,0.4)] ring-1 ring-black/5">

                {/* HEADER */}
                <div className="border-b border-slate-100 bg-gradient-to-br from-slate-50 via-white to-white px-6 py-5 sm:px-7">
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-4">
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-navy-900 text-white shadow-sm">
                                <ArrowRightLeft size={21} />
                            </div>

                            <div>
                                <h2
                                    id="promote-class-title"
                                    className="text-xl font-bold tracking-tight text-slate-900"
                                >
                                    Promote students
                                </h2>

                                <p className="mt-1 text-sm leading-6 text-slate-500">
                                    Move selected students from one class to another
                                    for the next academic stage.
                                </p>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={onClose}
                            disabled={saving}
                            aria-label="Close promotion dialog"
                            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            <X size={19} />
                        </button>
                    </div>
                </div>

                {/* BODY */}
                <div className="overflow-y-auto px-6 py-6 sm:px-7">
                    {/* MOVEMENT PREVIEW */}
                    <div className="mb-6 rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:p-5">
                        <div className="mb-3 flex items-center justify-between">
                            <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">
                                Promotion path
                            </p>

                            <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-500 ring-1 ring-slate-200">
                                <Users size={13} />
                                {selected.length} selected
                            </span>
                        </div>

                        <div className="grid items-stretch gap-3 md:grid-cols-[1fr_auto_1fr] md:items-center">
                            {/* FROM */}
                            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                                        <GraduationCap size={18} />
                                    </div>

                                    <div className="min-w-0">
                                        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                                            From
                                        </p>

                                        <p className="mt-1 truncate text-sm font-bold text-slate-900">
                                            {fromSection
                                                ? `${fromSection.gradeLevelName || 'Grade'} — ${fromSection.name}`
                                                : 'Select current class'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="hidden h-10 w-10 items-center justify-center rounded-full bg-navy-900 text-white shadow-sm md:flex">
                                <ArrowRight size={17} />
                            </div>

                            {/* TO */}
                            <div
                                className={`rounded-2xl border p-4 shadow-sm transition ${
                                    toSection
                                        ? 'border-teal-200 bg-teal-50/60'
                                        : 'border-slate-200 bg-white'
                                }`}
                            >
                                <div className="flex items-center gap-3">
                                    <div
                                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                                            toSection
                                                ? 'bg-teal-100 text-teal-700'
                                                : 'bg-slate-100 text-slate-500'
                                        }`}
                                    >
                                        <GraduationCap size={18} />
                                    </div>

                                    <div className="min-w-0">
                                        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                                            To
                                        </p>

                                        <p
                                            className={`mt-1 truncate text-sm font-bold ${
                                                toSection
                                                    ? 'text-teal-900'
                                                    : 'text-slate-500'
                                            }`}
                                        >
                                            {toSection
                                                ? `${toSection.gradeLevelName || 'Grade'} — ${toSection.name}`
                                                : 'Completed / left school'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* CLASS SELECTION */}
                        <div className="grid gap-5 md:grid-cols-2">
                            {/* FROM */}
                            <div>
                                <label
                                    htmlFor="promote-from"
                                    className="mb-2 block text-sm font-semibold text-slate-800"
                                >
                                    Current class
                                </label>

                                <select
                                    id="promote-from"
                                    required
                                    value={fromId}
                                    onChange={(e) => setFromId(e.target.value)}
                                    disabled={saving}
                                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm font-medium text-slate-800 shadow-sm outline-none transition focus:border-navy-900 focus:ring-4 focus:ring-navy-900/10 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400"
                                >
                                    <option value="">
                                        Select current class
                                    </option>

                                    {sections.map((s) => (
                                        <option key={s.id} value={s.id}>
                                            {s.gradeLevelName} — {s.name}
                                        </option>
                                    ))}
                                </select>

                                <p className="mt-1.5 text-xs text-slate-400">
                                    Choose the class the students currently belong to.
                                </p>
                            </div>

                            {/* TO */}
                            <div>
                                <label
                                    htmlFor="promote-to"
                                    className="mb-2 block text-sm font-semibold text-slate-800"
                                >
                                    Destination
                                </label>

                                <select
                                    id="promote-to"
                                    value={toId}
                                    onChange={(e) => setToId(e.target.value)}
                                    disabled={saving || !fromId}
                                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm font-medium text-slate-800 shadow-sm outline-none transition focus:border-navy-900 focus:ring-4 focus:ring-navy-900/10 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400"
                                >
                                    <option value="">
                                        Completed / left school
                                    </option>

                                    {destinations.map((s) => (
                                        <option key={s.id} value={s.id}>
                                            {s.gradeLevelName} — {s.name}
                                        </option>
                                    ))}
                                </select>

                                <p className="mt-1.5 text-xs text-slate-400">
                                    {fromId
                                        ? 'Leave this empty for students who completed or left the school.'
                                        : 'Select a current class first.'}
                                </p>
                            </div>
                        </div>

                        {/* STUDENT SELECTION */}
                        <div>
                            <div className="mb-3 flex items-center justify-between gap-3">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-800">
                                        Students
                                    </label>

                                    <p className="mt-0.5 text-xs text-slate-400">
                                        {fromSection
                                            ? `Students currently in ${fromSection.name}`
                                            : 'Select a class to load students'}
                                    </p>
                                </div>

                                {students.length > 0 && (
                                    <button
                                        type="button"
                                        onClick={toggleAll}
                                        disabled={saving}
                                        className="rounded-lg px-3 py-2 text-xs font-bold text-navy-900 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        {allSelected ? 'Clear all' : 'Select all'}
                                    </button>
                                )}
                            </div>

                            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                                {/* STUDENT LIST HEADER */}
                                {students.length > 0 && (
                                    <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-4 py-3">
                                        <label className="flex cursor-pointer items-center gap-3">
                                            <input
                                                type="checkbox"
                                                checked={allSelected}
                                                ref={(el) => {
                                                    if (el) {
                                                        el.indeterminate = someSelected;
                                                    }
                                                }}
                                                onChange={toggleAll}
                                                disabled={saving}
                                                className="h-4 w-4 rounded border-slate-300 text-navy-900 accent-slate-900 focus:ring-navy-900/20"
                                            />

                                            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                                                Select students
                                            </span>
                                        </label>

                                        <span className="text-xs font-semibold text-slate-400">
                                            {selected.length} / {students.length}
                                        </span>
                                    </div>
                                )}

                                {/* LOADING */}
                                {loading && (
                                    <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
                                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100">
                                            <Loader2
                                                size={20}
                                                className="animate-spin text-navy-900"
                                            />
                                        </div>

                                        <p className="mt-4 text-sm font-semibold text-slate-700">
                                            Loading students
                                        </p>

                                        <p className="mt-1 text-xs text-slate-400">
                                            Getting the students in this class...
                                        </p>
                                    </div>
                                )}

                                {/* NO STUDENTS */}
                                {!loading && fromId && students.length === 0 && (
                                    <div className="px-6 py-12 text-center">
                                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                                            <Users size={22} />
                                        </div>

                                        <p className="mt-4 text-sm font-semibold text-slate-700">
                                            No students in this class
                                        </p>

                                        <p className="mx-auto mt-1 max-w-sm text-xs leading-5 text-slate-400">
                                            There are currently no students assigned to this
                                            class.
                                        </p>
                                    </div>
                                )}

                                {/* BEFORE CLASS SELECTION */}
                                {!loading && !fromId && (
                                    <div className="px-6 py-12 text-center">
                                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                                            <GraduationCap size={22} />
                                        </div>

                                        <p className="mt-4 text-sm font-semibold text-slate-700">
                                            Select a class
                                        </p>

                                        <p className="mx-auto mt-1 max-w-sm text-xs leading-5 text-slate-400">
                                            Choose the current class above to see its
                                            students.
                                        </p>
                                    </div>
                                )}

                                {/* STUDENTS */}
                                {!loading && students.length > 0 && (
                                    <div className="max-h-64 overflow-y-auto">
                                        {students.map((s, index) => {
                                            const isSelected = selected.includes(s.id);

                                            return (
                                                <label
                                                    key={s.id}
                                                    className={`flex cursor-pointer items-center gap-3 border-b border-slate-100 px-4 py-3.5 transition last:border-b-0 ${
                                                        isSelected
                                                            ? 'bg-teal-50/50'
                                                            : 'bg-white hover:bg-slate-50'
                                                    }`}
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={isSelected}
                                                        onChange={() => toggle(s.id)}
                                                        disabled={saving}
                                                        className="h-4 w-4 rounded border-slate-300 text-navy-900 accent-slate-900 focus:ring-navy-900/20"
                                                    />

                                                    <div
                                                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-xs font-bold ${
                                                            isSelected
                                                                ? 'bg-teal-100 text-teal-700'
                                                                : 'bg-slate-100 text-slate-600'
                                                        }`}
                                                    >
                                                        {s.firstName?.[0]}
                                                        {s.lastName?.[0]}
                                                    </div>

                                                    <div className="min-w-0 flex-1">
                                                        <p className="truncate text-sm font-semibold text-slate-800">
                                                            {s.firstName} {s.lastName}
                                                        </p>

                                                        <p className="mt-0.5 truncate text-xs text-slate-400">
                                                            {s.admissionNumber ||
                                                                `Student ${index + 1}`}
                                                        </p>
                                                    </div>

                                                    {isSelected && (
                                                        <CheckCircle2
                                                            size={17}
                                                            className="shrink-0 text-teal-600"
                                                        />
                                                    )}
                                                </label>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* INFO */}
                        <div className="flex gap-3 rounded-2xl border border-amber-100 bg-amber-50/70 px-4 py-4">
                            <AlertCircle
                                size={18}
                                className="mt-0.5 shrink-0 text-amber-600"
                            />

                            <div>
                                <p className="text-sm font-semibold text-amber-900">
                                    Promotion note
                                </p>

                                <p className="mt-1 text-xs leading-5 text-amber-800/80">
                                    Only the students you select will be moved.
                                    Students you leave unchecked will remain in
                                    their current class.
                                </p>
                            </div>
                        </div>

                        {/* ERROR */}
                        {error && (
                            <div
                                className="flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3.5"
                                role="alert"
                            >
                                <AlertCircle
                                    size={18}
                                    className="mt-0.5 shrink-0 text-rose-600"
                                />

                                <p className="text-sm font-medium leading-6 text-rose-700">
                                    {error}
                                </p>
                            </div>
                        )}

                        {/* ACTIONS */}
                        <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
                            <button
                                type="button"
                                onClick={onClose}
                                disabled={saving}
                                className="w-full rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                            >
                                Cancel
                            </button>

                            <button
                                type="submit"
                                disabled={
                                    saving ||
                                    loading ||
                                    !fromId ||
                                    selected.length === 0
                                }
                                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-navy-900 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-navy-800 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                            >
                                {saving ? (
                                    <>
                                        <Loader2
                                            size={17}
                                            className="animate-spin"
                                        />
                                        Moving students...
                                    </>
                                ) : (
                                    <>
                                        <ArrowRightLeft size={17} />
                                        Move {selected.length || ''}
                                        {selected.length === 1
                                            ? ' student'
                                            : ' students'}
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}