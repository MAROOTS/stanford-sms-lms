import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import axiosClient from '../../api/axiosClient';

export default function ApplicationModal({ initialData, onClose, onSaved }) {
    const isEdit = Boolean(initialData);

    const [firstName, setFirstName] = useState(initialData?.firstName || '');
    const [lastName, setLastName] = useState(initialData?.lastName || '');
    const [dateOfBirth, setDateOfBirth] = useState(initialData?.dateOfBirth || '');
    const [desiredGradeLevelId, setDesiredGradeLevelId] = useState(initialData?.desiredGradeLevelId?.toString() || '');
    const [guardianName, setGuardianName] = useState(initialData?.guardianName || '');
    const [guardianEmail, setGuardianEmail] = useState(initialData?.guardianEmail || '');
    const [guardianPhone, setGuardianPhone] = useState(initialData?.guardianPhone || '');
    const [studentEmail, setStudentEmail] = useState(initialData?.studentEmail || '');
    const [previousSchool, setPreviousSchool] = useState(initialData?.previousSchool || '');
    const [notes, setNotes] = useState(initialData?.notes || '');
    const [gradeLevels, setGradeLevels] = useState([]);
    const [error, setError] = useState('');
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        axiosClient.get('/grade-levels').then((res) => setGradeLevels(res.data));
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(''); setSaving(true);
        try {
            const payload = {
                firstName, lastName,
                dateOfBirth: dateOfBirth || null,
                desiredGradeLevelId: desiredGradeLevelId ? Number(desiredGradeLevelId) : null,
                guardianName, guardianEmail, guardianPhone,
                studentEmail: studentEmail || null,
                previousSchool: previousSchool || null,
                notes: notes || null,
            };
            if (isEdit) await axiosClient.put(`/admissions/${initialData.id}`, payload);
            else await axiosClient.post('/admissions', payload);
            onSaved();
        } catch (err) {
            setError(err.response?.data?.message || 'Something went wrong');
        } finally { setSaving(false); }
    };

    return (
        <div className="fixed inset-0 bg-slate-900/40 flex items-center justify-center z-50 px-4 py-8 overflow-y-auto">
            <div className="bg-white rounded-xl w-full max-w-lg p-6 shadow-xl my-auto">
                <div className="flex items-center justify-between mb-5">
                    <h2 className="text-lg font-bold text-slate-900">{isEdit ? 'Edit application' : 'New application'}</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <p className="text-xs font-semibold tracking-wider text-slate-400">APPLICANT</p>
                    <div className="grid grid-cols-2 gap-3">
                        <input required placeholder="First name" value={firstName} onChange={(e) => setFirstName(e.target.value)}
                               className="w-full px-3 py-2.5 rounded-lg bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-accent" />
                        <input required placeholder="Last name" value={lastName} onChange={(e) => setLastName(e.target.value)}
                               className="w-full px-3 py-2.5 rounded-lg bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-accent" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs text-slate-500 mb-1">Date of birth</label>
                            <input type="date" value={dateOfBirth} onChange={(e) => setDateOfBirth(e.target.value)}
                                   className="w-full px-3 py-2.5 rounded-lg bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-accent" />
                        </div>
                        <div>
                            <label className="block text-xs text-slate-500 mb-1">Desired grade level</label>
                            <select value={desiredGradeLevelId} onChange={(e) => setDesiredGradeLevelId(e.target.value)}
                                    className="w-full px-3 py-2.5 rounded-lg bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-accent">
                                <option value="">Not specified</option>
                                {gradeLevels.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
                            </select>
                        </div>
                    </div>
                    <input placeholder="Previous school (optional)" value={previousSchool} onChange={(e) => setPreviousSchool(e.target.value)}
                           className="w-full px-3 py-2.5 rounded-lg bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-accent" />
                    <input type="email" placeholder="Student email (optional)" value={studentEmail} onChange={(e) => setStudentEmail(e.target.value)}
                           className="w-full px-3 py-2.5 rounded-lg bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-accent" />

                    <p className="text-xs font-semibold tracking-wider text-slate-400 pt-2">GUARDIAN</p>
                    <input required placeholder="Guardian full name" value={guardianName} onChange={(e) => setGuardianName(e.target.value)}
                           className="w-full px-3 py-2.5 rounded-lg bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-accent" />
                    <div className="grid grid-cols-2 gap-3">
                        <input required type="email" placeholder="Guardian email" value={guardianEmail} onChange={(e) => setGuardianEmail(e.target.value)}
                               className="w-full px-3 py-2.5 rounded-lg bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-accent" />
                        <input required placeholder="Guardian phone" value={guardianPhone} onChange={(e) => setGuardianPhone(e.target.value)}
                               className="w-full px-3 py-2.5 rounded-lg bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-accent" />
                    </div>

                    <textarea rows={2} placeholder="Notes (optional)" value={notes} onChange={(e) => setNotes(e.target.value)}
                              className="w-full px-3 py-2.5 rounded-lg bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-accent resize-none" />

                    {error && <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</p>}

                    <div className="flex gap-3 pt-2">
                        <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50">Cancel</button>
                        <button type="submit" disabled={saving} className="flex-1 py-2.5 rounded-lg bg-navy-900 hover:bg-navy-800 text-white text-sm font-medium disabled:opacity-60">
                            {saving ? 'Saving...' : isEdit ? 'Save changes' : 'Log application'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}