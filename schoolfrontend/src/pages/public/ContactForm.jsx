import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Landmark, CheckCircle2 } from 'lucide-react';
import axiosClient from '../../api/axiosClient';

export default function ContactForm() {
    const [schoolName, setSchoolName] = useState('');
    const [contactName, setContactName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [studentCountEstimate, setStudentCountEstimate] = useState('');
    const [message, setMessage] = useState('');
    const [companyWebsite, setCompanyWebsite] = useState(''); // honeypot
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(''); setLoading(true);
        try {
            await axiosClient.post('/contact-inquiries', {
                schoolName, contactName, email, phone: phone || null,
                studentCountEstimate: studentCountEstimate ? Number(studentCountEstimate) : null,
                message, companyWebsite,
            });
            setSubmitted(true);
        } catch (err) {
            setError(err.response?.data?.message || 'Could not send your inquiry — please try again.');
        } finally { setLoading(false); }
    };

    if (submitted) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 px-6">
                <div className="w-full max-w-sm text-center">
                    <CheckCircle2 size={40} className="mx-auto text-teal-600 mb-4" />
                    <h1 className="text-xl font-bold text-slate-900 mb-2">Thank you</h1>
                    <p className="text-sm text-slate-500 mb-6">
                        We've received your inquiry and will be in touch shortly.
                    </p>
                    <Link to="/login" className="text-teal-600 font-medium hover:text-teal-700">Back to login</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 px-6 py-10">
            <div className="w-full max-w-md">
                <div className="flex items-center gap-2 justify-center mb-8">
                    <div className="w-9 h-9 rounded-lg bg-navy-900 flex items-center justify-center">
                        <Landmark size={18} className="text-white" />
                    </div>
                    <span className="text-lg font-bold text-slate-900">StanfordOS</span>
                </div>

                <h1 className="text-2xl font-bold text-slate-900 mb-1 text-center">Get in touch</h1>
                <p className="text-sm text-slate-500 mb-8 text-center">
                    Tell us about your school and we'll reach out to set things up.
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Honeypot — hidden from real users via off-screen positioning, not display:none */}
                    <div style={{ position: 'absolute', left: '-9999px' }} aria-hidden="true">
                        <label htmlFor="companyWebsite">Company website</label>
                        <input
                            id="companyWebsite"
                            type="text"
                            tabIndex={-1}
                            autoComplete="off"
                            value={companyWebsite}
                            onChange={(e) => setCompanyWebsite(e.target.value)}
                        />
                    </div>

                    <input required placeholder="School name" value={schoolName} onChange={(e) => setSchoolName(e.target.value)}
                           className="w-full px-3 py-2.5 rounded-lg bg-white border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-accent" />
                    <input required placeholder="Your name" value={contactName} onChange={(e) => setContactName(e.target.value)}
                           className="w-full px-3 py-2.5 rounded-lg bg-white border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-accent" />
                    <div className="grid grid-cols-2 gap-3">
                        <input type="email" required placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)}
                               className="w-full px-3 py-2.5 rounded-lg bg-white border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-accent" />
                        <input placeholder="Phone (optional)" value={phone} onChange={(e) => setPhone(e.target.value)}
                               className="w-full px-3 py-2.5 rounded-lg bg-white border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-accent" />
                    </div>
                    <input type="number" min="1" placeholder="Approx. number of students (optional)"
                           value={studentCountEstimate} onChange={(e) => setStudentCountEstimate(e.target.value)}
                           className="w-full px-3 py-2.5 rounded-lg bg-white border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-accent" />
                    <textarea required rows={4} placeholder="Tell us a bit about what you're looking for..."
                              value={message} onChange={(e) => setMessage(e.target.value)}
                              className="w-full px-3 py-2.5 rounded-lg bg-white border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-accent resize-none" />

                    {error && <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</p>}

                    <button type="submit" disabled={loading}
                            className="w-full bg-navy-900 hover:bg-navy-800 text-white font-medium py-2.5 rounded-lg transition-colors disabled:opacity-60">
                        {loading ? 'Sending...' : 'Send inquiry'}
                    </button>
                </form>

                <p className="text-center text-sm text-slate-500 mt-6">
                    <Link to="/login" className="text-teal-600 font-medium hover:text-teal-700">Back to login</Link>
                </p>
            </div>
        </div>
    );
}