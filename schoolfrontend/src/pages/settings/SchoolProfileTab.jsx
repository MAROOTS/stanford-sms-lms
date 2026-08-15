import { useState, useEffect, useRef } from 'react';
import axiosClient from '../../api/axiosClient';
import { useToast } from '../../context/useToast';

export default function SchoolProfileTab() {
    const toast = useToast();
    const fileInputRef = useRef(null);
    const [name, setName] = useState('');
    const [address, setAddress] = useState('');
    const [contactEmail, setContactEmail] = useState('');
    const [contactPhone, setContactPhone] = useState('');
    const [logoUrl, setLogoUrl] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploadingLogo, setUploadingLogo] = useState(false);

    const load = () => {
        axiosClient.get('/school-profile').then((res) => {
            setName(res.data.name); setAddress(res.data.address || '');
            setContactEmail(res.data.contactEmail || ''); setContactPhone(res.data.contactPhone || '');
            setLogoUrl(res.data.logoUrl);
        }).finally(() => setLoading(false));
    };

    useEffect(() => { load(); }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await axiosClient.put('/school-profile', { name, address, contactEmail, contactPhone });
            toast.success('School profile updated.');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Could not update profile');
        } finally { setSaving(false); }
    };

    const handleLogoChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setUploadingLogo(true);
        const formData = new FormData();
        formData.append('file', file);
        try {
            const { data } = await axiosClient.post('/school-profile/logo', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            setLogoUrl(data.logoUrl);
            toast.success('Logo updated.');
        } catch {
            toast.error('Could not upload logo');
        } finally { setUploadingLogo(false); }
    };

    if (loading) return <p className="text-sm text-slate-400">Loading school profile...</p>;

    return (
        <div className="max-w-md space-y-6">
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Logo</label>
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-center overflow-hidden">
                        {logoUrl ? <img src={logoUrl} alt="School logo" className="w-full h-full object-cover" /> : <span className="text-xs text-slate-400">No logo</span>}
                    </div>
                    <button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploadingLogo}
                            className="text-sm font-medium text-teal-600 hover:text-teal-700 disabled:opacity-60">
                        {uploadingLogo ? 'Uploading...' : 'Change logo'}
                    </button>
                    <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleLogoChange} />
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">School name</label>
                    <input required value={name} onChange={(e) => setName(e.target.value)}
                           className="w-full px-3 py-2.5 rounded-lg bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-accent" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Address</label>
                    <textarea rows={2} value={address} onChange={(e) => setAddress(e.target.value)}
                              className="w-full px-3 py-2.5 rounded-lg bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-accent resize-none" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <input type="email" placeholder="Contact email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)}
                           className="w-full px-3 py-2.5 rounded-lg bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-accent" />
                    <input placeholder="Contact phone" value={contactPhone} onChange={(e) => setContactPhone(e.target.value)}
                           className="w-full px-3 py-2.5 rounded-lg bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-accent" />
                </div>
                <button type="submit" disabled={saving} className="bg-navy-900 hover:bg-navy-800 text-white text-sm font-medium px-4 py-2.5 rounded-lg disabled:opacity-60">
                    {saving ? 'Saving...' : 'Save changes'}
                </button>
            </form>
        </div>
    );
}