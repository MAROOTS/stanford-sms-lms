import { useEffect, useState } from 'react';
import { FileDown } from 'lucide-react';
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
            .catch((err) => {
                setNotice(
                    readApiErrorAsync(err, {
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
            .catch((err) => {
                setNotice(
                    readApiErrorAsync(err, {
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
        <div>
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-slate-900">
                    Report Cards
                </h1>

                <p className="text-sm text-slate-500 mt-1">
                    Download your report card for any exam.
                </p>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-5 max-w-md">
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Exam
                </label>

                <select
                    value={examId}
                    onChange={(e) => {
                        setExamId(e.target.value);
                        setNotice(null);
                    }}
                    className="w-full px-3 py-2.5 rounded-lg bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-accent mb-4"
                >
                    <option value="">Select exam...</option>

                    {exams.map((e) => (
                        <option key={e.id} value={e.id}>
                            {e.name} ({e.termName})
                        </option>
                    ))}
                </select>

                {notice && <NoticeCard notice={notice} />}

                <button
                    onClick={handleGenerate}
                    disabled={!examId || generating}
                    className="flex items-center gap-1.5 bg-navy-900 hover:bg-navy-800 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors disabled:opacity-50"
                >
                    <FileDown size={16} />

                    {generating
                        ? 'Generating...'
                        : 'Download report card'}
                </button>
            </div>
        </div>
    );
}

