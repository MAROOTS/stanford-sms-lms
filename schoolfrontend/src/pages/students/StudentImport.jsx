import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
    ArrowLeft,
    Download,
    Upload,
    CheckCircle2,
    XCircle,
    FileUp,
    AlertTriangle,
    Loader2,
    FileSpreadsheet
} from 'lucide-react';
import axiosClient from '../../api/axiosClient';
import { useToast } from '../../context/useToast';

function downloadBlob(blob, filename) {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
}

function credentialsToCsv(created) {
    const header = 'firstName,lastName,username,temporaryPassword,className\n';
    const rows = created.map((c) =>
        [c.firstName, c.lastName, c.username, c.temporaryPassword, c.className || ''].join(',')
    ).join('\n');
    return header + rows;
}

export default function StudentImport() {
    const toast = useToast();
    const fileInputRef = useRef(null);
    const [file, setFile] = useState(null);
    const [validation, setValidation] = useState(null);
    const [commitResult, setCommitResult] = useState(null);
    const [validating, setValidating] = useState(false);
    const [committing, setCommitting] = useState(false);
    const [error, setError] = useState('');

    const handleDownloadTemplate = async () => {
        try {
            const res = await axiosClient.get('/students/import/template', { responseType: 'blob' });
            downloadBlob(res.data, 'student-import-template.csv');
        } catch {
            toast.error('Could not download the template');
        }
    };

    const handleFileChange = async (e) => {
        const selected = e.target.files[0];
        if (!selected) return;
        setFile(selected);
        setCommitResult(null);
        setError('');
        setValidating(true);

        const formData = new FormData();
        formData.append('file', selected);
        try {
            const { data } = await axiosClient.post('/students/import/validate', formData);
            setValidation(data);
        } catch (err) {
            setError(err.response?.data?.message || 'Could not validate this file');
            setValidation(null);
            setFile(null);
            if (fileInputRef.current) fileInputRef.current.value = '';
        } finally {
            setValidating(false);
        }
    };

    const handleCommit = async () => {
        if (!file) return;
        setCommitting(true);
        setError('');
        const formData = new FormData();
        formData.append('file', file);
        try {
            const { data } = await axiosClient.post('/students/import/commit', formData);
            setCommitResult(data);
            toast.success(`${data.created.length} students imported.`);
        } catch (err) {
            setError(err.response?.data?.message || 'Could not complete the import');
        } finally {
            setCommitting(false);
        }
    };

    const handleDownloadCredentials = () => {
        if (!commitResult) return;
        const csv = credentialsToCsv(commitResult.created);
        downloadBlob(new Blob([csv], { type: 'text/csv' }), 'imported-student-credentials.csv');
    };

    const reset = () => {
        setFile(null);
        setValidation(null);
        setCommitResult(null);
        setError('');
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    return (
        <div className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8">
            <Link
                to="/students"
                className="group inline-flex w-fit items-center gap-1.5 text-sm font-semibold text-slate-500 transition-colors hover:text-navy-900 mb-6"
            >
                <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" />
                Back to Students
            </Link>

            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">Bulk Import Students</h1>
                <p className="text-base text-slate-500 mt-2">
                    Upload a CSV or Excel file to create multiple student accounts at once.
                </p>
            </div>

            {/* ERROR ALERT */}
            {error && (
                <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700 shadow-sm animate-in fade-in slide-in-from-top-2">
                    <AlertTriangle size={20} className="shrink-0 mt-0.5" />
                    <div>
                        <h4 className="font-semibold text-sm">Import Error</h4>
                        <p className="text-sm mt-1 opacity-90">{error}</p>
                    </div>
                </div>
            )}

            {/* STEP 1: UPLOAD */}
            {!commitResult && !validation && (
                <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm max-w-2xl">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 bg-slate-50 p-5 rounded-xl border border-slate-100">
                        <div>
                            <h3 className="font-semibold text-slate-800 text-sm">Need a starting point?</h3>
                            <p className="text-sm text-slate-500 mt-1">Download our template with required columns.</p>
                        </div>
                        <button
                            onClick={handleDownloadTemplate}
                            className="flex items-center justify-center gap-2 border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 hover:text-slate-900 text-sm font-medium px-4 py-2.5 rounded-lg transition-all active:scale-[0.98] whitespace-nowrap shadow-sm"
                        >
                            <FileSpreadsheet size={16} />
                            Get Template
                        </button>
                    </div>

                    <label className="relative flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 hover:bg-slate-100 transition-colors py-12 px-6 text-center group">
                        {validating ? (
                            <div className="flex flex-col items-center text-navy-600">
                                <Loader2 size={40} className="animate-spin mb-4" />
                                <span className="text-sm font-medium">Validating file...</span>
                            </div>
                        ) : (
                            <>
                                <div className="p-4 bg-white rounded-full shadow-sm mb-4 border border-slate-100 group-hover:scale-105 transition-transform duration-300">
                                    <FileUp size={32} className="text-navy-900" />
                                </div>
                                <span className="text-base font-semibold text-slate-700">Click to upload your filled file</span>
                                <span className="mt-2 text-sm text-slate-500">
                                    Supports .csv and .xlsx up to 10MB
                                </span>
                            </>
                        )}
                        <input
                            ref={fileInputRef}
                            type="file"
                            disabled={validating}
                            accept=".csv,.xlsx,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                            onChange={handleFileChange}
                            className="sr-only"
                        />
                    </label>
                </div>
            )}

            {/* STEP 2: VALIDATION PREVIEW */}
            {validation && !commitResult && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="flex flex-wrap items-center justify-between gap-4 mb-5 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                        <div className="flex items-center gap-6">
                            <span className="flex items-center gap-2 text-sm font-semibold text-teal-700 bg-teal-50 px-3 py-1.5 rounded-lg border border-teal-100">
                                <CheckCircle2 size={18} />
                                {validation.validCount} ready to import
                            </span>
                            {validation.invalidCount > 0 && (
                                <span className="flex items-center gap-2 text-sm font-semibold text-red-600 bg-red-50 px-3 py-1.5 rounded-lg border border-red-100">
                                    <XCircle size={18} />
                                    {validation.invalidCount} with errors
                                </span>
                            )}
                        </div>
                        <div className="flex items-center gap-3 w-full sm:w-auto">
                            <button
                                onClick={reset}
                                className="flex-1 sm:flex-none px-4 py-2 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleCommit}
                                disabled={validation.validCount === 0 || committing}
                                className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-navy-900 hover:bg-navy-800 text-white text-sm font-medium px-5 py-2 rounded-lg shadow-md transition-all active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none"
                            >
                                {committing ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                                {committing ? 'Importing...' : 'Import Valid Rows'}
                            </button>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                        <div className="max-h-[500px] overflow-y-auto custom-scrollbar">
                            <table className="w-full text-sm text-left">
                                <thead className="sticky top-0 bg-slate-50 z-10 shadow-sm">
                                <tr className="text-[11px] font-bold tracking-wider text-slate-500 uppercase border-b border-slate-200">
                                    <th className="px-5 py-3.5 w-16">Row</th>
                                    <th className="px-5 py-3.5">Name</th>
                                    <th className="px-5 py-3.5">Email</th>
                                    <th className="px-5 py-3.5">Class</th>
                                    <th className="px-5 py-3.5 text-right">Status</th>
                                </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                {validation.rows.map((r) => (
                                    <tr
                                        key={r.rowNumber}
                                        className={`transition-colors hover:bg-slate-50/80 ${!r.valid ? 'bg-red-50/30' : ''}`}
                                    >
                                        <td className="px-5 py-3.5 text-slate-500 font-medium">
                                            {r.rowNumber}
                                        </td>
                                        <td className="px-5 py-3.5 font-medium text-slate-900">
                                            {r.firstName} {r.lastName}
                                        </td>
                                        <td className="px-5 py-3.5 text-slate-600">
                                            {r.email || <span className="text-slate-400 italic">None</span>}
                                        </td>
                                        <td className="px-5 py-3.5 text-slate-600">
                                            {r.className ? (
                                                <span className="inline-flex items-center px-2 py-1 rounded bg-slate-100 text-slate-700 text-xs font-medium border border-slate-200">
                                                        {r.className}
                                                    </span>
                                            ) : <span className="text-slate-400 italic">—</span>}
                                        </td>
                                        <td className="px-5 py-3.5 text-right">
                                            {r.valid ? (
                                                <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-full bg-teal-50 border border-teal-100 text-teal-700 text-xs font-semibold">
                                                        Ready
                                                    </span>
                                            ) : (
                                                <span
                                                    className="inline-flex items-center justify-center px-2.5 py-1 rounded-full bg-red-50 border border-red-100 text-red-600 text-xs font-semibold"
                                                    title={r.errorMessage}
                                                >
                                                        {r.errorMessage}
                                                    </span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* STEP 3: SUCCESS STATE */}
            {commitResult && (
                <div className="max-w-2xl mx-auto animate-in zoom-in-95 duration-500">
                    <div className="bg-white rounded-3xl border border-slate-200 p-10 shadow-lg text-center flex flex-col items-center">
                        <div className="w-20 h-20 bg-teal-50 rounded-full flex items-center justify-center mb-6 border-8 border-teal-50/50">
                            <CheckCircle2 size={40} className="text-teal-500" />
                        </div>

                        <h2 className="text-3xl font-bold text-slate-900 mb-2">Import Complete!</h2>
                        <p className="text-slate-600 text-lg mb-8">
                            Successfully created <strong className="text-slate-900">{commitResult.created.length}</strong> student accounts.
                            {commitResult.skipped.length > 0 && (
                                <span className="text-red-500 block mt-1 text-sm">
                                    Note: {commitResult.skipped.length} rows were skipped due to errors.
                                </span>
                            )}
                        </p>

                        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 text-left w-full mb-8 shadow-sm">
                            <div className="flex items-start gap-4">
                                <div className="bg-amber-100 p-2 rounded-full shrink-0">
                                    <AlertTriangle size={24} className="text-amber-600" />
                                </div>
                                <div>
                                    <h4 className="text-amber-900 font-bold text-base mb-1">Save these credentials now</h4>
                                    <p className="text-amber-800 text-sm mb-4 leading-relaxed">
                                        For security reasons, the temporary passwords for these students will <strong>never be shown again</strong>. Please download the file below and distribute it securely.
                                    </p>
                                    <button
                                        onClick={handleDownloadCredentials}
                                        className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white shadow-sm text-sm font-bold px-5 py-2.5 rounded-xl transition-all active:scale-95"
                                    >
                                        <Download size={18} />
                                        Download Credentials CSV
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-4 w-full">
                            <Link
                                to="/students"
                                className="flex-1 flex justify-center items-center px-6 py-3 rounded-xl bg-navy-900 hover:bg-navy-800 text-white font-semibold transition-all shadow-md active:scale-[0.98]"
                            >
                                View All Students
                            </Link>
                            <button
                                onClick={reset}
                                className="flex-1 px-6 py-3 rounded-xl border-2 border-slate-200 font-semibold text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-all active:scale-[0.98]"
                            >
                                Import More
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}