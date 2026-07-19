import { useEffect, useState } from 'react';
import { FileDown, FileText } from 'lucide-react';
import axiosClient from '../../api/axiosClient';
import EmptyState from '../../components/shared/EmptyState';
import { useToast } from '../../context/ToastContext';

export default function ReportCards() {
    const [exams, setExams] = useState([]);
    const [examId, setExamId] = useState('');
    const [selectedExam, setSelectedExam] = useState(null);
    const [classSectionId, setClassSectionId] = useState('');
    const [students, setStudents] = useState([]);
    const [studentId, setStudentId] = useState('');
    const [generating, setGenerating] = useState(false);
    const [error, setError] = useState('');

    const toast = useToast();

    useEffect(() => {
        axiosClient.get('/exams').then((res) => setExams(res.data)).catch(() => setError('Could not load exams'));
    }, []);

    useEffect(() => {
        if (!examId) { queueMicrotask(() => setSelectedExam(null)); return; }
        axiosClient.get(`/exams/${examId}`).then((res) => setSelectedExam(res.data));
        queueMicrotask(() => { setClassSectionId(''); setStudentId(''); setStudents([]); });
    }, [examId]);

    useEffect(() => {
        if (!classSectionId) { queueMicrotask(() => setStudents([])); return; }
        axiosClient.get('/students').then((res) => {
            setStudents(res.data.filter((s) => s.classSectionId === Number(classSectionId)));
        });
    }, [classSectionId]);

    const handleGenerate = async () => {
        setGenerating(true); setError('');
        try {
            const response = await axiosClient.get(`/report-cards/student/${studentId}/exam/${examId}`, { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
            const win = window.open(url, '_blank');
            if (!win) {
                toast.warning('Pop-up blocked. Please allow pop-ups for this site to view the report card.');
            }
        } catch {
            setError('Could not generate this report card — the student may not have any marks recorded for this exam yet.');
        } finally { setGenerating(false); }
    };

    return (
        <div>
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-slate-900">Report Cards</h1>
                <p className="text-sm text-slate-500 mt-1">Generate a per-student report card PDF for an exam.</p>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-5 max-w-xl">
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Exam</label>
                        <select value={examId} onChange={(e) => setExamId(e.target.value)}
                                className="w-full px-3 py-2.5 rounded-lg bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-accent">
                            <option value="">Select exam...</option>
                            {exams.map((e) => <option key={e.id} value={e.id}>{e.name} ({e.termName})</option>)}
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

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Student</label>
                        <select value={studentId} onChange={(e) => setStudentId(e.target.value)} disabled={!classSectionId || students.length === 0}
                                className="w-full px-3 py-2.5 rounded-lg bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-accent disabled:opacity-50">
                            <option value="">Select student...</option>
                            {students.map((s) => <option key={s.id} value={s.id}>{s.firstName} {s.lastName}</option>)}
                        </select>
                    </div>

                    {error && <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</p>}

                    <button onClick={handleGenerate} disabled={!studentId || generating}
                            className="flex items-center gap-1.5 bg-navy-900 hover:bg-navy-800 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors disabled:opacity-50">
                        <FileDown size={16} /> {generating ? 'Generating...' : 'Generate report card'}
                    </button>
                </div>
            </div>

            {!examId && (
                <div className="mt-6">
                    <EmptyState
                        icon={FileText}
                        title="Generate a report card"
                        description="Select an exam, class, and student above to generate a PDF report card."
                    />
                </div>
            )}
        </div>
    );
}
