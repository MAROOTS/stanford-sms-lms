import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Download, Upload, CheckCircle2, XCircle } from 'lucide-react';
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
        const res = await axiosClient.get('/students/import/template', { responseType: 'blob' });
        downloadBlob(res.data, 'student-import-template.csv');
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
            const { data } = await axiosClient.post('/students/import/validate', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            setValidation(data);
        } catch (err) {
            setError(err.response?.data?.message || 'Could not validate this file');
            setValidation(null);
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
            const { data } = await axiosClient.post('/students/import/commit', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
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
        <div>
            <Link to="/students" className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-700 mb-4">
                <ArrowLeft size={15} /> Back to Students
            </Link>

            <div className="mb-6">
                <h1 className="text-2xl font-bold text-slate-900">Bulk Import Students</h1>
                <p className="text-sm text-slate-500 mt-1">Upload a CSV file to create many student accounts at once.</p>
            </div>

            {!commitResult && (
                <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6 max-w-xl">
                    <p className="text-sm text-slate-600 mb-4">
                        Download the template, fill it in (one student per row), then upload it below. The{' '}
                        <code className="bg-slate-100 px-1 py-0.5 rounded">className</code> column is optional — leave it
                        blank to import unassigned, or use the exact class name shown on your Classes page.
                    </p>
                    <button onClick={handleDownloadTemplate}
                            className="flex items-center gap-1.5 border border-slate-200 text-slate-600 hover:bg-slate-50 text-sm font-medium px-4 py-2.5 rounded-lg mb-6">
                        <Download size={16} /> Download CSV template
                    </button>

                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Upload filled-in CSV</label>
                    <input ref={fileInputRef} type="file" accept=".csv" onChange={handleFileChange}
                           className="w-full text-sm text-slate-600 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-navy-900 file:text-white file:text-sm file:font-medium hover:file:bg-navy-800" />

                    {validating && <p className="text-sm text-slate-400 mt-3">Validating...</p>}
                    {error && <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2 mt-3">{error}</p>}
                </div>
            )}

            {validation && !commitResult && (
                <div className="max-w-3xl">
                    <div className="flex items-center gap-4 mb-4">
            <span className="flex items-center gap-1.5 text-sm font-medium text-teal-700">
              <CheckCircle2 size={16} /> {validation.validCount} ready to import
            </span>
                        {validation.invalidCount > 0 && (
                            <span className="flex items-center gap-1.5 text-sm font-medium text-red-600">
                <XCircle size={16} /> {validation.invalidCount} with errors
              </span>
                        )}
                    </div>

                    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden mb-4 max-h-96 overflow-y-auto">
                        <table className="w-full text-sm">
                            <thead className="sticky top-0 bg-white">
                            <tr className="border-b border-slate-100 text-left text-[11px] font-semibold tracking-wider text-slate-400">
                                <th className="px-4 py-2.5">ROW</th>
                                <th className="px-4 py-2.5">NAME</th>
                                <th className="px-4 py-2.5">EMAIL</th>
                                <th className="px-4 py-2.5">CLASS</th>
                                <th className="px-4 py-2.5">STATUS</th>
                            </tr>
                            </thead>
                            <tbody>
                            {validation.rows.map((r) => (
                                <tr key={r.rowNumber} className={`border-b border-slate-50 last:border-0 ${!r.valid ? 'bg-red-50/40' : ''}`}>
                                    <td className="px-4 py-2.5 text-slate-500">{r.rowNumber}</td>
                                    <td className="px-4 py-2.5 text-slate-800">{r.firstName} {r.lastName}</td>
                                    <td className="px-4 py-2.5 text-slate-600">{r.email || '—'}</td>
                                    <td className="px-4 py-2.5 text-slate-600">{r.className || '—'}</td>
                                    <td className="px-4 py-2.5">
                                        {r.valid ? (
                                            <span className="text-teal-700 text-xs font-medium">Ready</span>
                                        ) : (
                                            <span className="text-red-600 text-xs font-medium" title={r.errorMessage}>{r.errorMessage}</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>

                    {error && <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2 mb-4">{error}</p>}

                    <div className="flex gap-3">
                        <button onClick={reset} className="px-4 py-2.5 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50">
                            Choose a different file
                        </button>
                        <button onClick={handleCommit} disabled={validation.validCount === 0 || committing}
                                className="flex items-center gap-1.5 bg-navy-900 hover:bg-navy-800 text-white text-sm font-medium px-4 py-2.5 rounded-lg disabled:opacity-50">
                            <Upload size={16} /> {committing ? 'Importing...' : `Import ${validation.validCount} students`}
                        </button>
                    </div>
                </div>
            )}

            {commitResult && (
                <div className="max-w-2xl">
                    <div className="bg-white rounded-xl border border-slate-200 p-6 mb-4">
                        <p className="text-sm text-slate-700 mb-1">
                            <strong>{commitResult.created.length}</strong> students imported successfully.
                            {commitResult.skipped.length > 0 && <> <strong>{commitResult.skipped.length}</strong> rows were skipped due to errors.</>}
                        </p>
                        <p className="text-sm text-amber-600 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2 mt-3">
                            Download the credentials file now — these temporary passwords will not be shown again.
                        </p>
                        <button onClick={handleDownloadCredentials}
                                className="flex items-center gap-1.5 bg-navy-900 hover:bg-navy-800 text-white text-sm font-medium px-4 py-2.5 rounded-lg mt-4">
                            <Download size={16} /> Download credentials CSV
                        </button>
                    </div>

                    <div className="flex gap-3">
                        <button onClick={reset} className="px-4 py-2.5 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50">
                            Import more students
                        </button>
                        <Link to="/students" className="px-4 py-2.5 rounded-lg bg-navy-900 hover:bg-navy-800 text-white text-sm font-medium">
                            Go to Students
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
}