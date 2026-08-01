import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, FileDown } from 'lucide-react';
import axiosClient from '../../api/axiosClient';

export default function ChildReportCard() {
    const { childId } = useParams();
    const [child, setChild] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        axiosClient.get(`/students/${childId}`)
            .then(res => setChild(res.data))
            .finally(() => setLoading(false));
    }, [childId]);

    if (loading) return <p className="text-sm text-slate-400">Loading...</p>;

    return (
        <div>
            <Link to="/parent-dashboard" className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 mb-4">
                <ArrowLeft size={14} /> Back to Dashboard
            </Link>

            <div className="mb-6">
                <h1 className="text-2xl font-bold text-slate-900">
                    {child?.firstName} {child?.lastName} — Report Card
                </h1>
                <p className="text-sm text-slate-500 mt-1">{child?.gradeLevelName}{child?.classSectionName ? ` · ${child.classSectionName}` : ''}</p>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-10 text-center">
                <FileDown size={40} className="mx-auto text-slate-300 mb-4" />
                <p className="text-slate-600 font-medium">Report cards will be available here once published</p>
                <p className="text-sm text-slate-400 mt-1">Check back after the school admin publishes term report cards.</p>
            </div>
        </div>
    );
}