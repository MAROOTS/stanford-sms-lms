import { useEffect, useState } from 'react';
import { FileDown } from 'lucide-react';
import axiosClient from '../../api/axiosClient';
import { useAuth } from '../../context/useAuth';

export default function MyReportCards() {
    const { user } = useAuth();
    const [classSectionId, setClassSectionId] = useState(null);
    const [exams, setExams] = useState([]);
    const [examId, setExamId] = useState('');
    const [generating, setGenerating] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!user?.userId) return;
        axiosClient.get(`/students/${user.userId}`).then((res) => setClassSectionId(res.data.classSectionId));
    }, [user]);

    useEffect(() => {
        if (!classSectionId) return;
        axiosClient.get('/exams').then((res) => {
            setExams(res.data.filter((e) => e.classSections.some((c) => c.id === classSectionId)));
        });
    }, [classSectionId]);

    const handleGenerate = async () => {
        setGenerating(true); setError('');
        try {
            const response = await axiosClient.get(`/report-cards/student/${user.userId}/exam/${examId}`, { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
            window.open(url, '_blank');
        } catch {
            setError('Could not generate this report card — your marks may not be posted yet.');
        } finally { setGenerating(false); }
    };

    return (
        <div>
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-slate-900">Report Cards</h1>
                <p className="text-sm text-slate-500 mt-1">Download your report card for any exam.</p>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-5 max-w-md">
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Exam</label>
                <select value={examId} onChange={(e) => setExamId(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-lg bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-accent mb-4">
                    <option value="">Select exam...</option>
                    {exams.map((e) => <option key={e.id} value={e.id}>{e.name} ({e.termName})</option>)}
                </select>

                {error && <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2 mb-4">{error}</p>}

                <button onClick={handleGenerate} disabled={!examId || generating}
                        className="flex items-center gap-1.5 bg-navy-900 hover:bg-navy-800 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors disabled:opacity-50">
                    <FileDown size={16} /> {generating ? 'Generating...' : 'Download report card'}
                </button>
            </div>
        </div>
    );
}