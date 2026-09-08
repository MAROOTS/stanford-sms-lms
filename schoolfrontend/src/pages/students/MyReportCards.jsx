import { useEffect, useState } from 'react';
import {
    FileDown,
    GraduationCap,
    FileText,
    Loader2,
    CheckCircle2,
    Info,
    BookOpen
} from 'lucide-react';
import axiosClient from '../../api/axiosClient';
import { useAuth } from '../../context/useAuth';
import NoticeCard from '../../components/shared/NoticeCard';
import { readApiErrorAsync } from '../../utils/readApiError';

export default function MyReportCards() {
    const { user } = useAuth();

    const [classSectionId, setClassSectionId] = useState(null);
    const [exams, setExams] = useState([]);
    const [examId, setExamId] = useState('');
    const [generating, setGenerating] = useState(false);
    const [notice, setNotice] = useState(null);

    // Load the student's class section
    useEffect(() => {
        if (!user?.userId) return;

        axiosClient
            .get(`/students/${user.userId}`)
            .then((res) => {
                setClassSectionId(res.data.classSectionId);
            })
            .catch(async (err) => {
                setNotice(
                    await readApiErrorAsync(err, {
                        error: 'Could not load your student information.',
                    })
                );
            });
    }, [user]);

    // Load exams available to the student's class
    useEffect(() => {
        if (!classSectionId) return;

        axiosClient
            .get('/exams')
            .then((res) => {
                setExams(
                    res.data.filter((e) =>
                        e.classSections?.some(
                            (c) => c.id === classSectionId
                        )
                    )
                );
            })
            .catch(async (err) => {
                setNotice(
                    await readApiErrorAsync(err, {
                        error: 'Could not load exams.',
                    })
                );
            });
    }, [classSectionId]);

    const handleGenerate = async () => {
        if (!examId || !user?.userId) return;

        setGenerating(true);
        setNotice(null);

        try {
            const response = await axiosClient.get(
                `/report-cards/student/${user.userId}/exam/${examId}`,
                {
                    responseType: 'blob',
                }
            );

            // Backend may return a JSON error even though
            // the request was made with responseType: 'blob'
            if (
                response.data.type &&
                response.data.type.includes('json')
            ) {
                throw {
                    response: {
                        status: 400,
                        data: JSON.parse(await response.data.text()),
                    },
                };
            }

            const url = window.URL.createObjectURL(
                new Blob([response.data], {
                    type: 'application/pdf',
                })
            );

            const win = window.open(url, '_blank');

            if (!win) {
                setNotice({
                    kind: 'error',
                    title: 'Pop-up blocked',
                    description:
                        'Please allow pop-ups for this site to view your report card.',
                });
            }
        } catch (err) {
            const parsed = await readApiErrorAsync(err, {
                forbidden: 'You can only download your own report card.',
                notFound: 'Your marks may not be posted for this exam yet.',
                error: 'Could not generate this report card.',
            });

            setNotice(parsed);
        } finally {
            setGenerating(false);
        }
    };

    return (
        <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 animate-in fade-in duration-500">
            {/* HEADER */}
            <div className="mb-8">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-navy-900/5 text-navy-900 text-xs font-semibold mb-2">
                    <FileText size={13} />
                    Academic Documentation
                </div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                    Report Cards
                </h1>
                <p className="text-sm text-slate-500 mt-1.5">
                    Select an examination to generate and download your official report card.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                {/* GENERATE FORM CARD */}
                <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 sm:p-8">
                    <h2 className="text-base font-semibold text-slate-900 mb-1 flex items-center gap-2">
                        <BookOpen size={18} className="text-navy-900" />
                        Download Portal
                    </h2>
                    <p className="text-xs text-slate-500 mb-6">
                        Choose the examination term below to compile your performance PDF.
                    </p>

                    <div className="space-y-5">
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                                Examination
                            </label>

                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                                    <GraduationCap size={18} />
                                </div>

                                <select
                                    value={examId}
                                    onChange={(e) => {
                                        setExamId(e.target.value);
                                        setNotice(null);
                                    }}
                                    className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-navy-900/20 focus:border-navy-900 transition-all cursor-pointer"
                                >
                                    <option value="">Select exam...</option>

                                    {exams.map((e) => (
                                        <option key={e.id} value={e.id}>
                                            {e.name} ({e.termName})
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {notice && (
                            <div className="pt-2">
                                <NoticeCard notice={notice} />
                            </div>
                        )}

                        <div className="pt-2">
                            <button
                                type="button"
                                onClick={handleGenerate}
                                disabled={!examId || generating}
                                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-navy-900 hover:bg-navy-800 text-white text-sm font-medium px-6 py-3 rounded-xl transition-all shadow-xs disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer active:scale-98"
                            >
                                {generating ? (
                                    <>
                                        <Loader2 size={16} className="animate-spin" />
                                        Generating PDF...
                                    </>
                                ) : (
                                    <>
                                        <FileDown size={16} />
                                        Download Report Card
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {/* INFO / HINTS SIDE PANEL */}
                <div className="bg-slate-50/60 rounded-2xl border border-slate-200/80 p-6 space-y-4">
                    <div className="flex items-center gap-2 text-slate-900 font-semibold text-sm">
                        <Info size={16} className="text-navy-900" />
                        About Report Cards
                    </div>

                    <ul className="space-y-3 text-xs text-slate-600">
                        <li className="flex items-start gap-2">
                            <CheckCircle2 size={14} className="text-emerald-600 mt-0.5 shrink-0" />
                            <span>Includes complete subject breakdown, test marks, and term averages.</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <CheckCircle2 size={14} className="text-emerald-600 mt-0.5 shrink-0" />
                            <span>Official signatures and teacher evaluation notes included.</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <CheckCircle2 size={14} className="text-emerald-600 mt-0.5 shrink-0" />
                            <span>Generates a printable PDF format ready for downloading or saving.</span>
                        </li>
                    </ul>

                    <div className="pt-3 border-t border-slate-200/80 text-[11px] text-slate-500">
                        <span className="font-semibold text-slate-700">Note:</span> If your document does not open automatically, check your browser's pop-up blocker settings.
                    </div>
                </div>
            </div>
        </div>
    );
}