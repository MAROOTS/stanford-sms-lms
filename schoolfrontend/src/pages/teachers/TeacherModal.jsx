import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import axiosClient from '../../api/axiosClient';
import TempPasswordModal from '../../components/shared/TempPasswordModal';

const field =
    'w-full px-3 py-2.5 rounded-lg bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-accent disabled:opacity-60';
const emptyToNull = (v) => (v === '' || v == null ? null : v);

export default function TeacherModal({ initialData, onClose, onSaved, readOnly }) {
  const isEdit = Boolean(initialData) && !readOnly;

  const [firstName, setFirstName] = useState(initialData?.firstName || '');
  const [lastName, setLastName] = useState(initialData?.lastName || '');
  const [username, setUsername] = useState(initialData?.username || '');
  const [email, setEmail] = useState(initialData?.email || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState(initialData?.phone || '');
  const [tscNumber, setTscNumber] = useState(initialData?.tscNumber || '');
  const [nationalId, setNationalId] = useState(initialData?.nationalId || '');
  const [dateOfBirth, setDateOfBirth] = useState(initialData?.dateOfBirth || '');
  const [gender, setGender] = useState(initialData?.gender || '');
  const [dateOfEmployment, setDateOfEmployment] = useState(initialData?.dateOfEmployment || '');
  const [qualification, setQualification] = useState(initialData?.qualification || '');
  const [department, setDepartment] = useState(initialData?.department || '');
  const [address, setAddress] = useState(initialData?.address || '');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [createdCredentials, setCreatedCredentials] = useState(null);

  useEffect(() => {
    if (!initialData && !readOnly) {
      axiosClient
          .get('/admin/users/generate-username', { params: { role: 'TEACHER' } })
          .then((res) => setUsername(res.data.username))
          .catch(() => setError('Could not generate a username'));
    }
  }, [initialData, readOnly]);

  const profilePayload = () => ({
    firstName,
    lastName,
    email,
    phone: emptyToNull(phone),
    tscNumber: emptyToNull(tscNumber),
    nationalId: emptyToNull(nationalId),
    dateOfBirth: emptyToNull(dateOfBirth),
    gender: emptyToNull(gender),
    dateOfEmployment: emptyToNull(dateOfEmployment),
    qualification: emptyToNull(qualification),
    department: emptyToNull(department),
    address: emptyToNull(address),
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!isEdit && password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setSaving(true);
    try {
      if (isEdit) {
        await axiosClient.put(`/teachers/${initialData.id}`, profilePayload());
        onSaved();
      } else {
        const { data } = await axiosClient.post('/admin/users', {
          firstName, lastName, username, email, password, confirmPassword, role: 'TEACHER',
        });
        if (data?.id) {
          await axiosClient.put(`/teachers/${data.id}`, profilePayload());
        }
        setCreatedCredentials({ username, temporaryPassword: password });
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
      <div className="fixed inset-0 bg-slate-900/40 flex items-center justify-center z-50 px-4 py-8 overflow-y-auto" onClick={onClose}>
        <div className="bg-white rounded-xl w-full max-w-2xl p-6 shadow-xl my-auto max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-bold text-slate-900">
              {readOnly ? 'Teacher details' : isEdit ? 'Edit teacher' : 'Add teacher'}
            </h2>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <p className="text-xs font-semibold tracking-wider text-slate-400 mb-3">ACCOUNT</p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">First name</label>
                  <input required disabled={readOnly} value={firstName} onChange={(e) => setFirstName(e.target.value)} className={field} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Last name</label>
                  <input required disabled={readOnly} value={lastName} onChange={(e) => setLastName(e.target.value)} className={field} />
                </div>
                {!isEdit && (
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">Username</label>
                      <input required disabled={readOnly} value={username} onChange={(e) => setUsername(e.target.value)} className={`${field} font-mono`} />
                    </div>
                )}
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
                  <input type="email" required disabled={readOnly} value={email} onChange={(e) => setEmail(e.target.value)} className={field} />
                </div>
                {!isEdit && !readOnly && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Temporary password</label>
                        <input type="text" required value={password} onChange={(e) => setPassword(e.target.value)} className={field} />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Confirm password</label>
                        <input type="text" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className={field} />
                      </div>
                    </>
                )}
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold tracking-wider text-slate-400 mb-3">STAFF DETAILS</p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Phone</label>
                  <input disabled={readOnly} value={phone} onChange={(e) => setPhone(e.target.value)} className={field} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">TSC number</label>
                  <input disabled={readOnly} value={tscNumber} onChange={(e) => setTscNumber(e.target.value)} className={field} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">National ID</label>
                  <input disabled={readOnly} value={nationalId} onChange={(e) => setNationalId(e.target.value)} className={field} />
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
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Date of birth</label>
                  <input type="date" disabled={readOnly} value={dateOfBirth} onChange={(e) => setDateOfBirth(e.target.value)} className={field} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Date of employment</label>
                  <input type="date" disabled={readOnly} value={dateOfEmployment} onChange={(e) => setDateOfEmployment(e.target.value)} className={field} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Qualification</label>
                  <input disabled={readOnly} value={qualification} onChange={(e) => setQualification(e.target.value)} className={field} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Department</label>
                  <input disabled={readOnly} value={department} onChange={(e) => setDepartment(e.target.value)} className={field} />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Address</label>
                  <input disabled={readOnly} value={address} onChange={(e) => setAddress(e.target.value)} className={field} />
                </div>
              </div>
            </div>

            {error && <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</p>}

            {!readOnly && (
                <div className="flex gap-3">
                  <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50">Cancel</button>
                  <button type="submit" disabled={saving} className="flex-1 py-2.5 rounded-lg bg-navy-900 hover:bg-navy-800 text-white text-sm font-medium disabled:opacity-60">
                    {saving ? 'Saving...' : isEdit ? 'Save changes' : 'Add teacher'}
                  </button>
                </div>
            )}
          </form>
        </div>
      </div>
  );
}