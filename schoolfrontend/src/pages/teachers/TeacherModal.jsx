import { useState, useMemo } from 'react';
import { X, Eye, EyeOff, Check, XCircle, ChevronDown, ChevronUp } from 'lucide-react';
import axiosClient from '../../api/axiosClient';

const PASSWORD_RULES = [
    { key: 'minLength', label: 'At least 8 characters', test: (p) => p.length >= 8 },
    { key: 'uppercase', label: 'One uppercase letter', test: (p) => /[A-Z]/.test(p) },
    { key: 'lowercase', label: 'One lowercase letter', test: (p) => /[a-z]/.test(p) },
    { key: 'digit', label: 'One digit', test: (p) => /[0-9]/.test(p) },
    { key: 'special', label: 'One special character', test: (p) => /[!@#$%^&*()_+\-=[\]{};':"\\|,./<>?`~]/.test(p) },];

const GENDER_OPTIONS = ['', 'Male', 'Female', 'Other'];

export default function TeacherModal({ initialData, onClose, onSaved, readOnly }) {
    const isEdit = Boolean(initialData);
    const isView = readOnly && isEdit;

    // Basic
    const [firstName, setFirstName] = useState(initialData?.firstName || '');
    const [lastName, setLastName] = useState(initialData?.lastName || '');
    const [email, setEmail] = useState(initialData?.email || '');
    const [dateOfBirth, setDateOfBirth] = useState(initialData?.dateOfBirth || '');
    const [gender, setGender] = useState(initialData?.gender || '');
    const [nationality, setNationality] = useState(initialData?.nationality || '');

    // Professional
    const [employeeId, setEmployeeId] = useState(initialData?.employeeId || '');
    const [qualification, setQualification] = useState(initialData?.qualification || '');
    const [department, setDepartment] = useState(initialData?.department || '');
    const [designation, setDesignation] = useState(initialData?.designation || '');
    const [joinDate, setJoinDate] = useState(initialData?.joinDate || '');

    // Contact
    const [phoneNumber, setPhoneNumber] = useState(initialData?.phoneNumber || '');
    const [address, setAddress] = useState(initialData?.address || '');
    const [city, setCity] = useState(initialData?.city || '');
    const [stateProvince, setStateProvince] = useState(initialData?.stateProvince || '');
    const [postalCode, setPostalCode] = useState(initialData?.postalCode || '');
    const [country, setCountry] = useState(initialData?.country || '');

    // Emergency
    const [emergencyContactName, setEmergencyContactName] = useState(initialData?.emergencyContactName || '');
    const [emergencyContactPhone, setEmergencyContactPhone] = useState(initialData?.emergencyContactPhone || '');

    // Notes
    const [bio, setBio] = useState(initialData?.bio || '');

    // Password
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [fieldErrors, setFieldErrors] = useState({});
    const [saving, setSaving] = useState(false);

    const [sections, setSections] = useState({ basic: true, professional: false, contact: false, emergency: false });
    const toggleSection = (key) => setSections((s) => ({ ...s, [key]: !s[key] }));

    const passwordChecks = useMemo(() => PASSWORD_RULES.map((r) => ({ ...r, passed: r.test(password) })), [password]);
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
                firstName, lastName, email,
                employeeId: employeeId || null, qualification: qualification || null,
                department: department || null, designation: designation || null,
                joinDate: joinDate || null, dateOfBirth: dateOfBirth || null,
                gender: gender || null, nationality: nationality || null,
                phoneNumber: phoneNumber || null,
                address: address || null, city: city || null,
                stateProvince: stateProvince || null, postalCode: postalCode || null, country: country || null,
                emergencyContactName: emergencyContactName || null,
                emergencyContactPhone: emergencyContactPhone || null,
                bio: bio || null,
            };
            if (isEdit) {
                await axiosClient.put(`/teachers/${initialData.id}`, payload);
            } else {
                await axiosClient.post('/admin/users', { ...payload, password, confirmPassword, role: 'TEACHER' });
            }
            onSaved();
        } catch (err) {
            const d = err.response?.data;
            if (d?.errors && typeof d.errors === 'object') {
                const se = {};
                for (const [f, m] of Object.entries(d.errors)) se[f] = m;
                setFieldErrors(se);
            } else {
                setFieldErrors({ _global: d?.message || err.message || 'Something went wrong' });
            }
        } finally { setSaving(false); }
    };

    const inputClass = (f) =>
        `w-full px-3 py-2 rounded-lg bg-slate-50 border text-sm focus:outline-none focus:ring-2 focus:ring-teal-accent disabled:opacity-60 disabled:cursor-not-allowed ${
            fieldErrors[f] ? 'border-red-300 bg-red-50/50' : 'border-slate-200'}`;
    const labelClass = 'block text-xs font-medium text-slate-500 mb-1';

    const SectionHeader = ({ title, sectionKey }) => (
        <button type="button" onClick={() => toggleSection(sectionKey)}
            className="w-full flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-surface-50 transition-colors">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{title}</span>
            {sections[sectionKey] ? <ChevronUp size={14} className="text-slate-400" /> : <ChevronDown size={14} className="text-slate-400" />}
        </button>
    );

    return (
        <div className="fixed inset-0 bg-slate-900/40 flex items-center justify-center z-50 px-4" onClick={onClose}>
            <div className="bg-white rounded-2xl w-full max-w-2xl shadow-elevated max-h-[92vh] overflow-y-auto animate-fade-in" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between px-6 py-4 border-b border-surface-100 sticky top-0 bg-white z-10">
                    <h2 className="text-lg font-bold text-slate-900">{isView ? 'View teacher' : isEdit ? 'Edit teacher' : 'Add teacher'}</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-surface-50"><X size={20} /></button>
                </div>

                <form onSubmit={handleSubmit} noValidate className="divide-y divide-surface-100">
                    {/* Basic */}
                    <div className="px-6 py-4">
                        <SectionHeader title="Basic Information" sectionKey="basic" />
                        {sections.basic && (
                            <div className="space-y-3 mt-2">
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className={labelClass}>First name *</label>
                                        <input value={firstName} disabled={isView} onChange={(e) => { setFirstName(e.target.value); setFieldErrors((p) => ({ ...p, firstName: undefined })); }} className={inputClass('firstName')} />
                                        {fieldErrors.firstName && <p className="text-xs text-red-600 mt-1">{fieldErrors.firstName}</p>}
                                    </div>
                                    <div>
                                        <label className={labelClass}>Last name *</label>
                                        <input value={lastName} disabled={isView} onChange={(e) => { setLastName(e.target.value); setFieldErrors((p) => ({ ...p, lastName: undefined })); }} className={inputClass('lastName')} />
                                        {fieldErrors.lastName && <p className="text-xs text-red-600 mt-1">{fieldErrors.lastName}</p>}
                                    </div>
                                </div>
                                <div>
                                    <label className={labelClass}>Email *</label>
                                    <input type="email" value={email} disabled={isView} onChange={(e) => { setEmail(e.target.value); setFieldErrors((p) => ({ ...p, email: undefined })); }} className={inputClass('email')} />
                                    {fieldErrors.email && <p className="text-xs text-red-600 mt-1">{fieldErrors.email}</p>}
                                </div>
                                <div className="grid grid-cols-3 gap-3">
                                    <div>
                                        <label className={labelClass}>Date of birth</label>
                                        <input type="date" value={dateOfBirth} disabled={isView} onChange={(e) => setDateOfBirth(e.target.value)} className={inputClass('dateOfBirth')} />
                                    </div>
                                    <div>
                                        <label className={labelClass}>Gender</label>
                                        <select value={gender} disabled={isView} onChange={(e) => setGender(e.target.value)} className={inputClass('gender')}>
                                            {GENDER_OPTIONS.map((o) => <option key={o} value={o}>{o || 'Select...'}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className={labelClass}>Nationality</label>
                                        <input value={nationality} disabled={isView} onChange={(e) => setNationality(e.target.value)} className={inputClass('nationality')} />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Professional */}
                    <div className="px-6 py-4">
                        <SectionHeader title="Professional Details" sectionKey="professional" />
                        {sections.professional && (
                            <div className="space-y-3 mt-2">
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className={labelClass}>Employee ID</label>
                                        <input value={employeeId} disabled={isView} onChange={(e) => setEmployeeId(e.target.value)} className={inputClass('employeeId')} />
                                    </div>
                                    <div>
                                        <label className={labelClass}>Designation</label>
                                        <input value={designation} disabled={isView} onChange={(e) => setDesignation(e.target.value)} placeholder="e.g. Senior Teacher" className={inputClass('designation')} />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className={labelClass}>Department</label>
                                        <input value={department} disabled={isView} onChange={(e) => setDepartment(e.target.value)} className={inputClass('department')} />
                                    </div>
                                    <div>
                                        <label className={labelClass}>Qualification</label>
                                        <input value={qualification} disabled={isView} onChange={(e) => setQualification(e.target.value)} className={inputClass('qualification')} />
                                    </div>
                                </div>
                                <div>
                                    <label className={labelClass}>Join date</label>
                                    <input type="date" value={joinDate} disabled={isView} onChange={(e) => setJoinDate(e.target.value)} className={inputClass('joinDate')} />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Contact */}
                    <div className="px-6 py-4">
                        <SectionHeader title="Contact & Address" sectionKey="contact" />
                        {sections.contact && (
                            <div className="space-y-3 mt-2">
                                <div>
                                    <label className={labelClass}>Phone number</label>
                                    <input value={phoneNumber} disabled={isView} onChange={(e) => setPhoneNumber(e.target.value)} className={inputClass('phoneNumber')} />
                                </div>
                                <div>
                                    <label className={labelClass}>Address</label>
                                    <input value={address} disabled={isView} onChange={(e) => setAddress(e.target.value)} className={inputClass('address')} />
                                </div>
                                <div className="grid grid-cols-3 gap-3">
                                    <div><label className={labelClass}>City</label><input value={city} disabled={isView} onChange={(e) => setCity(e.target.value)} className={inputClass('city')} /></div>
                                    <div><label className={labelClass}>State / Province</label><input value={stateProvince} disabled={isView} onChange={(e) => setStateProvince(e.target.value)} className={inputClass('stateProvince')} /></div>
                                    <div><label className={labelClass}>Postal code</label><input value={postalCode} disabled={isView} onChange={(e) => setPostalCode(e.target.value)} className={inputClass('postalCode')} /></div>
                                </div>
                                <div><label className={labelClass}>Country</label><input value={country} disabled={isView} onChange={(e) => setCountry(e.target.value)} className={inputClass('country')} /></div>
                            </div>
                        )}
                    </div>

                    {/* Emergency */}
                    <div className="px-6 py-4">
                        <SectionHeader title="Emergency Contact" sectionKey="emergency" />
                        {sections.emergency && (
                            <div className="space-y-3 mt-2">
                                <div className="grid grid-cols-2 gap-3">
                                    <div><label className={labelClass}>Contact name</label><input value={emergencyContactName} disabled={isView} onChange={(e) => setEmergencyContactName(e.target.value)} className={inputClass('emergencyContactName')} /></div>
                                    <div><label className={labelClass}>Contact phone</label><input value={emergencyContactPhone} disabled={isView} onChange={(e) => setEmergencyContactPhone(e.target.value)} className={inputClass('emergencyContactPhone')} /></div>
                                </div>
                                <div>
                                    <label className={labelClass}>Notes / Bio</label>
                                    <textarea value={bio} disabled={isView} onChange={(e) => setBio(e.target.value)} rows={2} placeholder="Additional notes..." className={inputClass('bio')} />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Password (create only) */}
                    {!isEdit && !isView && (
                        <div className="px-6 py-4">
                            <SectionHeader title="Account Password" sectionKey="password" />
                            <div className="space-y-3 mt-2">
                                <div>
                                    <label className={labelClass}>Password *</label>
                                    <div className="relative">
                                        <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => { setPassword(e.target.value); setFieldErrors((p) => ({ ...p, password: undefined })); }} placeholder="Enter a strong password" className={inputClass('password')} />
                                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">{showPassword ? <EyeOff size={16} /> : <Eye size={16} />}</button>
                                    </div>
                                </div>
                                {password.length > 0 && (
                                    <div className="bg-slate-50 rounded-lg p-3 space-y-1">
                                        <p className="text-xs font-medium text-slate-500 mb-1">Requirements:</p>
                                        {passwordChecks.map((rule) => (
                                            <div key={rule.key} className={`flex items-center gap-1.5 text-xs ${rule.passed ? 'text-emerald-600' : 'text-slate-400'}`}>{rule.passed ? <Check size={11} /> : <XCircle size={11} />}{rule.label}</div>
                                        ))}
                                    </div>
                                )}
                                {fieldErrors.password && <p className="text-xs text-red-600">{fieldErrors.password}</p>}
                                <div>
                                    <label className={labelClass}>Confirm password *</label>
                                    <input type={showPassword ? 'text' : 'password'} value={confirmPassword} onChange={(e) => { setConfirmPassword(e.target.value); setFieldErrors((p) => ({ ...p, confirmPassword: undefined })); }} placeholder="Re-enter password" className={inputClass('confirmPassword')} />
                                    {confirmMismatch && <p className="text-xs text-red-600 mt-1">Passwords do not match</p>}
                                    {fieldErrors.confirmPassword && <p className="text-xs text-red-600 mt-1">{fieldErrors.confirmPassword}</p>}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Footer */}
                    <div className="px-6 py-4 bg-surface-50/50 rounded-b-2xl">
                        {fieldErrors._global && <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2 mb-3">{fieldErrors._global}</p>}
                        <div className="flex gap-3">
                            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50">{isView ? 'Close' : 'Cancel'}</button>
                            {!isView && <button type="submit" disabled={saving} className="flex-1 py-2.5 rounded-lg bg-navy-900 hover:bg-navy-800 text-white text-sm font-medium disabled:opacity-60">{saving ? 'Saving...' : isEdit ? 'Save changes' : 'Add teacher'}</button>}
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}
