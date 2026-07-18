import { useEffect, useState, useCallback } from 'react';
import { Save, ClipboardList } from 'lucide-react';
import axiosClient from '../../api/axiosClient';
import EmptyState from '../../components/shared/EmptyState';
import { useToast } from '../../context/useToast';

export default function MarksEntry() {
    const [exams, setExams] = useState([]);
    const [examId, setExamId] = useState('');
    const [selectedExam, setSelectedExam] = useState(null);
    const [subjectId, setSubjectId] = useState('');
    const [classSectionId, setClassSectionId] = useState('');
    const [rows, setRows] = useState([]);
    const [loadingSheet, setLoadingSheet] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const toast = useToast();

    useEffect(() => {
        axiosClient.get('/exams').then((res) => setExams(res.data)).catch(() => setError('Could not load exams'));
    }, []);

    useEffect(() => {
        if (!examId) { queueMicrotask(() => setSelectedExam(null)); return; }
        axiosClient.get(`/exams/${examId}`).then((res) => setSelectedExam(res.data));
        queueMicrotask(() => { setSubjectId(''); setClassSectionId(''); setRows([]); });
    }, [examId]);

    const loadSheet = useCallback(async () => {
        if (!examId || !subjectId || !classSectionId) return;
        setLoadingSheet(true); setError('');
        try {
            const { data } = await axiosClient.get('/marks/entry-sheet', { params: { examId, subjectId, classSectionId } });
            setRows(data.map((r) => ({ ...r, score: r.score ?? '' })));
        } catch {
            setError('Could not load the marks sheet for this combination');
        } finally { setLoadingSheet(false); }
    }, [examId, subjectId, classSectionId]);

    useEffect(() => {queueMicrotask(() => loadSheet()); }, [loadSheet]);

    const updateScore = (studentId, value) => {
        setRows((prev) => prev.map((r) => (r.studentId === studentId ? { ...r, score: value } : r)));
    };

    const handleSave = async () => {
        setSaving(true); setError('');
        try {
            const entries = rows
                .filter((r) => r.score !== '' && r.score !== null)
                .map((r) => ({ studentId: r.studentId, score: Number(r.score), maxScore: r.maxScore || 100 }));

            if (entries.length === 0) { setError('Enter at least one score before saving'); setSaving(false); return; }

            await axiosClient.post('/marks',
                { examId: Number(examId),
                    subjectId: Number(subjectId),
                    classSectionId: Number(classSectionId),
                    entries });
            toast.success('Marks saved successfully');
            await loadSheet();
        } catch (err) {
            setError(err.response?.data?.message || 'Could not save marks');
        } finally { setSaving(false); }
    };

    return (
        <div>
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-slate-900">Marks Entry</h1>
                <p className="text-sm text-slate-500 mt-1">Enter subject scores for a class, per exam.</p>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-5 mb-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Exam</label>
                    <select value={examId} onChange={(e) => setExamId(e.target.value)}
                            className="w-full px-3 py-2.5 rounded-lg bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-accent">
                        <option value="">Select exam...</option>
                        {exams.map((e) => <option key={e.id} value={e.id}>{e.name} ({e.termName})</option>)}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Subject</label>
                    <select value={subjectId} onChange={(e) => setSubjectId(e.target.value)} disabled={!selectedExam}
                            className="w-full px-3 py-2.5 rounded-lg bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-accent disabled:opacity-50">
                        <option value="">Select subject...</option>
                        {selectedExam?.subjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Class</label>
                    <select value={classSectionId} onChange={(e) => setClassSectionId(e.target.value)} disabled={!selectedExam}
                            className="w-full px-3 py-2.5 rounded-lg bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-accent disabled:opacity-50">
                        <option value="">Select class...</option>
                        {selectedExam?.classSections.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                </div>
            </div>

            {error && <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2 mb-4">{error}</p>}
            {loadingSheet && <p className="text-sm text-slate-400">Loading sheet...</p>}

            {!loadingSheet && rows.length > 0 && (
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

            {!loadingSheet && examId && subjectId && classSectionId && rows.length === 0 && !error && (
                <EmptyState
                    icon={ClipboardList}
                    title="No students found"
                    description="No students are enrolled in this class for this exam."
                />
            )}
        </div>
    );
}
