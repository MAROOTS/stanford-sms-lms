import { useEffect, useState } from 'react';
import {FileDown, FileText, ChevronDown, Check} from 'lucide-react';
import axiosClient from '../../api/axiosClient';
import EmptyState from '../../components/shared/EmptyState';
import { useToast } from '../../context/useToast';
import NoticeCard from '../../components/shared/NoticeCard';
import { readApiError, readApiErrorAsync } from '../../utils/readApiError';

export default function ReportCards() {
    const [exams, setExams] = useState([]);
    const [examId, setExamId] = useState('');
    const [selectedExam, setSelectedExam] = useState(null);
    const [classSectionId, setClassSectionId] = useState('');
    const [students, setStudents] = useState([]);
    const [studentId, setStudentId] = useState('');
    const [generating, setGenerating] = useState(false);
    const [notice, setNotice] = useState(null);
    const toast = useToast();

    useEffect(() => {
        axiosClient.get('/exams').then((res) => setExams(res.data)).catch((err) => setNotice(readApiError(err, { error: 'Could not load exams' })))
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
        setGenerating(true); setNotice('');
        try {
            const response = await axiosClient.get(`/report-cards/student/${studentId}/exam/${examId}`, { responseType: 'blob' });
            if (response.data.type && response.data.type.includes('json')) {
                throw { response: { status: 400, data: JSON.parse(await response.data.text()) } };
            }
            const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
            const win = window.open(url, '_blank');
            if (!win) {
                toast.warning('Pop-up blocked. Please allow pop-ups for this site to view the report card.');
            }
        } catch (err) {
            const parsed = await readApiErrorAsync(err, {
                forbidden: 'You are not allowed to generate this report card.',
                notFound: 'No marks have been posted for this student and exam yet.',
                error: 'Could not generate this report card.',
            });
            setNotice(parsed);
        } finally { setGenerating(false); }
    };

    return (
        <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 animate-in fade-in duration-500">
            {/* HEADER */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">Report Cards</h1>
                <p className="text-sm text-slate-500 mt-1.5">Generate individual student performance report card PDFs for specific exams.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* GENERATOR CARD */}
                <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
                    <div className="space-y-6">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Exam</label>
                            <div className="relative">
                                <select
                                    value={examId}
                                    onChange={(e) => setExamId(e.target.value)}
                                    className="w-full appearance-none px-4 py-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-navy-900 focus:border-transparent text-sm font-medium text-slate-700 transition-all cursor-pointer"
                                >
                                    <option value="">Select an exam...</option>
                                    {exams.map((e) => <option key={e.id} value={e.id}>{e.name} ({e.termName})</option>)}
                                </select>
                                <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Class</label>
                            <div className="relative">
                                <select
                                    value={classSectionId}
                                    onChange={(e) => setClassSectionId(e.target.value)}
                                    disabled={!selectedExam}
                                    className="w-full appearance-none px-4 py-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-navy-900 focus:border-transparent text-sm font-medium text-slate-700 transition-all cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
                                >
                                    <option value="">Select a class...</option>
                                    {selectedExam?.classSections.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                                <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Student</label>
                            <div className="relative">
                                <select
                                    value={studentId}
                                    onChange={(e) => setStudentId(e.target.value)}
                                    disabled={!classSectionId || students.length === 0}
                                    className="w-full appearance-none px-4 py-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-navy-900 focus:border-transparent text-sm font-medium text-slate-700 transition-all cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
                                >
                                    <option value="">Select a student...</option>
                                    {students.map((s) => <option key={s.id} value={s.id}>{s.firstName} {s.lastName}</option>)}
                                </select>
                                <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                            </div>
                        </div>

                        {notice && <NoticeCard notice={notice} />}

                        <button
                            onClick={handleGenerate}
                            disabled={!studentId || generating}
                            className="w-full flex items-center justify-center gap-2 bg-navy-900 hover:bg-navy-800 text-white shadow-sm text-sm font-semibold px-6 py-3 rounded-xl transition-all active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none"
                        >
                            <FileDown size={18} /> {generating ? 'Generating PDF...' : 'Generate Report Card'}
                        </button>
                    </div>
                </div>

                {/* INFO PANEL / HELPER STATE */}
                <div className="lg:col-span-6">
                    {!examId ? (
                        <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
                            <EmptyState
                                icon={FileText}
                                title="Ready to print report cards"
                                description="Select an exam, class, and individual student from the configuration panel to securely generate and preview a formatted PDF report card."
                            />
                        </div>
                    ) : (
                        <div className="bg-gradient-to-br from-slate-900 to-navy-900 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
                            <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-teal-500/10 rounded-full blur-2xl pointer-events-none"></div>

                            <div className="flex items-center gap-2.5 text-teal-400 mb-4">
                                <Check size={20} />
                                <span className="text-xs font-bold tracking-wider uppercase">Selection Overview</span>
                            </div>

                            <h3 className="text-xl font-bold tracking-tight mb-2">
                                {selectedExam?.name || 'Selected Exam'}
                            </h3>
                            <p className="text-slate-300 text-sm mb-6">
                                Term: <span className="text-white font-medium">{selectedExam?.termName || 'N/A'}</span>
                            </p>

                            <div className="space-y-3 border-t border-white/10 pt-6 text-sm text-slate-300">
                                <div className="flex justify-between">
                                    <span className="text-slate-400">Target Class:</span>
                                    <span className="font-semibold text-white">
                                        {selectedExam?.classSections?.find(c => c.id === Number(classSectionId))?.name || 'Not selected'}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-400">Target Student:</span>
                                    <span className="font-semibold text-white">
                                        {students.find(s => s.id === Number(studentId)) ? `${students.find(s => s.id === Number(studentId)).firstName} ${students.find(s => s.id === Number(studentId)).lastName}` : 'Not selected'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}