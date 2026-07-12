import { useState, useMemo } from 'react';
import { X, Eye, EyeOff, Check, XCircle } from 'lucide-react';
import axiosClient from '../../api/axiosClient';

const PASSWORD_RULES = [
    { key: 'minLength', label: 'At least 8 characters', test: (p) => p.length >= 8 },
    { key: 'uppercase', label: 'One uppercase letter', test: (p) => /[A-Z]/.test(p) },
    { key: 'lowercase', label: 'One lowercase letter', test: (p) => /[a-z]/.test(p) },
    { key: 'digit', label: 'One digit', test: (p) => /[0-9]/.test(p) },
    { key: 'special', label: 'One special character', test: (p) => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/.test(p) },
];

export default function TeacherModal({ initialData, onClose, onSaved }) {
    const isEdit = Boolean(initialData);

    const [firstName, setFirstName] = useState(initialData?.firstName || '');
    const [lastName, setLastName] = useState(initialData?.lastName || '');
    const [email, setEmail] = useState(initialData?.email || '');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [fieldErrors, setFieldErrors] = useState({});
    const [saving, setSaving] = useState(false);

    const passwordChecks = useMemo(() => {
        return PASSWORD_RULES.map((rule) => ({
            ...rule,
            passed: rule.test(password),
        }));
    }, [password]);

    const isPasswordValid = passwordChecks.every((c) => c.passed);
    const confirmMismatch = confirmPassword && password !== confirmPassword;

    const validateForm = () => {
        const errors = {};
        if (!firstName.trim()) errors.firstName = 'First name is required';
        if (!lastName.trim()) errors.lastName = 'Last name is required';
        if (!email.trim()) {
            errors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            errors.email = 'Invalid email format';
        }
        if (!isEdit) {
            if (!password) {
                errors.password = 'Password is required';
            } else if (!isPasswordValid) {
                errors.password = 'Password does not meet all requirements';
            }
            if (!confirmPassword) {
                errors.confirmPassword = 'Confirm password is required';
            } else if (confirmPassword !== password) {
                errors.confirmPassword = 'Passwords do not match';
            }
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
            if (isEdit) {
                await axiosClient.put(`/teachers/${initialData.id}`, { firstName, lastName, email });
            } else {
                await axiosClient.post('/admin/users', {
                    firstName, lastName, email, password, confirmPassword, role: 'TEACHER',
                });
            }
            onSaved();
        } catch (err) {
            const responseData = err.response?.data;
            if (responseData?.errors && typeof responseData.errors === 'object') {
                const serverErrors = {};
                for (const [field, msg] of Object.entries(responseData.errors)) {
                    serverErrors[field] = msg;
                }
                setFieldErrors(serverErrors);
            } else {
                setFieldErrors({ _global: responseData?.message || err.message || 'Something went wrong' });
            }
        } finally {
            setSaving(false);
        }
    };

    const inputClass = (field) =>
        `w-full px-3 py-2.5 rounded-lg bg-slate-50 border text-sm focus:outline-none focus:ring-2 focus:ring-teal-accent ${
            fieldErrors[field] ? 'border-red-300 bg-red-50/50' : 'border-slate-200'
        }`;

    return (
        <div className="fixed inset-0 bg-slate-900/40 flex items-center justify-center z-50 px-4" onClick={onClose}>
            <div className="bg-white rounded-xl w-full max-w-md p-6 shadow-xl max-h-[90vh] overflow-y-auto animate-fade-in" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-5">
                    <h2 className="text-lg font-bold text-slate-900">{isEdit ? 'Edit teacher' : 'Add teacher'}</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">First name</label>
                            <input
                                value={firstName}
                                onChange={(e) => { setFirstName(e.target.value); setFieldErrors((p) => ({ ...p, firstName: undefined })); }}
                                className={inputClass('firstName')}
                            />
                            {fieldErrors.firstName && <p className="text-xs text-red-600 mt-1">{fieldErrors.firstName}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">Last name</label>
                            <input
                                value={lastName}
                                onChange={(e) => { setLastName(e.target.value); setFieldErrors((p) => ({ ...p, lastName: undefined })); }}
                                className={inputClass('lastName')}
                            />
                            {fieldErrors.lastName && <p className="text-xs text-red-600 mt-1">{fieldErrors.lastName}</p>}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => { setEmail(e.target.value); setFieldErrors((p) => ({ ...p, email: undefined })); }}
                            className={inputClass('email')}
                        />
                        {fieldErrors.email && <p className="text-xs text-red-600 mt-1">{fieldErrors.email}</p>}
                    </div>

                    {!isEdit && (
                        <>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={password}
                                        onChange={(e) => { setPassword(e.target.value); setFieldErrors((p) => ({ ...p, password: undefined })); }}
                                        placeholder="Enter a strong password"
                                        className={inputClass('password')}
                                    />
                                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                            </div>

                            {password.length > 0 && (
                                <div className="bg-slate-50 rounded-lg p-3 space-y-1.5">
                                    <p className="text-xs font-medium text-slate-500 mb-2">Password requirements:</p>
                                    {passwordChecks.map((rule) => (
                                        <div key={rule.key} className={`flex items-center gap-2 text-xs ${rule.passed ? 'text-emerald-600' : 'text-slate-400'}`}>
                                            {rule.passed ? <Check size={12} /> : <XCircle size={12} />}
                                            {rule.label}
                                        </div>
                                    ))}
                                </div>
                            )}
                            {fieldErrors.password && <p className="text-xs text-red-600 mt-1">{fieldErrors.password}</p>}

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">Confirm password</label>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={confirmPassword}
                                    onChange={(e) => { setConfirmPassword(e.target.value); setFieldErrors((p) => ({ ...p, confirmPassword: undefined })); }}
                                    placeholder="Re-enter the password"
                                    className={inputClass('confirmPassword')}
                                />
                                {confirmMismatch && <p className="text-xs text-red-600 mt-1">Passwords do not match</p>}
                                {fieldErrors.confirmPassword && <p className="text-xs text-red-600 mt-1">{fieldErrors.confirmPassword}</p>}
                            </div>
                        </>
                    )}

                    {fieldErrors._global && (
                        <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{fieldErrors._global}</p>
                    )}

                    <div className="flex gap-3 pt-2">
                        <button type="button" onClick={onClose}
                                className="flex-1 py-2.5 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50">
                            Cancel
                        </button>
                        <button type="submit" disabled={saving}
                                className="flex-1 py-2.5 rounded-lg bg-navy-900 hover:bg-navy-800 text-white text-sm font-medium disabled:opacity-60">
                            {saving ? 'Saving...' : isEdit ? 'Save changes' : 'Add teacher'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
