import { useState } from 'react';
import { X } from 'lucide-react';
import axiosClient from '../../api/axiosClient';

const EXAM_TYPE_SUGGESTIONS = ['CAT (Continuous Assessment Test)', 'Mid Term', 'End Term', 'Opener', 'Mock', 'Main Exam'];

export default function ExamModal({ initialData, terms, classSections, subjects, onClose, onSaved }) {
    const isEdit = Boolean(initialData);

    const [name, setName] = useState(initialData?.name || '');
    const [examType, setExamType] = useState(initialData?.examType || '');
    const [termId, setTermId] = useState(initialData?.termId?.toString() || '');
    const [selectedClassIds, setSelectedClassIds] = useState(initialData?.classSections?.map((c) => c.id) || []);
    const [selectedSubjectIds, setSelectedSubjectIds] = useState(initialData?.subjects?.map((s) => s.id) || []);
    const [error, setError] = useState('');
    const [saving, setSaving] = useState(false);

    const toggle = (list, setList, id) => {
        setList(list.includes(id) ? list.filter((x) => x !== id) : [...list, id]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (selectedClassIds.length === 0) return setError('Select at least one class');
        if (selectedSubjectIds.length === 0) return setError('Select at least one subject');
        setSaving(true);
        try {
            const payload = {
                name, examType, termId: Number(termId),
                classSectionIds: selectedClassIds,
                subjectIds: selectedSubjectIds,
            };
            if (isEdit) await axiosClient.put(`/exams/${initialData.id}`, payload);
            else await axiosClient.post('/exams', payload);
            onSaved();
        } catch (err) {
            setError(err.response?.data?.message || 'Something went wrong');
        } finally { setSaving(false); }
    };

    return (
        <div className="fixed inset-0 bg-slate-900/40 flex items-center justify-center z-50 px-4 py-8 overflow-y-auto">
            <div className="bg-white rounded-xl w-full max-w-lg p-6 shadow-xl my-auto">
                <div className="flex items-center justify-between mb-5">
                    <h2 className="text-lg font-bold text-slate-900">{isEdit ? 'Edit exam' : 'Add exam'}</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Exam name</label>
                        <input required value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Opening Term 2"
                               className="w-full px-3 py-2.5 rounded-lg bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-accent" />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">Exam type</label>
                            <input required value={examType} onChange={(e) => setExamType(e.target.value)} list="exam-type-suggestions" placeholder="e.g. CAT"
                                   className="w-full px-3 py-2.5 rounded-lg bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-accent" />
                            <datalist id="exam-type-suggestions">
                                {EXAM_TYPE_SUGGESTIONS.map((t) => <option key={t} value={t} />)}
                            </datalist>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">Term</label>
                            <select required value={termId} onChange={(e) => setTermId(e.target.value)}
                                    className="w-full px-3 py-2.5 rounded-lg bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-accent">
                                <option value="">Select term...</option>
                                {terms.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Classes covered</label>
                        <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto border border-slate-200 rounded-lg p-3">
                            {classSections.map((c) => (
                                <label key={c.id} className="flex items-center gap-2 text-sm text-slate-600">
                                    <input type="checkbox" checked={selectedClassIds.includes(c.id)}
                                           onChange={() => toggle(selectedClassIds, setSelectedClassIds, c.id)}
                                           className="rounded border-slate-300 text-teal-600 focus:ring-teal-accent" />
                                    {c.name}
                                </label>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Subjects covered</label>
                        <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto border border-slate-200 rounded-lg p-3">
                            {subjects.map((s) => (
                                <label key={s.id} className="flex items-center gap-2 text-sm text-slate-600">
                                    <input type="checkbox" checked={selectedSubjectIds.includes(s.id)}
                                           onChange={() => toggle(selectedSubjectIds, setSelectedSubjectIds, s.id)}
                                           className="rounded border-slate-300 text-teal-600 focus:ring-teal-accent" />
                                    {s.name}
                                </label>
                            ))}
                        </div>
                    </div>

                    {error && <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</p>}

                    <div className="flex gap-3 pt-2">
                        <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50">Cancel</button>
                        <button type="submit" disabled={saving} className="flex-1 py-2.5 rounded-lg bg-navy-900 hover:bg-navy-800 text-white text-sm font-medium disabled:opacity-60">
                            {saving ? 'Saving...' : isEdit ? 'Save changes' : 'Add exam'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}