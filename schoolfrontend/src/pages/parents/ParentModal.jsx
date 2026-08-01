import { useState, useEffect } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import axiosClient from '../../api/axiosClient';
import TempPasswordModal from '../../components/shared/TempPasswordModal';

export default function ParentModal({ initialData, onClose, onSaved }) {
    const isEdit = !!initialData;
    const [firstName, setFirstName] = useState(initialData?.firstName || '');
    const [lastName, setLastName] = useState(initialData?.lastName || '');
    const [email, setEmail] = useState(initialData?.email || '');
    const [occupation, setOccupation] = useState(initialData?.occupation || '');
    const [alternatePhone, setAlternatePhone] = useState(initialData?.alternatePhone || '');
    const [address, setAddress] = useState(initialData?.address || '');
    const [children, setChildren] = useState(initialData?.children || []);
    const [allStudents, setAllStudents] = useState([]);
    const [selectedStudentId, setSelectedStudentId] = useState('');
    const [error, setError] = useState('');
    const [saving, setSaving] = useState(false);
    const [createdCredentials, setCreatedCredentials] = useState(null);

    useEffect(() => {
        axiosClient.get('/students').then(res => setAllStudents(res.data)).catch(() => {});
    }, []);

    const availableStudents = allStudents.filter(
        s => !children.some(c => c.id === s.id)
    );

    const handleLinkChild = () => {
        if (!selectedStudentId) return;
        const student = allStudents.find(s => s.id === Number(selectedStudentId));
        if (student) {
            setChildren(prev => [...prev, { id: student.id, firstName: student.firstName, lastName: student.lastName, classSectionName: student.classSectionName }]);
            setSelectedStudentId('');
        }
    };

    const handleUnlinkChild = (studentId) => {
        setChildren(prev => prev.filter(c => c.id !== studentId));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSaving(true);

        try {
            const payload = {
                firstName,
                lastName,
                email,
                occupation,
                alternatePhone,
                address,
                studentIds: children.map(c => c.id),
            };

            if (isEdit) {
                await axiosClient.put(`/parents/${initialData.id}`, payload);
                onSaved();
            } else {
                const { data } = await axiosClient.post('/parents', payload);
                setCreatedCredentials({ username: data.username, temporaryPassword: 'Auto-generated (see server logs)' });
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Something went wrong');
        } finally {
            setSaving(false);
        }
    };

    if (createdCredentials) {
        return (
            <TempPasswordModal
                username={createdCredentials.username}
                temporaryPassword={createdCredentials.temporaryPassword}
                onClose={onSaved}
            />
        );
    }

    return (
        <div className="fixed inset-0 bg-slate-900/40 flex items-center justify-center z-50 px-4">
            <div className="bg-white rounded-xl w-full max-w-lg p-6 shadow-xl max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-5">
                    <h2 className="text-lg font-bold text-slate-900">{isEdit ? 'Edit parent' : 'Add parent'}</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">First name</label>
                            <input required value={firstName} onChange={(e) => setFirstName(e.target.value)}
                                   className="w-full px-3 py-2.5 rounded-lg bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-accent" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">Last name</label>
                            <input required value={lastName} onChange={(e) => setLastName(e.target.value)}
                                   className="w-full px-3 py-2.5 rounded-lg bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-accent" />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
                        <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                               className="w-full px-3 py-2.5 rounded-lg bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-accent" />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Occupation</label>
                        <input value={occupation} onChange={(e) => setOccupation(e.target.value)} placeholder="e.g. Engineer, Business Owner"
                               className="w-full px-3 py-2.5 rounded-lg bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-accent" />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">Alternate phone</label>
                            <input value={alternatePhone} onChange={(e) => setAlternatePhone(e.target.value)} placeholder="+254 7..."
                                   className="w-full px-3 py-2.5 rounded-lg bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-accent" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">Address</label>
                            <input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="City, Town"
                                   className="w-full px-3 py-2.5 rounded-lg bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-accent" />
                        </div>
                    </div>

                    {/* Linked Children */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Linked Children</label>
                        {children.length > 0 && (
                            <div className="mb-2 space-y-1">
                                {children.map(c => (
                                    <div key={c.id} className="flex items-center justify-between bg-slate-50 rounded-lg px-3 py-1.5 text-sm">
                                        <span className="text-slate-700">{c.firstName} {c.lastName} {c.classSectionName ? `(${c.classSectionName})` : ''}</span>
                                        <button type="button" onClick={() => handleUnlinkChild(c.id)} className="text-red-400 hover:text-red-600">
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                        {availableStudents.length > 0 && (
                            <div className="flex gap-2">
                                <select value={selectedStudentId} onChange={(e) => setSelectedStudentId(e.target.value)}
                                        className="flex-1 px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-accent">
                                    <option value="">Select a student...</option>
                                    {availableStudents.map(s => (
                                        <option key={s.id} value={s.id}>{s.firstName} {s.lastName} {s.classSectionName ? `(${s.classSectionName})` : ''}</option>
                                    ))}
                                </select>
                                <button type="button" onClick={handleLinkChild} disabled={!selectedStudentId}
                                        className="flex items-center gap-1 px-3 py-2 rounded-lg bg-teal-accent/10 text-teal-700 text-sm font-medium hover:bg-teal-accent/20 transition-colors disabled:opacity-50">
                                    <Plus size={14} /> Link
                                </button>
                            </div>
                        )}
                    </div>

                    {error && <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</p>}

                    <div className="flex gap-3 pt-2">
                        <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50">Cancel</button>
                        <button type="submit" disabled={saving} className="flex-1 py-2.5 rounded-lg bg-navy-900 hover:bg-navy-800 text-white text-sm font-medium disabled:opacity-60">
                            {saving ? 'Saving...' : isEdit ? 'Update parent' : 'Create parent'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}