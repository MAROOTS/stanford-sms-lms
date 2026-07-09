import { useState } from 'react';
import { X } from 'lucide-react';
import axiosClient from '../../api/axiosClient';

const STAGE_SUGGESTIONS = ['Pre-Primary', 'Lower Primary', 'Upper Primary', 'Junior School', 'Senior School'];

export default function ClassSectionModal({ initialData, gradeLevels, teachers, onClose, onSaved }) {
    const isEdit = Boolean(initialData);

    const [name, setName] = useState(initialData?.name || '');
    const [gradeLevelId, setGradeLevelId] = useState(initialData?.gradeLevelId?.toString() || '');
    const [homeroomTeacherId, setHomeroomTeacherId] = useState(initialData?.homeroomTeacherId?.toString() || '');
    const [creatingGradeLevel, setCreatingGradeLevel] = useState(false);
    const [newGradeLevelName, setNewGradeLevelName] = useState('');
    const [newGradeLevelStage, setNewGradeLevelStage] = useState('');
    const [error, setError] = useState('');
    const [saving, setSaving] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSaving(true);
        try {
            let resolvedGradeLevelId = gradeLevelId;

            if (creatingGradeLevel) {
                if (!newGradeLevelName.trim()) throw new Error('Grade level name is required');
                const nextSortOrder = gradeLevels.length
                    ? Math.max(...gradeLevels.map((g) => g.sortOrder)) + 1
                    : 1;
                const { data } = await axiosClient.post('/grade-levels', {
                    name: newGradeLevelName,
                    stage: newGradeLevelStage || null,
                    sortOrder: nextSortOrder,
                });
                resolvedGradeLevelId = data.id;
            }

            if (!resolvedGradeLevelId) throw new Error('Select or create a grade level');

            const payload = {
                name,
                gradeLevelId: Number(resolvedGradeLevelId),
                homeroomTeacherId: homeroomTeacherId ? Number(homeroomTeacherId) : null,
            };

            if (isEdit) {
                await axiosClient.put(`/class-sections/${initialData.id}`, payload);
            } else {
                await axiosClient.post('/class-sections', payload);
            }

            onSaved();
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Something went wrong');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-slate-900/40 flex items-center justify-center z-50 px-4">
            <div className="bg-white rounded-xl w-full max-w-md p-6 shadow-xl">
                <div className="flex items-center justify-between mb-5">
                    <h2 className="text-lg font-bold text-slate-900">{isEdit ? 'Edit class' : 'Add class'}</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Class name</label>
                        <input
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g. Grade 7 Blue"
                            className="w-full px-3 py-2.5 rounded-lg bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-accent"
                        />
                    </div>

                    <div>
                        <div className="flex items-center justify-between mb-1.5">
                            <label className="block text-sm font-medium text-slate-700">Grade level</label>
                            <button
                                type="button"
                                onClick={() => setCreatingGradeLevel((v) => !v)}
                                className="text-xs font-medium text-teal-600 hover:text-teal-700"
                            >
                                {creatingGradeLevel ? 'Choose existing instead' : '+ Create new'}
                            </button>
                        </div>

                        {!creatingGradeLevel ? (
                            <select
                                required
                                value={gradeLevelId}
                                onChange={(e) => setGradeLevelId(e.target.value)}
                                className="w-full px-3 py-2.5 rounded-lg bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-accent"
                            >
                                <option value="">Select grade level...</option>
                                {gradeLevels.map((g) => (
                                    <option key={g.id} value={g.id}>
                                        {g.name}{g.stage ? ` (${g.stage})` : ''}
                                    </option>
                                ))}
                            </select>
                        ) : (
                            <div className="space-y-2">
                                <input
                                    value={newGradeLevelName}
                                    onChange={(e) => setNewGradeLevelName(e.target.value)}
                                    placeholder="e.g. Grade 8"
                                    className="w-full px-3 py-2.5 rounded-lg bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-accent"
                                />
                                <input
                                    value={newGradeLevelStage}
                                    onChange={(e) => setNewGradeLevelStage(e.target.value)}
                                    placeholder="Stage (e.g. Junior School)"
                                    list="stage-suggestions"
                                    className="w-full px-3 py-2.5 rounded-lg bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-accent"
                                />
                                <datalist id="stage-suggestions">
                                    {STAGE_SUGGESTIONS.map((s) => <option key={s} value={s} />)}
                                </datalist>
                            </div>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">
                            Homeroom teacher <span className="text-slate-400 font-normal">(optional)</span>
                        </label>
                        <select
                            value={homeroomTeacherId}
                            onChange={(e) => setHomeroomTeacherId(e.target.value)}
                            className="w-full px-3 py-2.5 rounded-lg bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-accent"
                        >
                            <option value="">None</option>
                            {teachers.map((t) => (
                                <option key={t.id} value={t.id}>{t.firstName} {t.lastName}</option>
                            ))}
                        </select>
                    </div>

                    {error && (
                        <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                            {error}
                        </p>
                    )}

                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-2.5 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={saving}
                            className="flex-1 py-2.5 rounded-lg bg-navy-900 hover:bg-navy-800 text-white text-sm font-medium disabled:opacity-60"
                        >
                            {saving ? 'Saving...' : isEdit ? 'Save changes' : 'Add class'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}