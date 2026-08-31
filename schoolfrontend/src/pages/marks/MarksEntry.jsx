import { useEffect, useState, useCallback, useMemo } from 'react';
import { Save, ClipboardList, ShieldOff, CircleAlert, RefreshCw } from 'lucide-react';
import axiosClient from '../../api/axiosClient';
import EmptyState from '../../components/shared/EmptyState';
import { useToast } from '../../context/useToast';
import { useAuth } from '../../context/useAuth';

function readApiError(err) {
    const status = err.response?.status;
    const message = err.response?.data?.message;
    if (status === 403) {
        return {
            kind: 'forbidden',
            title: "You're not assigned to this class",
            description: message && !message.toLowerCase().includes('permission')
                ? message
                : 'You can only enter marks for subjects and classes assigned to you. Ask an administrator to add a teaching assignment if this should be yours.',
        };
    }
    if (status === 400) {
        return {
            kind: 'mismatch',
            title: "This exam doesn't cover that combination",
            description: message || 'The selected exam does not include this subject and class. Pick a different exam, subject, or class.',
        };
    }
    if (status === 404) {
        return {
            kind: 'notfound',
            title: 'Not found',
            description: message || 'That exam, subject, or class could not be found.',
        };
    }
    return {
        kind: 'error',
        title: 'Could not load the marks sheet',
        description: message || 'Something went wrong. Check your connection and try again.',
    };
}

function NoticeCard({ icon: Icon, tone, title, description, action }) {
    const tones = {
        amber: {
            wrap: 'border-amber-200 bg-amber-50/70',
            iconWrap: 'bg-amber-100 text-amber-700',
            title: 'text-amber-950',
            body: 'text-amber-800/80',
        },
        slate: {
            wrap: 'border-slate-200 bg-white',
            iconWrap: 'bg-slate-100 text-slate-500',
            title: 'text-slate-900',
            body: 'text-slate-500',
        },
        rose: {
            wrap: 'border-rose-100 bg-rose-50/80',
            iconWrap: 'bg-rose-100 text-rose-600',
            title: 'text-rose-950',
            body: 'text-rose-800/80',
        },
    };
    const t = tones[tone] || tones.slate;
    return (
        <div className={`rounded-2xl border px-6 py-10 text-center ${t.wrap}`}>
            <div className={`mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl ${t.iconWrap}`}>
                <Icon size={26} />
            </div>
            <h3 className={`text-base font-semibold ${t.title}`}>{title}</h3>
            <p className={`mx-auto mt-1.5 max-w-md text-sm leading-relaxed ${t.body}`}>{description}</p>
            {action && <div className="mt-5">{action}</div>}
        </div>
    );
}

export default function MarksEntry() {
    const { user } = useAuth();
    const isTeacher = user?.role === 'TEACHER';
    const toast = useToast();

    const [exams, setExams] = useState([]);
    const [examId, setExamId] = useState('');
    const [selectedExam, setSelectedExam] = useState(null);
    const [subjectId, setSubjectId] = useState('');
    const [classSectionId, setClassSectionId] = useState('');
    const [rows, setRows] = useState([]);
    const [assignments, setAssignments] = useState([]);
    const [loadingSheet, setLoadingSheet] = useState(false);
    const [saving, setSaving] = useState(false);
    const [notice, setNotice] = useState(null);

    useEffect(() => {
        axiosClient.get('/exams')
            .then((res) => setExams(res.data))
            .catch(() => setNotice({
                kind: 'error',
                title: 'Could not load exams',
                description: 'Refresh the page or try again in a moment.',
            }));
        if (isTeacher) {
            axiosClient.get('/teaching-assignments/me')
                .then((res) => setAssignments(res.data))
                .catch(() => setAssignments([]));
        }
    }, [isTeacher]);

    useEffect(() => {
        if (!examId) {
            queueMicrotask(() => setSelectedExam(null));
            return;
        }
        axiosClient.get(`/exams/${examId}`).then((res) => setSelectedExam(res.data));
        queueMicrotask(() => {
            setSubjectId('');
            setClassSectionId('');
            setRows([]);
            setNotice(null);
        });
    }, [examId]);

    const subjectOptions = useMemo(() => {
        const all = selectedExam?.subjects || [];
        if (!isTeacher) return all;
        const allowed = new Set(assignments.map((a) => a.subjectId));
        return all.filter((s) => allowed.has(s.id));
    }, [selectedExam, isTeacher, assignments]);

    const classOptions = useMemo(() => {
        const all = selectedExam?.classSections || [];
        if (!isTeacher) return all;
        const allowed = new Set(
            assignments
                .filter((a) => !subjectId || String(a.subjectId) === String(subjectId))
                .map((a) => a.classSectionId)
        );
        return all.filter((c) => allowed.has(c.id));
    }, [selectedExam, isTeacher, assignments, subjectId]);

    const loadSheet = useCallback(async () => {
        if (!examId || !subjectId || !classSectionId) return;
        setLoadingSheet(true);
        setNotice(null);
        setRows([]);
        try {
            const { data } = await axiosClient.get('/marks/entry-sheet', {
                params: { examId, subjectId, classSectionId },
            });
            setRows(data.map((r) => ({ ...r, score: r.score ?? '' })));
        } catch (err) {
            setNotice(readApiError(err));
        } finally {
            setLoadingSheet(false);
        }
    }, [examId, subjectId, classSectionId]);

    useEffect(() => {
        queueMicrotask(() => loadSheet());
    }, [loadSheet]);

    const updateScore = (studentId, value) => {
        setRows((prev) => prev.map((r) => (r.studentId === studentId ? { ...r, score: value } : r)));
    };

    const clearSelection = () => {
        setSubjectId('');
        setClassSectionId('');
        setRows([]);
        setNotice(null);
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const entries = rows
                .filter((r) => r.score !== '' && r.score !== null)
                .map((r) => ({ studentId: r.studentId, score: Number(r.score), maxScore: r.maxScore || 100 }));

            if (entries.length === 0) {
                toast.error('Enter at least one score before saving');
                setSaving(false);
                return;
            }

            await axiosClient.post('/marks', {
                examId: Number(examId),
                subjectId: Number(subjectId),
                classSectionId: Number(classSectionId),
                entries,
            });
            toast.success('Marks saved successfully');
            await loadSheet();
        } catch (err) {
            const parsed = readApiError(err);
            setNotice(parsed);
            toast.error(parsed.title);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div>
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-slate-900">Marks Entry</h1>
                <p className="text-sm text-slate-500 mt-1">
                    {isTeacher
                        ? 'Enter scores for the subjects and classes assigned to you.'
                        : 'Enter subject scores for a class, per exam.'}
                </p>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-5 mb-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Exam</label>
                    <select value={examId} onChange={(e) => setExamId(e.target.value)}
                            className="w-full px-3 py-2.5 rounded-lg bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-accent">
                        <option value="">Select exam...</option>
                        {exams.map((e) => (
                            <option key={e.id} value={e.id}>{e.name} ({e.termName})</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Subject</label>
                    <select value={subjectId} onChange={(e) => { setSubjectId(e.target.value); setClassSectionId(''); }}
                            disabled={!selectedExam}
                            className="w-full px-3 py-2.5 rounded-lg bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-accent disabled:opacity-50">
                        <option value="">Select subject...</option>
                        {subjectOptions.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Class</label>
                    <select value={classSectionId} onChange={(e) => setClassSectionId(e.target.value)}
                            disabled={!selectedExam || !subjectId}
                            className="w-full px-3 py-2.5 rounded-lg bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-accent disabled:opacity-50">
                        <option value="">Select class...</option>
                        {classOptions.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                </div>
            </div>

            {isTeacher && selectedExam && subjectOptions.length === 0 && (
                <NoticeCard
                    icon={ShieldOff}
                    tone="amber"
                    title="No teaching assignments for this exam"
                    description="None of your assigned subjects are part of this exam. Pick another exam, or ask an admin to assign you a subject."
                />
            )}

            {loadingSheet && (
                <p className="text-sm text-slate-400 px-1">Loading sheet…</p>
            )}

            {!loadingSheet && notice?.kind === 'forbidden' && (
                <NoticeCard
                    icon={ShieldOff}
                    tone="amber"
                    title={notice.title}
                    description={notice.description}
                    action={
                        <button type="button" onClick={clearSelection}
                                className="inline-flex items-center gap-1.5 rounded-lg bg-navy-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-navy-800">
                            Choose a different class
                        </button>
                    }
                />
            )}

            {!loadingSheet && notice && notice.kind !== 'forbidden' && (
                <NoticeCard
                    icon={CircleAlert}
                    tone={notice.kind === 'mismatch' ? 'slate' : 'rose'}
                    title={notice.title}
                    description={notice.description}
                    action={
                        <button type="button" onClick={loadSheet}
                                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50">
                            <RefreshCw size={15} /> Try again
                        </button>
                    }
                />
            )}

            {!loadingSheet && !notice && rows.length > 0 && (
                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                            <tr className="border-b border-slate-100 text-left text-[11px] font-semibold tracking-wider text-slate-400">
                                <th className="px-6 py-3">STUDENT</th>
                                <th className="px-6 py-3">SCORE</th>
                                <th className="px-6 py-3">OUT OF</th>
                                <th className="px-6 py-3">GRADE</th>
                            </tr>
                            </thead>
                            <tbody>
                            {rows.map((r) => (
                                <tr key={r.studentId} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors">
                                    <td className="px-6 py-3 font-medium text-slate-800">{r.studentName}</td>
                                    <td className="px-6 py-3">
                                        <input type="number" min="0" max={r.maxScore || 100} value={r.score}
                                               onChange={(e) => updateScore(r.studentId, e.target.value)}
                                               className="w-24 px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-accent" />
                                    </td>
                                    <td className="px-6 py-3 text-slate-500">{r.maxScore || 100}</td>
                                    <td className="px-6 py-3 text-slate-600">{r.grade || '—'}</td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="p-4 border-t border-slate-100 flex justify-end">
                        <button onClick={handleSave} disabled={saving}
                                className="flex items-center gap-1.5 bg-navy-900 hover:bg-navy-800 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors disabled:opacity-60">
                            <Save size={16} /> {saving ? 'Saving...' : 'Save marks'}
                        </button>
                    </div>
                </div>
            )}

            {!loadingSheet && !notice && examId && subjectId && classSectionId && rows.length === 0 && (
                <EmptyState
                    icon={ClipboardList}
                    title="No students in this class"
                    description="This class has no students yet, so there is no one to enter marks for."
                />
            )}
        </div>
    );
}