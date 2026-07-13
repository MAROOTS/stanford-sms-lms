import { useState, useMemo } from 'react';
import { X, Eye, EyeOff, Check, XCircle, ChevronDown, ChevronUp } from 'lucide-react';
import axiosClient from '../../api/axiosClient';

const PASSWORD_RULES = [
    { key: 'minLength', label: 'At least 8 characters', test: (p) => p.length >= 8 },
    { key: 'uppercase', label: 'One uppercase letter', test: (p) => /[A-Z]/.test(p) },
    { key: 'lowercase', label: 'One lowercase letter', test: (p) => /[a-z]/.test(p) },
    { key: 'digit', label: 'One digit', test: (p) => /[0-9]/.test(p) },
    { key: 'special', label: 'One special character', test: (p) => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/.test(p) },
];

const GENDER_OPTIONS = ['', 'Male', 'Female', 'Other'];
const BLOOD_GROUPS = ['', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const STATUS_OPTIONS = ['', 'ACTIVE', 'COMPLETED', 'DROPPED'];

export default function StudentModal({ initialData, classSections, onClose, onSaved, readOnly }) {
    const isEdit = Boolean(initialData);
    const isView = readOnly && isEdit;

    // Basic
    const [firstName, setFirstName] = useState(initialData?.firstName || '');
    const [middleName, setMiddleName] = useState(initialData?.middleName || '');
    const [lastName, setLastName] = useState(initialData?.lastName || '');
    const [email, setEmail] = useState(initialData?.email || '');
    const [dateOfBirth, setDateOfBirth] = useState(initialData?.dateOfBirth || '');
    const [gender, setGender] = useState(initialData?.gender || '');
    const [nationality, setNationality] = useState(initialData?.nationality || '');
    const [religion, setReligion] = useState(initialData?.religion || '');

    // Contact & Address
    const [address, setAddress] = useState(initialData?.address || '');
    const [city, setCity] = useState(initialData?.city || '');
    const [stateProvince, setStateProvince] = useState(initialData?.stateProvince || '');
    const [postalCode, setPostalCode] = useState(initialData?.postalCode || '');
    const [country, setCountry] = useState(initialData?.country || '');
    const [phoneNumber, setPhoneNumber] = useState(initialData?.phoneNumber || '');

    // Guardian
    const [guardianName, setGuardianName] = useState(initialData?.guardianName || '');
    const [guardianRelationship, setGuardianRelationship] = useState(initialData?.guardianRelationship || '');
    const [guardianEmail, setGuardianEmail] = useState(initialData?.guardianEmail || '');
    const [guardianPhone, setGuardianPhone] = useState(initialData?.guardianPhone || '');
    const [emergencyContactName, setEmergencyContactName] = useState(initialData?.emergencyContactName || '');
    const [emergencyContactPhone, setEmergencyContactPhone] = useState(initialData?.emergencyContactPhone || '');

    // Medical
    const [bloodGroup, setBloodGroup] = useState(initialData?.bloodGroup || '');
    const [medicalNotes, setMedicalNotes] = useState(initialData?.medicalNotes || '');

    // Academic
    const [admissionNumber, setAdmissionNumber] = useState(initialData?.admissionNumber || '');
    const [rollNumber, setRollNumber] = useState(initialData?.rollNumber || '');
    const [classSectionId, setClassSectionId] = useState(initialData?.classSectionId?.toString() || '');
    const [enrollmentDate, setEnrollmentDate] = useState(initialData?.enrollmentDate || '');
    const [enrollmentStatus, setEnrollmentStatus] = useState(initialData?.enrollmentStatus || 'ACTIVE');
    const [previousSchool, setPreviousSchool] = useState(initialData?.previousSchool || '');

    // Password
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [fieldErrors, setFieldErrors] = useState({});
    const [saving, setSaving] = useState(false);

    // Collapsible sections
    const [sections, setSections] = useState({
        basic: true,
        contact: false,
        guardian: false,
        medical: false,
        academic: false,
    });

    const toggleSection = (key) => setSections((s) => ({ ...s, [key]: !s[key] }));

    const passwordChecks = useMemo(() => PASSWORD_RULES.map((rule) => ({
        ...rule, passed: rule.test(password),
    })), [password]);

    const isPasswordValid = passwordChecks.every((c) => c.passed);
    const confirmMismatch = confirmPassword && password !== confirmPassword;

    const validateForm = () => {
        const errors = {};
        if (!firstName.trim()) errors.firstName = 'First name is required';
        if (!lastName.trim()) errors.lastName = 'Last name is required';
        if (!email.trim()) errors.email = 'Email is required';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = 'Invalid email format';
        if (!isEdit) {
            if (!password) errors.password = 'Password is required';
            else if (!isPasswordValid) errors.password = 'Password does not meet all requirements';
            if (!confirmPassword) errors.confirmPassword = 'Confirm password is required';
            else if (confirmPassword !== password) errors.confirmPassword = 'Passwords do not match';
        }
        setFieldErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;
        setFieldErrors({});
        setSaving(true);
        try {
            const payload = {
                firstName, middleName, lastName, email,
                dateOfBirth: dateOfBirth || null,
                gender: gender || null,
                nationality: nationality || null,
                religion: religion || null,
                address: address || null,
                city: city || null,
                stateProvince: stateProvince || null,
                postalCode: postalCode || null,
                country: country || null,
                phoneNumber: phoneNumber || null,
                guardianName: guardianName || null,
                guardianRelationship: guardianRelationship || null,
                guardianEmail: guardianEmail || null,
                guardianPhone: guardianPhone || null,
                emergencyContactName: emergencyContactName || null,
                emergencyContactPhone: emergencyContactPhone || null,
                bloodGroup: bloodGroup || null,
                medicalNotes: medicalNotes || null,
                admissionNumber, rollNumber: rollNumber || null,
                enrollmentDate: enrollmentDate || null,
                enrollmentStatus: enrollmentStatus || 'ACTIVE',
                previousSchool: previousSchool || null,
            };

            if (isEdit) {
                await axiosClient.put(`/students/${initialData.id}`, {
                    ...payload,
                    classSectionId: classSectionId ? Number(classSectionId) : null,
                });
            } else {
                const { data } = await axiosClient.post('/admin/users', {
                    ...payload,
                    password,
                    confirmPassword,
                    role: 'STUDENT',
                });
                if (classSectionId) {
                    await axiosClient.patch(`/students/${data.id}/section`, {
                        classSectionId: Number(classSectionId),
                    });
                }
            }
            onSaved();
        } catch (err) {
            const responseData = err.response?.data;
            if (responseData?.errors && typeof responseData.errors === 'object') {
                const serverErrors = {};
                for (const [field, msg] of Object.entries(responseData.errors))
                    serverErrors[field] = msg;
                setFieldErrors(serverErrors);
            } else {
                setFieldErrors({ _global: responseData?.message || err.message || 'Something went wrong' });
            }
        } finally {
            setSaving(false);
        }
    };

    const inputClass = (field) =>
        `w-full px-3 py-2 rounded-lg bg-slate-50 border text-sm focus:outline-none focus:ring-2 focus:ring-teal-accent disabled:opacity-60 disabled:cursor-not-allowed ${
            fieldErrors[field] ? 'border-red-300 bg-red-50/50' : 'border-slate-200'
        }`;

    const labelClass = 'block text-xs font-medium text-slate-500 mb-1';

    const SectionHeader = ({ title, sectionKey }) => (
        <button
            type="button"
            onClick={() => toggleSection(sectionKey)}
            className="w-full flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-surface-50 transition-colors"
        >
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{title}</span>
            {sections[sectionKey] ? <ChevronUp size={14} className="text-slate-400" /> : <ChevronDown size={14} className="text-slate-400" />}
        </button>
    );

    return (
        <div className="fixed inset-0 bg-slate-900/40 flex items-center justify-center z-50 px-4" onClick={onClose}>
            <div className="bg-white rounded-2xl w-full max-w-2xl shadow-elevated max-h-[92vh] overflow-y-auto animate-fade-in" onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-surface-100 sticky top-0 bg-white z-10">
                    <h2 className="text-lg font-bold text-slate-900">{isView ? 'View student' : isEdit ? 'Edit student' : 'Add student'}</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-surface-50">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} noValidate className="divide-y divide-surface-100">
                    {/* ── Basic Info Section ── */}
                    <div className="px-6 py-4">
                        <SectionHeader title="Basic Information" sectionKey="basic" />
                        {sections.basic && (
                            <div className="space-y-3 mt-2">
                                <div className="grid grid-cols-3 gap-3">
                                    <div>
                                        <label className={labelClass}>First name *</label>
                                        <input value={firstName} disabled={isView}
                                            onChange={(e) => { setFirstName(e.target.value); setFieldErrors((p) => ({ ...p, firstName: undefined })); }}
                                            className={inputClass('firstName')} />
                                        {fieldErrors.firstName && <p className="text-xs text-red-600 mt-1">{fieldErrors.firstName}</p>}
                                    </div>
                                    <div>
                                        <label className={labelClass}>Middle name</label>
                                        <input value={middleName} disabled={isView}
                                            onChange={(e) => setMiddleName(e.target.value)}
                                            className={inputClass('middleName')} />
                                    </div>
                                    <div>
                                        <label className={labelClass}>Last name *</label>
                                        <input value={lastName} disabled={isView}
                                            onChange={(e) => { setLastName(e.target.value); setFieldErrors((p) => ({ ...p, lastName: undefined })); }}
                                            className={inputClass('lastName')} />
                                        {fieldErrors.lastName && <p className="text-xs text-red-600 mt-1">{fieldErrors.lastName}</p>}
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className={labelClass}>Email *</label>
                                        <input type="email" value={email} disabled={isView}
                                            onChange={(e) => { setEmail(e.target.value); setFieldErrors((p) => ({ ...p, email: undefined })); }}
                                            className={inputClass('email')} />
                                        {fieldErrors.email && <p className="text-xs text-red-600 mt-1">{fieldErrors.email}</p>}
                                    </div>
                                    <div>
                                        <label className={labelClass}>Phone number</label>
                                        <input value={phoneNumber} disabled={isView}
                                            onChange={(e) => setPhoneNumber(e.target.value)}
                                            className={inputClass('phoneNumber')} placeholder="Student's phone" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-4 gap-3">
                                    <div>
                                        <label className={labelClass}>Date of birth</label>
                                        <input type="date" value={dateOfBirth} disabled={isView}
                                            onChange={(e) => setDateOfBirth(e.target.value)}
                                            className={inputClass('dateOfBirth')} />
                                    </div>
                                    <div>
                                        <label className={labelClass}>Gender</label>
                                        <select value={gender} disabled={isView}
                                            onChange={(e) => setGender(e.target.value)}
                                            className={inputClass('gender')}>
                                            {GENDER_OPTIONS.map((o) => <option key={o} value={o}>{o || 'Select...'}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className={labelClass}>Nationality</label>
                                        <input value={nationality} disabled={isView}
                                            onChange={(e) => setNationality(e.target.value)}
                                            className={inputClass('nationality')} />
                                    </div>
                                    <div>
                                        <label className={labelClass}>Religion</label>
                                        <input value={religion} disabled={isView}
                                            onChange={(e) => setReligion(e.target.value)}
                                            className={inputClass('religion')} />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* ── Contact & Address Section ── */}
                    <div className="px-6 py-4">
                        <SectionHeader title="Contact & Address" sectionKey="contact" />
                        {sections.contact && (
                            <div className="space-y-3 mt-2">
                                <div>
                                    <label className={labelClass}>Address</label>
                                    <input value={address} disabled={isView}
                                        onChange={(e) => setAddress(e.target.value)}
                                        className={inputClass('address')} placeholder="Street address" />
                                </div>
                                <div className="grid grid-cols-3 gap-3">
                                    <div>
                                        <label className={labelClass}>City</label>
                                        <input value={city} disabled={isView}
                                            onChange={(e) => setCity(e.target.value)}
                                            className={inputClass('city')} />
                                    </div>
                                    <div>
                                        <label className={labelClass}>State / Province</label>
                                        <input value={stateProvince} disabled={isView}
                                            onChange={(e) => setStateProvince(e.target.value)}
                                            className={inputClass('stateProvince')} />
                                    </div>
                                    <div>
                                        <label className={labelClass}>Postal code</label>
                                        <input value={postalCode} disabled={isView}
                                            onChange={(e) => setPostalCode(e.target.value)}
                                            className={inputClass('postalCode')} />
                                    </div>
                                </div>
                                <div>
                                    <label className={labelClass}>Country</label>
                                    <input value={country} disabled={isView}
                                        onChange={(e) => setCountry(e.target.value)}
                                        className={inputClass('country')} />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* ── Guardian Section ── */}
                    <div className="px-6 py-4">
                        <SectionHeader title="Parent / Guardian" sectionKey="guardian" />
                        {sections.guardian && (
                            <div className="space-y-3 mt-2">
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className={labelClass}>Guardian name</label>
                                        <input value={guardianName} disabled={isView}
                                            onChange={(e) => setGuardianName(e.target.value)}
                                            className={inputClass('guardianName')} />
                                    </div>
                                    <div>
                                        <label className={labelClass}>Relationship</label>
                                        <input value={guardianRelationship} disabled={isView}
                                            onChange={(e) => setGuardianRelationship(e.target.value)}
                                            className={inputClass('guardianRelationship')} placeholder="Father, Mother, etc." />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className={labelClass}>Guardian email</label>
                                        <input type="email" value={guardianEmail} disabled={isView}
                                            onChange={(e) => setGuardianEmail(e.target.value)}
                                            className={inputClass('guardianEmail')} />
                                    </div>
                                    <div>
                                        <label className={labelClass}>Guardian phone</label>
                                        <input value={guardianPhone} disabled={isView}
                                            onChange={(e) => setGuardianPhone(e.target.value)}
                                            className={inputClass('guardianPhone')} />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className={labelClass}>Emergency contact name</label>
                                        <input value={emergencyContactName} disabled={isView}
                                            onChange={(e) => setEmergencyContactName(e.target.value)}
                                            className={inputClass('emergencyContactName')} />
                                    </div>
                                    <div>
                                        <label className={labelClass}>Emergency contact phone</label>
                                        <input value={emergencyContactPhone} disabled={isView}
                                            onChange={(e) => setEmergencyContactPhone(e.target.value)}
                                            className={inputClass('emergencyContactPhone')} />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* ── Medical Section ── */}
                    <div className="px-6 py-4">
                        <SectionHeader title="Medical Information" sectionKey="medical" />
                        {sections.medical && (
                            <div className="space-y-3 mt-2">
                                <div>
                                    <label className={labelClass}>Blood group</label>
                                    <select value={bloodGroup} disabled={isView}
                                        onChange={(e) => setBloodGroup(e.target.value)}
                                        className={inputClass('bloodGroup')}>
                                        {BLOOD_GROUPS.map((b) => <option key={b} value={b}>{b || 'Select...'}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className={labelClass}>Medical notes</label>
                                    <textarea value={medicalNotes} disabled={isView}
                                        onChange={(e) => setMedicalNotes(e.target.value)}
                                        rows={2}
                                        placeholder="Allergies, conditions, medications..."
                                        className={inputClass('medicalNotes')} />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* ── Academic Section ── */}
                    <div className="px-6 py-4">
                        <SectionHeader title="Academic & Enrollment" sectionKey="academic" />
                        {sections.academic && (
                            <div className="space-y-3 mt-2">
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className={labelClass}>Admission number</label>
                                        <input value={admissionNumber} disabled={isView}
                                            onChange={(e) => setAdmissionNumber(e.target.value)}
                                            className={inputClass('admissionNumber')} />
                                    </div>
                                    <div>
                                        <label className={labelClass}>Roll number</label>
                                        <input value={rollNumber} disabled={isView}
                                            onChange={(e) => setRollNumber(e.target.value)}
                                            className={inputClass('rollNumber')} />
                                    </div>
                                </div>
                                <div className="grid grid-cols-3 gap-3">
                                    <div>
                                        <label className={labelClass}>Class section</label>
                                        <select value={classSectionId} disabled={isView}
                                            onChange={(e) => setClassSectionId(e.target.value)}
                                            className={inputClass('classSectionId')}>
                                            <option value="">Unassigned</option>
                                            {classSections.map((c) => (
                                                <option key={c.id} value={c.id}>{c.name} ({c.gradeLevelName})</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className={labelClass}>Enrollment date</label>
                                        <input type="date" value={enrollmentDate} disabled={isView}
                                            onChange={(e) => setEnrollmentDate(e.target.value)}
                                            className={inputClass('enrollmentDate')} />
                                    </div>
                                    <div>
                                        <label className={labelClass}>Status</label>
                                        <select value={enrollmentStatus} disabled={isView}
                                            onChange={(e) => setEnrollmentStatus(e.target.value)}
                                            className={inputClass('enrollmentStatus')}>
                                            {STATUS_OPTIONS.map((o) => <option key={o} value={o}>{o || 'Select...'}</option>)}
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className={labelClass}>Previous school</label>
                                    <input value={previousSchool} disabled={isView}
                                        onChange={(e) => setPreviousSchool(e.target.value)}
                                        className={inputClass('previousSchool')} />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* ── Password (create only) ── */}
                    {!isEdit && !isView && (
                        <div className="px-6 py-4">
                            <SectionHeader title="Account Password" sectionKey="password" />
                            <div className="space-y-3 mt-2">
                                <div className="relative">
                                    <label className={labelClass}>Password *</label>
                                    <div className="relative">
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            value={password}
                                            onChange={(e) => { setPassword(e.target.value); setFieldErrors((p) => ({ ...p, password: undefined })); }}
                                            placeholder="Enter a strong password"
                                            className={inputClass('password')} />
                                        <button type="button" onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </button>
                                    </div>
                                </div>
                                {password.length > 0 && (
                                    <div className="bg-slate-50 rounded-lg p-3 space-y-1">
                                        <p className="text-xs font-medium text-slate-500 mb-1">Requirements:</p>
                                        {passwordChecks.map((rule) => (
                                            <div key={rule.key} className={`flex items-center gap-1.5 text-xs ${rule.passed ? 'text-emerald-600' : 'text-slate-400'}`}>
                                                {rule.passed ? <Check size={11} /> : <XCircle size={11} />}
                                                {rule.label}
                                            </div>
                                        ))}
                                    </div>
                                )}
                                {fieldErrors.password && <p className="text-xs text-red-600">{fieldErrors.password}</p>}
                                <div>
                                    <label className={labelClass}>Confirm password *</label>
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={confirmPassword}
                                        onChange={(e) => { setConfirmPassword(e.target.value); setFieldErrors((p) => ({ ...p, confirmPassword: undefined })); }}
                                        placeholder="Re-enter password"
                                        className={inputClass('confirmPassword')} />
                                    {confirmMismatch && <p className="text-xs text-red-600 mt-1">Passwords do not match</p>}
                                    {fieldErrors.confirmPassword && <p className="text-xs text-red-600 mt-1">{fieldErrors.confirmPassword}</p>}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ── Error + Buttons ── */}
                    <div className="px-6 py-4 bg-surface-50/50 rounded-b-2xl">
                        {fieldErrors._global && (
                            <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2 mb-3">
                                {fieldErrors._global}
                            </p>
                        )}
                        <div className="flex gap-3">
                            <button type="button" onClick={onClose}
                                className="flex-1 py-2.5 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50">
                                {isView ? 'Close' : 'Cancel'}
                            </button>
                            {!isView && (
                                <button type="submit" disabled={saving}
                                    className="flex-1 py-2.5 rounded-lg bg-navy-900 hover:bg-navy-800 text-white text-sm font-medium disabled:opacity-60">
                                    {saving ? 'Saving...' : isEdit ? 'Save changes' : 'Add student'}
                                </button>
                            )}
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}
