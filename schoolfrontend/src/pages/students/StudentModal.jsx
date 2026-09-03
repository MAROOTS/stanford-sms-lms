import { useState } from 'react';
import { X } from 'lucide-react';
import axiosClient from '../../api/axiosClient';

const field =
    'w-full px-3 py-2.5 rounded-lg bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-accent disabled:opacity-60';

const emptyToNull = (v) => (v === '' || v == null ? null : v);

export default function StudentModal({ initialData, classSections, readOnly, onClose, onSaved }) {
    const [firstName, setFirstName] = useState(initialData?.firstName || '');
    const [lastName, setLastName] = useState(initialData?.lastName || '');
    const [email, setEmail] = useState(initialData?.email || '');
    const [classSectionId, setClassSectionId] = useState(initialData?.classSectionId?.toString() || '');
    const [admissionNumber, setAdmissionNumber] = useState(initialData?.admissionNumber || '');
    const [rollNumber, setRollNumber] = useState(initialData?.rollNumber || '');
    const [dateOfBirth, setDateOfBirth] = useState(initialData?.dateOfBirth || '');
    const [gender, setGender] = useState(initialData?.gender || '');
    const [nationality, setNationality] = useState(initialData?.nationality || '');
    const [religion, setReligion] = useState(initialData?.religion || '');
    const [admissionDate, setAdmissionDate] = useState(initialData?.admissionDate || '');
    const [birthCertificateNo, setBirthCertificateNo] = useState(initialData?.birthCertificateNo || '');
    const [address, setAddress] = useState(initialData?.address || '');
    const [previousSchool, setPreviousSchool] = useState(initialData?.previousSchool || '');
    const [guardianName, setGuardianName] = useState(initialData?.guardianName || '');
    const [guardianRelationship, setGuardianRelationship] = useState(initialData?.guardianRelationship || '');
    const [guardianPhone, setGuardianPhone] = useState(initialData?.guardianPhone || initialData?.parentContactNumber || '');
    const [guardianEmail, setGuardianEmail] = useState(initialData?.guardianEmail || '');
    const [emergencyContactName, setEmergencyContactName] = useState(initialData?.emergencyContactName || '');
    const [emergencyContactPhone, setEmergencyContactPhone] = useState(initialData?.emergencyContactPhone || '');
    const [bloodGroup, setBloodGroup] = useState(initialData?.bloodGroup || '');
    const [allergies, setAllergies] = useState(initialData?.allergies || '');
    const [medicalConditions, setMedicalConditions] = useState(initialData?.medicalConditions || '');
    const [error, setError] = useState('');
    const [saving, setSaving] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSaving(true);
        try {
            await axiosClient.put(`/students/${initialData.id}`, {
                firstName,
                lastName,
                email,
                classSectionId: classSectionId ? Number(classSectionId) : null,
                admissionNumber: emptyToNull(admissionNumber),
                rollNumber: emptyToNull(rollNumber),
                dateOfBirth: emptyToNull(dateOfBirth),
                gender: emptyToNull(gender),
                nationality: emptyToNull(nationality),
                religion: emptyToNull(religion),
                admissionDate: emptyToNull(admissionDate),
                birthCertificateNo: emptyToNull(birthCertificateNo),
                address: emptyToNull(address),
                previousSchool: emptyToNull(previousSchool),
                guardianName: emptyToNull(guardianName),
                guardianRelationship: emptyToNull(guardianRelationship),
                guardianPhone: emptyToNull(guardianPhone),
                guardianEmail: emptyToNull(guardianEmail),
                parentContactNumber: emptyToNull(guardianPhone),
                emergencyContactName: emptyToNull(emergencyContactName),
                emergencyContactPhone: emptyToNull(emergencyContactPhone),
                bloodGroup: emptyToNull(bloodGroup),
                allergies: emptyToNull(allergies),
                medicalConditions: emptyToNull(medicalConditions),
            });
            onSaved();
        } catch (err) {
            setError(err.response?.data?.message || 'Something went wrong');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-slate-900/40 flex items-center justify-center z-50 px-4 py-8 overflow-y-auto">
            <div className="bg-white rounded-xl w-full max-w-2xl p-6 shadow-xl my-auto max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-5">
                    <h2 className="text-lg font-bold text-slate-900">{readOnly ? 'Student details' : 'Edit student'}</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <p className="text-xs font-semibold tracking-wider text-slate-400 mb-3">STUDENT</p>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">First name</label>
                                <input required disabled={readOnly} value={firstName} onChange={(e) => setFirstName(e.target.value)} className={field} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">Last name</label>
                                <input required disabled={readOnly} value={lastName} onChange={(e) => setLastName(e.target.value)} className={field} />
                            </div>
                            <div className="col-span-2">
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
                                <input type="email" required disabled={readOnly} value={email} onChange={(e) => setEmail(e.target.value)} className={field} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">Class</label>
                                <select disabled={readOnly} value={classSectionId} onChange={(e) => setClassSectionId(e.target.value)} className={field}>
                                    <option value="">Unassigned</option>
                                    {classSections.map((c) => (
                                        <option key={c.id} value={c.id}>{c.name} ({c.gradeLevelName})</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">Roll number</label>
                                <input disabled={readOnly} value={rollNumber} onChange={(e) => setRollNumber(e.target.value)} className={field} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">Admission number</label>
                                <input disabled={readOnly} value={admissionNumber} onChange={(e) => setAdmissionNumber(e.target.value)} className={field} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">Date of birth</label>
                                <input type="date" disabled={readOnly} value={dateOfBirth} onChange={(e) => setDateOfBirth(e.target.value)} className={field} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">Gender</label>
                                <select disabled={readOnly} value={gender} onChange={(e) => setGender(e.target.value)} className={field}>
                                    <option value="">—</option>
                                    <option value="MALE">Male</option>
                                    <option value="FEMALE">Female</option>
                                    <option value="OTHER">Other</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">Nationality</label>
                                <input disabled={readOnly} value={nationality} onChange={(e) => setNationality(e.target.value)} className={field} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">Religion</label>
                                <input disabled={readOnly} value={religion} onChange={(e) => setReligion(e.target.value)} className={field} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">Admission date</label>
                                <input type="date" disabled={readOnly} value={admissionDate} onChange={(e) => setAdmissionDate(e.target.value)} className={field} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">Birth certificate no.</label>
                                <input disabled={readOnly} value={birthCertificateNo} onChange={(e) => setBirthCertificateNo(e.target.value)} className={field} />
                            </div>
                            <div className="col-span-2">
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">Address</label>
                                <input disabled={readOnly} value={address} onChange={(e) => setAddress(e.target.value)} className={field} />
                            </div>
                            <div className="col-span-2">
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">Previous school</label>
                                <input disabled={readOnly} value={previousSchool} onChange={(e) => setPreviousSchool(e.target.value)} className={field} />
                            </div>
                        </div>
                    </div>

                    <div>
                        <p className="text-xs font-semibold tracking-wider text-slate-400 mb-3">GUARDIAN</p>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">Name</label>
                                <input disabled={readOnly} value={guardianName} onChange={(e) => setGuardianName(e.target.value)} className={field} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">Relationship</label>
                                <input disabled={readOnly} value={guardianRelationship} onChange={(e) => setGuardianRelationship(e.target.value)} placeholder="Mother, Father…" className={field} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">Phone</label>
                                <input disabled={readOnly} value={guardianPhone} onChange={(e) => setGuardianPhone(e.target.value)} className={field} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
                                <input type="email" disabled={readOnly} value={guardianEmail} onChange={(e) => setGuardianEmail(e.target.value)} className={field} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">Emergency contact</label>
                                <input disabled={readOnly} value={emergencyContactName} onChange={(e) => setEmergencyContactName(e.target.value)} className={field} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">Emergency phone</label>
                                <input disabled={readOnly} value={emergencyContactPhone} onChange={(e) => setEmergencyContactPhone(e.target.value)} className={field} />
                            </div>
                        </div>
                    </div>

                    <div>
                        <p className="text-xs font-semibold tracking-wider text-slate-400 mb-3">MEDICAL</p>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">Blood group</label>
                                <input disabled={readOnly} value={bloodGroup} onChange={(e) => setBloodGroup(e.target.value)} placeholder="O+" className={field} />
                            </div>
                            <div className="col-span-2">
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">Allergies</label>
                                <textarea disabled={readOnly} value={allergies} onChange={(e) => setAllergies(e.target.value)} rows={2} className={field} />
                            </div>
                            <div className="col-span-2">
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">Medical conditions</label>
                                <textarea disabled={readOnly} value={medicalConditions} onChange={(e) => setMedicalConditions(e.target.value)} rows={2} className={field} />
                            </div>
                        </div>
                    </div>

                    {error && <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</p>}

                    {!readOnly && (
                        <div className="flex gap-3 pt-1">
                            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50">Cancel</button>
                            <button type="submit" disabled={saving} className="flex-1 py-2.5 rounded-lg bg-navy-900 hover:bg-navy-800 text-white text-sm font-medium disabled:opacity-60">
                                {saving ? 'Saving...' : 'Save changes'}
                            </button>
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
}