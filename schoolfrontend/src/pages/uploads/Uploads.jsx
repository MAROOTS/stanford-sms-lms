import { useState, useRef, useCallback } from 'react';
import { Upload, FileSpreadsheet, FileText, X, Download, CheckCircle, AlertCircle, Loader2, Users, GraduationCap, BookOpen, BarChart3, ClipboardCheck, CreditCard, Library, ChevronRight, FileUp, Info } from 'lucide-react';
import axiosClient from '../../api/axiosClient';
import { useToast } from '../../context/ToastContext';

const ENTITY_TYPES = [
  { key: 'STUDENT', label: 'Students', icon: Users, color: 'from-blue-500 to-blue-600', bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', desc: 'First name, last name, email, admission number, roll number, parent contact.' },
  { key: 'TEACHER', label: 'Teachers', icon: GraduationCap, color: 'from-violet-500 to-violet-600', bg: 'bg-violet-50', text: 'text-violet-700', border: 'border-violet-200', desc: 'First name, last name, email, qualification, department.' },
  { key: 'MARKS', label: 'Marks / Scores', icon: BarChart3, color: 'from-amber-500 to-amber-600', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', desc: 'Exam ID, subject ID, student email, score, max score.' },
  { key: 'SUBJECT', label: 'Subjects', icon: BookOpen, color: 'from-emerald-500 to-emerald-600', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', desc: 'Subject name and optional code (e.g. MATH).' },
  { key: 'BOOKS', label: 'Library Books', icon: Library, color: 'from-rose-500 to-rose-600', bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200', desc: 'Title, author, ISBN, publisher.' },
  { key: 'ATTENDANCE', label: 'Attendance', icon: ClipboardCheck, color: 'from-cyan-500 to-cyan-600', bg: 'bg-cyan-50', text: 'text-cyan-700', border: 'border-cyan-200', desc: 'Session ID, student email, status (PRESENT/ABSENT/LATE/EXCUSED).' },
  { key: 'FEE_ITEMS', label: 'Fee Items', icon: CreditCard, color: 'from-orange-500 to-orange-600', bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200', desc: 'Fee item names — Tuition, Transport, Lunch, etc.' },
];

const EXPECTED_COLUMNS = {
  STUDENT: [
    { name: 'firstName', required: true }, { name: 'middleName' }, { name: 'lastName', required: true },
    { name: 'email', required: true }, { name: 'dateOfBirth' }, { name: 'gender' },
    { name: 'nationality' }, { name: 'religion' },
    { name: 'address' }, { name: 'city' }, { name: 'stateProvince' }, { name: 'postalCode' }, { name: 'country' },
    { name: 'phoneNumber' },
    { name: 'guardianName' }, { name: 'guardianRelationship' }, { name: 'guardianEmail' }, { name: 'guardianPhone' },
    { name: 'emergencyContactName' }, { name: 'emergencyContactPhone' },
    { name: 'bloodGroup' }, { name: 'medicalNotes' },
    { name: 'admissionNumber' }, { name: 'rollNumber' },
    { name: 'enrollmentDate' }, { name: 'enrollmentStatus' }, { name: 'previousSchool' },
  ],
  TEACHER: [
    { name: 'firstName', required: true }, { name: 'lastName', required: true }, { name: 'email', required: true },
    { name: 'employeeId' }, { name: 'qualification' }, { name: 'department' }, { name: 'designation' },
    { name: 'joinDate' }, { name: 'dateOfBirth' }, { name: 'gender' }, { name: 'nationality' },
    { name: 'phoneNumber' }, { name: 'address' }, { name: 'city' }, { name: 'stateProvince' },
    { name: 'postalCode' }, { name: 'country' },
    { name: 'emergencyContactName' }, { name: 'emergencyContactPhone' },
  ],
  MARKS: [
    { name: 'examId', required: true }, { name: 'subjectId', required: true }, { name: 'studentEmail', required: true },
    { name: 'score', required: true }, { name: 'maxScore' },
  ],
  SUBJECT: [{ name: 'name', required: true }, { name: 'code' }, { name: 'description' }, { name: 'category' }, { name: 'credits' }],
  BOOKS: [{ name: 'title', required: true }, { name: 'author' }, { name: 'isbn' }, { name: 'publisher' }],
  ATTENDANCE: [
    { name: 'sessionId', required: true }, { name: 'studentEmail', required: true }, { name: 'status', required: true },
  ],
  FEE_ITEMS: [{ name: 'name', required: true }],
};


export default function Uploads() {
  const [selectedType, setSelectedType] = useState('STUDENT');
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);
  const toast = useToast();

  const handleFile = useCallback((f) => {
    if (!f) return;
    const ext = f.name.split('.').pop().toLowerCase();
    if (!['csv', 'xlsx', 'xls'].includes(ext)) {
      toast.error('Please select a .csv or .xlsx file');
      return;
    }
    if (f.size > 10 * 1024 * 1024) {
      toast.error('File size must be under 10MB');
      return;
    }
    setFile(f);
    setResult(null);
  }, [toast]);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    handleFile(e.dataTransfer.files[0]);
  };

  const handleUpload = async () => {
    if (!file || !selectedType) return;
    setUploading(true);
    setResult(null);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', selectedType);
      const { data } = await axiosClient.post('/admin/uploads', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setResult(data);
      if (data.errorCount === 0) {
        toast.success(`Successfully imported ${data.successCount} records`);
      } else {
        toast.warning(`Imported ${data.successCount} with ${data.errorCount} errors`);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const clearFile = () => {
    setFile(null);
    setResult(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const downloadTemplate = (type, format) => {
    const cols = EXPECTED_COLUMNS[type].map((c) => c.name);
    const sample = cols.map((c) => {
      if (c === 'email' || c === 'studentEmail') return 'student@school.com';
      if (c === 'status') return 'PRESENT';
      if (c === 'score') return '85';
      if (c === 'maxScore') return '100';
      return '';
    }).join(',');
    const csv = cols.join(',') + '\n' + sample;

    const ext = format === 'xlsx' ? 'xlsx' : 'csv';
    const mime = format === 'xlsx'
      ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      : 'text/csv';

    // For Excel, wrap CSV as UTF-8 BOM so Excel opens it correctly
    const content = format === 'xlsx' ? '﻿' + csv : csv;
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${type.toLowerCase()}_template.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
    toast.info(`${format.toUpperCase()} template downloaded`);
  };

  const selectedEntity = ENTITY_TYPES.find((e) => e.key === selectedType);
  const EntityIcon = selectedEntity?.icon;
  const columns = EXPECTED_COLUMNS[selectedType];

  return (
    <div className="animate-fade-in-up max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-400 to-accent-500 flex items-center justify-center shadow-md shadow-accent-500/20">
            <FileUp size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-[26px] font-bold text-slate-900 tracking-tight">Bulk Import</h1>
            <p className="text-sm text-slate-500">Import data from CSV or Excel spreadsheets into your school system.</p>
          </div>
        </div>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-8 text-sm">
        <span className={`flex items-center gap-1.5 font-semibold ${!file ? 'text-accent-600' : 'text-slate-400'}`}>
          <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs ${!file ? 'bg-accent-500 text-white' : 'bg-surface-200 text-slate-500'}`}>1</span>
          Select & prepare
        </span>
        <ChevronRight size={14} className="text-slate-300" />
        <span className={`flex items-center gap-1.5 font-semibold ${file && !result ? 'text-accent-600' : 'text-slate-400'}`}>
          <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs ${file && !result ? 'bg-accent-500 text-white' : 'bg-surface-200 text-slate-500'}`}>2</span>
          Upload
        </span>
        <ChevronRight size={14} className="text-slate-300" />
        <span className={`flex items-center gap-1.5 font-semibold ${result ? 'text-accent-600' : 'text-slate-400'}`}>
          <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs ${result ? 'bg-accent-500 text-white' : 'bg-surface-200 text-slate-500'}`}>3</span>
          Review results
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Main content — 3 cols */}
        <div className="lg:col-span-3 space-y-6">
          {/* Step 1: Select type */}
          <div className="bg-white rounded-2xl border border-surface-200 shadow-card overflow-hidden">
            <div className="px-5 py-4 border-b border-surface-100 bg-surface-50/50">
              <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <span className="w-6 h-6 rounded-md bg-accent-500 text-white text-xs flex items-center justify-center font-bold">1</span>
                What do you want to import?
              </h2>
            </div>
            <div className="p-5">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
                {ENTITY_TYPES.map((et) => {
                  const Icon = et.icon;
                  const isSelected = selectedType === et.key;
                  return (
                    <button
                      key={et.key}
                      onClick={() => { setSelectedType(et.key); setResult(null); }}
                      className={`flex flex-col items-center gap-2 p-3.5 rounded-xl border-2 text-center transition-all duration-200 ${
                        isSelected
                          ? `${et.border} bg-gradient-to-b ${et.bg} shadow-sm scale-[1.02]`
                          : 'border-surface-200 hover:border-surface-300 hover:bg-surface-50'
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                        isSelected ? `bg-gradient-to-br ${et.color} text-white shadow-sm` : 'bg-surface-100 text-slate-400'
                      }`}>
                        <Icon size={20} />
                      </div>
                      <span className={`text-xs font-semibold leading-tight ${isSelected ? 'text-slate-900' : 'text-slate-600'}`}>
                        {et.label}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Selected type info */}
              {selectedEntity && (
                <div className={`mt-4 flex items-start gap-3 ${selectedEntity.bg} rounded-xl p-4 border ${selectedEntity.border} animate-fade-in`}>
                  <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${selectedEntity.color} flex items-center justify-center shrink-0 shadow-sm`}>
                    <EntityIcon size={18} className="text-white" />
                  </div>
                  <div>
                    <p className={`text-sm font-bold ${selectedEntity.text}`}>{selectedEntity.label} import</p>
                    <p className="text-xs text-slate-600 mt-0.5">{selectedEntity.desc}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Step 2: Template + Upload */}
          <div className="bg-white rounded-2xl border border-surface-200 shadow-card overflow-hidden">
            <div className="px-5 py-4 border-b border-surface-100 bg-surface-50/50">
              <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <span className="w-6 h-6 rounded-md bg-accent-500 text-white text-xs flex items-center justify-center font-bold">2</span>
                Prepare & upload your file
              </h2>
            </div>
            <div className="p-5 space-y-5">
              {/* Template section */}
              <div className="bg-gradient-to-r from-surface-50 to-surface-100 rounded-xl border border-surface-200 p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-lg bg-white border border-surface-200 flex items-center justify-center shrink-0 shadow-sm">
                      <Download size={16} className="text-slate-500" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-800">Download a template first</p>
                      <p className="text-xs text-slate-500 mt-0.5 mb-2">
                        Get a pre-formatted CSV with the correct column headers for {selectedEntity?.label.toLowerCase()}.
                      </p>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => downloadTemplate(selectedType, 'csv')}
                          className="inline-flex items-center gap-1.5 text-xs font-semibold bg-white border border-surface-200 hover:bg-surface-50 text-slate-700 px-3 py-1.5 rounded-lg transition-colors shadow-sm"
                        >
                          <FileText size={13} />
                          .CSV
                        </button>
                        <button
                          onClick={() => downloadTemplate(selectedType, 'xlsx')}
                          className="inline-flex items-center gap-1.5 text-xs font-semibold bg-white border border-surface-200 hover:bg-surface-50 text-slate-700 px-3 py-1.5 rounded-lg transition-colors shadow-sm"
                        >
                          <FileSpreadsheet size={13} />
                          .XLSX
                        </button>
                      </div>
                    </div>
                  </div>
                  {/* Mini CSV preview */}
                  <div className="hidden sm:block bg-white border border-surface-200 rounded-lg px-3 py-2 font-mono text-[10px] text-slate-400 leading-relaxed shadow-sm">
                    <div className="text-slate-500 font-semibold mb-0.5">{selectedType.toLowerCase()}_template.csv</div>
                    {columns.slice(0, 5).map((c, i) => (
                      <div key={i} className={c.required ? 'text-red-400' : 'text-slate-400'}>
                        {c.name}{c.required ? '*' : ''}
                      </div>
                    ))}
                    {columns.length > 5 && <div className="text-slate-300">...</div>}
                  </div>
                </div>
              </div>

              {/* Drop zone */}
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={(e) => handleFile(e.target.files[0])}
                className="hidden"
              />

              {!file ? (
                <div
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200 ${
                    dragOver
                      ? 'border-accent-400 bg-accent-50/40 scale-[1.01]'
                      : 'border-surface-300 hover:border-accent-300 hover:bg-surface-50'
                  }`}
                >
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 transition-colors ${
                    dragOver ? 'bg-accent-100' : 'bg-surface-100'
                  }`}>
                    <Upload size={28} className={dragOver ? 'text-accent-500' : 'text-slate-300'} />
                  </div>
                  <p className="text-sm font-semibold text-slate-700 mb-1">
                    {dragOver ? 'Drop your file here' : (
                      <>Drag & drop your file, or <span className="text-accent-600 underline underline-offset-2">browse</span></>
                    )}
                  </p>
                  <p className="text-xs text-slate-400">
                    .csv or .xlsx · Max 10MB
                  </p>
                </div>
              ) : (
                <div className="border-2 border-accent-200 bg-accent-50/30 rounded-xl p-5 animate-fade-in">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl bg-white border border-accent-200 flex items-center justify-center shadow-sm">
                        {file.name.endsWith('.csv') ? (
                          <FileText size={22} className="text-accent-600" />
                        ) : (
                          <FileSpreadsheet size={22} className="text-accent-600" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-800">{file.name}</p>
                        <p className="text-xs text-slate-500">
                          {(file.size / 1024).toFixed(1)} KB · Importing as {selectedEntity?.label}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleUpload}
                        disabled={uploading}
                        className="flex items-center gap-2 bg-accent-500 hover:bg-accent-600 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors disabled:opacity-50 shadow-sm"
                      >
                        {uploading ? (
                          <><Loader2 size={16} className="animate-spin" /> Importing...</>
                        ) : (
                          <><Upload size={16} /> Import now</>
                        )}
                      </button>
                      <button onClick={clearFile} disabled={uploading} className="p-2.5 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50">
                        <X size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Column reference */}
          <div className="bg-white rounded-2xl border border-surface-200 shadow-card overflow-hidden">
            <div className="px-5 py-3 border-b border-surface-100 bg-surface-50/50 flex items-center gap-2">
              <Info size={14} className="text-slate-400" />
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Column reference</h3>
            </div>
            <div className="p-4">
              <div className="flex flex-wrap gap-2">
                {columns.map((col) => (
                  <span
                    key={col.name}
                    className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1.5 rounded-lg border ${
                      col.required
                        ? 'bg-red-50 text-red-700 border-red-200'
                        : 'bg-surface-50 text-slate-500 border-surface-200'
                    }`}
                  >
                    {col.name}
                    {col.required && (
                      <span className="text-[10px] text-red-400 font-bold">*</span>
                    )}
                  </span>
                ))}
              </div>
              <p className="text-[11px] text-slate-400 mt-2.5">
                <span className="text-red-400 font-bold">*</span> Required — rows missing these will fail
              </p>
            </div>
          </div>
        </div>

        {/* Side panel — Results + tips — 2 cols */}
        <div className="lg:col-span-2 space-y-6">
          {/* Results */}
          <div className="bg-white rounded-2xl border border-surface-200 shadow-card overflow-hidden sticky top-24">
            <div className="px-5 py-4 border-b border-surface-100 bg-surface-50/50">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <span className="w-6 h-6 rounded-md bg-slate-400 text-white text-xs flex items-center justify-center font-bold">3</span>
                Results
              </h3>
            </div>

            <div className="p-5">
              {!result ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 rounded-2xl bg-surface-100 flex items-center justify-center mx-auto mb-4">
                    <FileSpreadsheet size={26} className="text-slate-300" />
                  </div>
                  <p className="text-sm font-medium text-slate-500 mb-1">No results yet</p>
                  <p className="text-xs text-slate-400">Upload a file to see the import summary here.</p>
                </div>
              ) : (
                <div className="space-y-5 animate-fade-in">
                  {/* Progress bar */}
                  <div className="relative pt-1">
                    <div className="flex mb-2 items-center justify-between">
                      <span className="text-xs font-semibold text-slate-500">Import progress</span>
                      <span className="text-xs font-bold text-slate-700">
                        {result.totalRows > 0 ? Math.round((result.successCount / result.totalRows) * 100) : 0}%
                      </span>
                    </div>
                    <div className="overflow-hidden h-2.5 rounded-full bg-surface-200">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ease-out ${
                          result.errorCount === 0 ? 'bg-emerald-500' : result.errorCount < result.totalRows ? 'bg-amber-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${result.totalRows > 0 ? Math.round((result.successCount / result.totalRows) * 100) : 0}%` }}
                      />
                    </div>
                  </div>

                  {/* Stat pills */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-surface-50 rounded-xl p-3.5 text-center border border-surface-100">
                      <p className="text-[22px] font-bold text-slate-800">{result.totalRows}</p>
                      <p className="text-[11px] text-slate-500 font-medium">Total rows</p>
                    </div>
                    <div className="bg-emerald-50 rounded-xl p-3.5 text-center border border-emerald-100">
                      <p className="text-[22px] font-bold text-emerald-700">{result.successCount}</p>
                      <p className="text-[11px] text-emerald-600 font-medium">Imported</p>
                    </div>
                    <div className={`rounded-xl p-3.5 text-center border ${result.errorCount > 0 ? 'bg-red-50 border-red-100' : 'bg-surface-50 border-surface-100'}`}>
                      <p className={`text-[22px] font-bold ${result.errorCount > 0 ? 'text-red-600' : 'text-slate-400'}`}>{result.errorCount}</p>
                      <p className={`text-[11px] font-medium ${result.errorCount > 0 ? 'text-red-500' : 'text-slate-500'}`}>Errors</p>
                    </div>
                  </div>

                  {/* Error list */}
                  {result.errors && result.errors.length > 0 && (
                    <div>
                      <p className="text-xs font-bold text-red-600 mb-2 flex items-center gap-1.5">
                        <AlertCircle size={13} />
                        Error details
                      </p>
                      <div className="max-h-56 overflow-y-auto space-y-1.5 pr-1">
                        {result.errors.map((err, idx) => (
                          <div key={idx} className="flex items-start gap-2 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                            <span className="text-[11px] font-bold text-red-400 shrink-0 bg-red-100 px-1.5 py-0.5 rounded">R{err.row}</span>
                            <span className="text-xs text-red-700 leading-relaxed">{err.message}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {result.errorCount === 0 && (
                    <div className="flex items-center gap-2.5 bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-3">
                      <CheckCircle size={18} className="text-emerald-500 shrink-0" />
                      <span className="text-sm text-emerald-700 font-semibold">All {result.successCount} rows imported successfully!</span>
                    </div>
                  )}

                  <button onClick={clearFile} className="w-full py-2.5 rounded-xl border border-surface-200 text-sm font-medium text-slate-600 hover:bg-surface-50 transition-colors">
                    Upload another file
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Quick tips */}
          <div className="bg-gradient-to-br from-surface-50 to-surface-100 rounded-2xl border border-surface-200 p-5">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Quick tips</h4>
            <ul className="space-y-2.5">
              <li className="flex items-start gap-2 text-xs text-slate-600">
                <span className="w-4 h-4 rounded-full bg-accent-100 text-accent-700 flex items-center justify-center shrink-0 mt-0.5 text-[10px] font-bold">1</span>
                Download the template to get the exact column names.
              </li>
              <li className="flex items-start gap-2 text-xs text-slate-600">
                <span className="w-4 h-4 rounded-full bg-accent-100 text-accent-700 flex items-center justify-center shrink-0 mt-0.5 text-[10px] font-bold">2</span>
                Fill in your data — leave optional columns blank if not needed.
              </li>
              <li className="flex items-start gap-2 text-xs text-slate-600">
                <span className="w-4 h-4 rounded-full bg-accent-100 text-accent-700 flex items-center justify-center shrink-0 mt-0.5 text-[10px] font-bold">3</span>
                Save as .csv (recommended) or .xlsx and upload.
              </li>
              <li className="flex items-start gap-2 text-xs text-slate-600">
                <span className="w-4 h-4 rounded-full bg-accent-100 text-accent-700 flex items-center justify-center shrink-0 mt-0.5 text-[10px] font-bold">4</span>
                Rows with errors are skipped — you can fix and re-upload.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
