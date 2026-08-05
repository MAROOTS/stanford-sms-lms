import { useState } from 'react';
import { X, Download, FileText, MessageSquare, AlertCircle, Loader2, User, Hash } from 'lucide-react';
import axiosClient from '../../api/axiosClient';

export default function GradeSubmissionModal({ submission, maxScore, onClose, onSaved }) {
    const [grade, setGrade] = useState(submission.grade ?? '');
    const [feedback, setFeedback] = useState(submission.feedback || '');
    const [error, setError] = useState('');
    const [saving, setSaving] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSaving(true);
        try {
            await axiosClient.put(`/submissions/${submission.id}/grade`, {
                grade: Number(grade),
                feedback: feedback || null,
            });
            onSaved();
        } catch (err) {
            setError(err.response?.data?.message || 'Could not save grade');
        } finally {
            setSaving(false);
        }
    };

    const gradePercentage = grade !== '' ? Math.round((Number(grade) / maxScore) * 100) : 0;
    const initials = (submission.studentName || '??')
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);

    const getGradeColor = (pct) => {
        if (pct >= 80) return 'text-emerald-600 bg-emerald-50 border-emerald-200';
        if (pct >= 60) return 'text-amber-600 bg-amber-50 border-amber-200';
        if (pct >= 40) return 'text-orange-600 bg-orange-50 border-orange-200';
        return 'text-red-600 bg-red-50 border-red-200';
    };

    return (
        <div className="fixed inset-0 bg-slate-900/40 flex items-center justify-center z-50 px-4 py-8 overflow-y-auto" onClick={onClose}>
            <div
                className="bg-white rounded-xl w-full max-w-lg shadow-xl my-auto animate-fade-in border-t-4 border-t-teal-500"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-navy-900 text-white flex items-center justify-center text-sm font-bold shrink-0">
                            {initials}
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-slate-900 leading-tight">Grade submission</h2>
                            <p className="text-sm text-slate-500">{submission.studentName}</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all duration-200"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Body */}
                <div className="px-6 py-5 space-y-5">
                    {/* Submitted Text */}
                    <div>
                        <div className="flex items-center gap-1.5 mb-2">
                            <FileText size={14} className="text-slate-400" />
                            <p className="text-xs font-semibold tracking-wider text-slate-400 uppercase">Submitted Text</p>
                        </div>
                        <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 text-sm text-slate-700 whitespace-pre-wrap max-h-40 overflow-y-auto leading-relaxed">
                            {submission.textContent || <span className="text-slate-400 italic">No text submitted.</span>}
                        </div>
                    </div>

                    {/* Attached File */}
                    {submission.fileUrl && (
                        <a
                            href={submission.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-3 bg-teal-50 border border-teal-200 rounded-lg px-4 py-3 text-sm font-medium text-teal-700 hover:bg-teal-100 hover:border-teal-300 transition-all duration-200 group"
                        >
                            <div className="w-9 h-9 rounded-lg bg-teal-100 flex items-center justify-center group-hover:bg-teal-200 transition-colors duration-200">
                                <Download size={16} className="text-teal-600" />
                            </div>
                            <div>
                                <p className="font-semibold">Download attached file</p>
                                <p className="text-xs text-teal-500 font-normal">Click to open in new tab</p>
                            </div>
                        </a>
                    )}

                    {/* Divider */}
                    <div className="border-t border-slate-100" />

                    {/* Grading Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Grade Input */}
                        <div>
                            <div className="flex items-center justify-between mb-1.5">
                                <label className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
                                    <Hash size={14} className="text-slate-400" />
                                    Grade
                                </label>
                                <span className="text-xs text-slate-400">Out of {maxScore}</span>
                            </div>
                            <div className="relative">
                                <input
                                    type="number"
                                    min="0"
                                    max={maxScore}
                                    required
                                    value={grade}
                                    onChange={(e) => setGrade(e.target.value)}
                                    placeholder={`0 - ${maxScore}`}
                                    className="w-full px-4 py-3 rounded-lg bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-accent focus:border-teal-400 transition-all duration-200 pr-20"
                                />
                                {grade !== '' && (
                                    <span
                                        className={`absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold px-2 py-1 rounded-md border ${getGradeColor(gradePercentage)}`}
                                    >
                                        {gradePercentage}%
                                    </span>
                                )}
                            </div>
                            {/* Progress bar */}
                            {grade !== '' && (
                                <div className="mt-2 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full rounded-full transition-all duration-300 ${
                                            gradePercentage >= 80
                                                ? 'bg-emerald-500'
                                                : gradePercentage >= 60
                                                  ? 'bg-amber-500'
                                                  : gradePercentage >= 40
                                                    ? 'bg-orange-500'
                                                    : 'bg-red-500'
                                        }`}
                                        style={{ width: `${Math.min(gradePercentage, 100)}%` }}
                                    />
                                </div>
                            )}
                        </div>

                        {/* Feedback Textarea */}
                        <div>
                            <label className="text-sm font-medium text-slate-700 mb-1.5 flex items-center gap-1.5">
                                <MessageSquare size={14} className="text-slate-400" />
                                Feedback
                                <span className="text-slate-400 font-normal text-xs ml-1">(optional)</span>
                            </label>
                            <textarea
                                rows={4}
                                value={feedback}
                                onChange={(e) => setFeedback(e.target.value)}
                                placeholder="Add comments about the student's work..."
                                className="w-full px-4 py-3 rounded-lg bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-accent focus:border-teal-400 transition-all duration-200 resize-none placeholder:text-slate-400"
                            />
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div className="flex items-center gap-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-4 py-3 animate-fade-in">
                                <AlertCircle size={16} className="text-red-500 shrink-0" />
                                <span>{error}</span>
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex gap-3 pt-1">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 py-3 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-all duration-200"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={saving}
                                className="flex-1 py-3 rounded-lg bg-navy-900 hover:bg-navy-800 text-white text-sm font-medium disabled:opacity-60 transition-all duration-200 flex items-center justify-center gap-2"
                            >
                                {saving ? (
                                    <>
                                        <Loader2 size={16} className="animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    'Save grade'
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}