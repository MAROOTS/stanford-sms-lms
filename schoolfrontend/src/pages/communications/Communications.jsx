import { useCallback, useEffect, useMemo, useState } from 'react';
import {
    MessageSquare,
    Send,
    Users,
    GraduationCap,
    School,
    Eye,
    CheckCircle2,
    AlertCircle,
    Clock3,
    XCircle,
    RefreshCw,
    Info,
    Smartphone,
} from 'lucide-react';
import axiosClient from '../../api/axiosClient';
import { useToast } from '../../context/useToast';
import EmptyState from '../../components/shared/EmptyState';
import { TableSkeleton } from '../../components/shared/LoadingSkeleton';

const AUDIENCES = [
    {
        value: 'ALL_PARENTS',
        label: 'All parents',
        description: 'Reach every parent with a phone number',
        icon: Users,
    },
    {
        value: 'GRADE',
        label: 'One grade',
        description: 'Message parents in a selected grade',
        icon: GraduationCap,
    },
    {
        value: 'CLASS',
        label: 'One class',
        description: 'Message parents in a selected class',
        icon: School,
    },
];

const getStatusConfig = (status) => {
    switch (status) {
        case 'SENT':
            return {
                label: 'Sent',
                icon: CheckCircle2,
                className:
                    'bg-emerald-50 text-emerald-700 border border-emerald-100',
            };

        case 'SENDING':
            return {
                label: 'Sending',
                icon: Clock3,
                className:
                    'bg-blue-50 text-blue-700 border border-blue-100',
            };

        case 'QUEUED':
            return {
                label: 'Queued',
                icon: Clock3,
                className:
                    'bg-amber-50 text-amber-700 border border-amber-100',
            };

        case 'FAILED':
            return {
                label: 'Failed',
                icon: XCircle,
                className:
                    'bg-rose-50 text-rose-700 border border-rose-100',
            };

        default:
            return {
                label: status || 'Unknown',
                icon: Info,
                className:
                    'bg-slate-50 text-slate-600 border border-slate-200',
            };
    }
};

const getAudienceLabel = (audience) => {
    switch (audience) {
        case 'ALL_PARENTS':
            return 'All parents';
        case 'GRADE':
            return 'One grade';
        case 'CLASS':
            return 'One class';
        default:
            return audience?.replaceAll('_', ' ') || '—';
    }
};

export default function Communications() {
    const toast = useToast();

    const [campaigns, setCampaigns] = useState([]);
    const [sections, setSections] = useState([]);
    const [grades, setGrades] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [title, setTitle] = useState('');

    const [body, setBody] = useState(
        'Hello {{parentName}}, this is a message from {{schoolName}} about {{studentName}}.'
    );

    const [audience, setAudience] = useState('ALL_PARENTS');
    const [classSectionId, setClassSectionId] = useState('');
    const [gradeLevelId, setGradeLevelId] = useState('');

    const [preview, setPreview] = useState(null);
    const [previewing, setPreviewing] = useState(false);
    const [sending, setSending] = useState(false);
    const [formError, setFormError] = useState('');

    const payload = () => ({
        title: title.trim(),
        body,
        audience,
        classSectionId:
            audience === 'CLASS' && classSectionId
                ? Number(classSectionId)
                : null,
        gradeLevelId:
            audience === 'GRADE' && gradeLevelId
                ? Number(gradeLevelId)
                : null,
    });

    const load = useCallback(async () => {
        setLoading(true);
        setError('');

        try {
            const [c, s, g] = await Promise.all([
                axiosClient.get('/communications'),
                axiosClient.get('/class-sections'),
                axiosClient.get('/grade-levels'),
            ]);

            setCampaigns(
                Array.isArray(c.data) ? c.data : []
            );

            setSections(
                Array.isArray(s.data) ? s.data : []
            );

            setGrades(
                Array.isArray(g.data) ? g.data : []
            );
        } catch (err) {
            setError(
                err.response?.data?.message ||
                'Could not load SMS campaigns'
            );
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        load();
    }, [load]);

    const handleAudienceChange = (value) => {
        setAudience(value);
        setPreview(null);
        setFormError('');

        if (value !== 'CLASS') {
            setClassSectionId('');
        }

        if (value !== 'GRADE') {
            setGradeLevelId('');
        }
    };

    const handlePreview = async (e) => {
        e.preventDefault();

        setFormError('');
        setPreview(null);

        if (!title.trim() || !body.trim()) {
            setFormError(
                'Title and message are required'
            );
            return;
        }

        if (audience === 'CLASS' && !classSectionId) {
            setFormError('Choose a class');
            return;
        }

        if (audience === 'GRADE' && !gradeLevelId) {
            setFormError('Choose a grade');
            return;
        }

        setPreviewing(true);

        try {
            const { data } = await axiosClient.post(
                '/communications/preview',
                payload()
            );

            setPreview(data);
        } catch (err) {
            setFormError(
                err.response?.data?.message ||
                'Could not preview this audience'
            );
        } finally {
            setPreviewing(false);
        }
    };

    const handleSend = async () => {
        if (
            !preview ||
            preview.recipientCount === 0
        ) {
            return;
        }

        if (
            !window.confirm(
                `Send SMS to ${preview.recipientCount} parent(s)?`
            )
        ) {
            return;
        }

        setSending(true);
        setFormError('');

        try {
            await axiosClient.post(
                '/communications',
                payload()
            );

            toast.success(
                'SMS queued. Refresh in a few seconds for delivery counts.'
            );

            setPreview(null);
            setTitle('');

            await load();
        } catch (err) {
            setFormError(
                err.response?.data?.message ||
                'Could not send SMS'
            );
        } finally {
            setSending(false);
        }
    };

    const selectedAudience = useMemo(
        () =>
            AUDIENCES.find(
                (item) => item.value === audience
            ),
        [audience]
    );

    const selectedGrade = useMemo(
        () =>
            grades.find(
                (g) =>
                    String(g.id) ===
                    String(gradeLevelId)
            ),
        [grades, gradeLevelId]
    );

    const selectedSection = useMemo(
        () =>
            sections.find(
                (s) =>
                    String(s.id) ===
                    String(classSectionId)
            ),
        [sections, classSectionId]
    );

    return (
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 sm:py-8 lg:px-8 animate-in fade-in duration-500">

            {/* PAGE HEADER */}
            <div className="mb-8">
                <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                        <div className="inline-flex items-center gap-2 rounded-full border border-navy-900/10 bg-navy-900/5 px-3 py-1.5 text-xs font-bold text-navy-900">
                            <MessageSquare size={14} />
                            Parent communication
                        </div>

                        <h1 className="mt-3 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                            SMS
                        </h1>

                        <p className="mt-1.5 max-w-2xl text-sm leading-6 text-slate-500">
                            Send targeted SMS messages to parents
                            across your school and track delivery
                            activity.
                        </p>
                    </div>

                    <div className="hidden rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm sm:flex sm:items-center sm:gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                            <Smartphone size={18} />
                        </div>

                        <div>
                            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                                SMS delivery
                            </p>

                            <p className="mt-0.5 text-sm font-semibold text-slate-800">
                                Africa's Talking
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* MAIN COMPOSER */}
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.65fr)]">

                {/* COMPOSE CARD */}
                <form
                    onSubmit={handlePreview}
                    className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm"
                >
                    {/* CARD HEADER */}
                    <div className="border-b border-slate-100 bg-gradient-to-br from-slate-50 via-white to-white px-5 py-5 sm:px-6">
                        <div className="flex items-center gap-3">
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-navy-900 text-white shadow-sm">
                                <Send size={19} />
                            </div>

                            <div>
                                <h2 className="text-base font-bold text-slate-900 sm:text-lg">
                                    Compose message
                                </h2>

                                <p className="mt-0.5 text-xs text-slate-500 sm:text-sm">
                                    Choose who should receive this
                                    message and write your SMS.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6 p-5 sm:p-6">

                        {/* TITLE */}
                        <div>
                            <label
                                htmlFor="sms-title"
                                className="mb-2 block text-sm font-semibold text-slate-800"
                            >
                                Campaign title
                                <span className="ml-1 font-normal text-slate-400">
                                    (internal)
                                </span>
                            </label>

                            <input
                                id="sms-title"
                                value={title}
                                onChange={(e) =>
                                    setTitle(e.target.value)
                                }
                                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm text-slate-800 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-navy-900 focus:ring-4 focus:ring-navy-900/10"
                                placeholder="e.g. Term 3 opening"
                            />

                            <p className="mt-1.5 text-xs text-slate-400">
                                This name is used to identify the
                                campaign in your SMS history.
                            </p>
                        </div>

                        {/* AUDIENCE */}
                        <div>
                            <div className="mb-3">
                                <p className="text-sm font-semibold text-slate-800">
                                    Audience
                                </p>

                                <p className="mt-1 text-xs text-slate-400">
                                    Choose who should receive this
                                    message.
                                </p>
                            </div>

                            <div className="grid gap-3 sm:grid-cols-3">
                                {AUDIENCES.map((item) => {
                                    const Icon = item.icon;
                                    const selected =
                                        audience === item.value;

                                    return (
                                        <button
                                            key={item.value}
                                            type="button"
                                            onClick={() =>
                                                handleAudienceChange(
                                                    item.value
                                                )
                                            }
                                            className={`group rounded-2xl border p-4 text-left transition-all ${
                                                selected
                                                    ? 'border-navy-900 bg-navy-900/[0.04] shadow-sm ring-2 ring-navy-900/10'
                                                    : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                                            }`}
                                        >
                                            <div className="flex items-start justify-between gap-3">
                                                <div
                                                    className={`flex h-10 w-10 items-center justify-center rounded-xl transition-colors ${
                                                        selected
                                                            ? 'bg-navy-900 text-white'
                                                            : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200'
                                                    }`}
                                                >
                                                    <Icon size={18} />
                                                </div>

                                                {selected && (
                                                    <CheckCircle2
                                                        size={17}
                                                        className="text-navy-900"
                                                    />
                                                )}
                                            </div>

                                            <p className="mt-4 text-sm font-bold text-slate-900">
                                                {item.label}
                                            </p>

                                            <p className="mt-1 text-xs leading-5 text-slate-500">
                                                {item.description}
                                            </p>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* CONDITIONAL TARGET */}
                        {audience === 'GRADE' && (
                            <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
                                <label
                                    htmlFor="grade-select"
                                    className="mb-2 block text-sm font-semibold text-slate-800"
                                >
                                    Select grade
                                </label>

                                <select
                                    id="grade-select"
                                    value={gradeLevelId}
                                    onChange={(e) => {
                                        setGradeLevelId(
                                            e.target.value
                                        );
                                        setPreview(null);
                                    }}
                                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm font-medium text-slate-800 shadow-sm outline-none transition focus:border-navy-900 focus:ring-4 focus:ring-navy-900/10"
                                >
                                    <option value="">
                                        Select grade
                                    </option>

                                    {grades.map((g) => (
                                        <option
                                            key={g.id}
                                            value={g.id}
                                        >
                                            {g.name}
                                        </option>
                                    ))}
                                </select>

                                {selectedGrade && (
                                    <div className="mt-3 flex items-center gap-2 rounded-xl bg-white px-3 py-2.5 text-xs text-slate-500 ring-1 ring-slate-200">
                                        <GraduationCap size={14} />
                                        Sending to{' '}
                                        <span className="font-bold text-slate-700">
                                            {selectedGrade.name}
                                        </span>
                                    </div>
                                )}
                            </div>
                        )}

                        {audience === 'CLASS' && (
                            <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
                                <label
                                    htmlFor="class-select"
                                    className="mb-2 block text-sm font-semibold text-slate-800"
                                >
                                    Select class
                                </label>

                                <select
                                    id="class-select"
                                    value={classSectionId}
                                    onChange={(e) => {
                                        setClassSectionId(
                                            e.target.value
                                        );
                                        setPreview(null);
                                    }}
                                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm font-medium text-slate-800 shadow-sm outline-none transition focus:border-navy-900 focus:ring-4 focus:ring-navy-900/10"
                                >
                                    <option value="">
                                        Select class
                                    </option>

                                    {sections.map((s) => (
                                        <option
                                            key={s.id}
                                            value={s.id}
                                        >
                                            {s.gradeLevelName} —{' '}
                                            {s.name}
                                        </option>
                                    ))}
                                </select>

                                {selectedSection && (
                                    <div className="mt-3 flex items-center gap-2 rounded-xl bg-white px-3 py-2.5 text-xs text-slate-500 ring-1 ring-slate-200">
                                        <School size={14} />
                                        Sending to{' '}
                                        <span className="font-bold text-slate-700">
                                            {selectedSection.gradeLevelName}{' '}
                                            —{' '}
                                            {selectedSection.name}
                                        </span>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* MESSAGE */}
                        <div>
                            <div className="mb-2 flex items-center justify-between gap-3">
                                <label
                                    htmlFor="sms-body"
                                    className="block text-sm font-semibold text-slate-800"
                                >
                                    Message
                                </label>

                                <span
                                    className={`text-xs font-semibold ${
                                        body.length > 160
                                            ? 'text-amber-600'
                                            : 'text-slate-400'
                                    }`}
                                >
                                    {body.length} characters
                                </span>
                            </div>

                            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition focus-within:border-navy-900 focus-within:ring-4 focus-within:ring-navy-900/10">
                                <textarea
                                    id="sms-body"
                                    value={body}
                                    onChange={(e) =>
                                        setBody(e.target.value)
                                    }
                                    rows={7}
                                    className="w-full resize-none border-0 bg-white px-4 py-4 text-sm leading-6 text-slate-800 outline-none placeholder:text-slate-400"
                                    placeholder="Write your SMS message..."
                                />

                                <div className="border-t border-slate-100 bg-slate-50 px-4 py-3">
                                    <div className="flex flex-wrap items-center gap-2 text-xs">
                                        <span className="font-semibold text-slate-500">
                                            Available placeholders:
                                        </span>

                                        <span className="rounded-md border border-slate-200 bg-white px-2 py-1 font-mono text-[11px] text-slate-600">
                                            {'{{parentName}}'}
                                        </span>

                                        <span className="rounded-md border border-slate-200 bg-white px-2 py-1 font-mono text-[11px] text-slate-600">
                                            {'{{studentName}}'}
                                        </span>

                                        <span className="rounded-md border border-slate-200 bg-white px-2 py-1 font-mono text-[11px] text-slate-600">
                                            {'{{schoolName}}'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-2 flex items-start gap-2 text-xs text-slate-400">
                                <Info
                                    size={14}
                                    className="mt-0.5 shrink-0"
                                />

                                <p>
                                    Keeping the message under 160
                                    characters can help keep it within
                                    a standard SMS length.
                                </p>
                            </div>
                        </div>

                        {/* FORM ERROR */}
                        {formError && (
                            <div
                                className="flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3.5"
                                role="alert"
                            >
                                <AlertCircle
                                    size={18}
                                    className="mt-0.5 shrink-0 text-rose-600"
                                />

                                <p className="text-sm font-medium leading-6 text-rose-700">
                                    {formError}
                                </p>
                            </div>
                        )}

                        {/* ACTIONS */}
                        <div className="flex flex-col gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
                            <button
                                type="submit"
                                disabled={
                                    previewing || sending
                                }
                                className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-800 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                            >
                                {previewing ? (
                                    <>
                                        <RefreshCw
                                            size={16}
                                            className="animate-spin"
                                        />
                                        Counting recipients...
                                    </>
                                ) : (
                                    <>
                                        <Eye size={16} />
                                        Preview audience
                                    </>
                                )}
                            </button>

                            <button
                                type="button"
                                onClick={handleSend}
                                disabled={
                                    sending ||
                                    previewing ||
                                    !preview ||
                                    preview.recipientCount === 0
                                }
                                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-navy-900 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-navy-800 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                            >
                                {sending ? (
                                    <>
                                        <RefreshCw
                                            size={16}
                                            className="animate-spin"
                                        />
                                        Queuing SMS...
                                    </>
                                ) : (
                                    <>
                                        <Send size={16} />
                                        Send SMS
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </form>

                {/* PREVIEW / RECIPIENT PANEL */}
                <div className="rounded-3xl border border-slate-200 bg-white shadow-sm">
                    <div className="border-b border-slate-100 bg-gradient-to-br from-slate-50 via-white to-white px-5 py-5 sm:px-6">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 text-teal-700">
                                <Eye size={18} />
                            </div>

                            <div>
                                <h2 className="text-base font-bold text-slate-900">
                                    Delivery preview
                                </h2>

                                <p className="mt-0.5 text-xs text-slate-500">
                                    Review the recipients and example
                                    message before sending.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="p-5 sm:p-6">

                        {!preview ? (
                            <div className="flex min-h-[360px] flex-col items-center justify-center text-center">
                                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                                    <MessageSquare size={24} />
                                </div>

                                <p className="mt-5 text-sm font-bold text-slate-700">
                                    No preview yet
                                </p>

                                <p className="mt-1.5 max-w-xs text-xs leading-5 text-slate-400">
                                    Fill in your campaign details and
                                    preview the audience to see how many
                                    parents will receive the SMS.
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-5">

                                {/* RECIPIENT STATS */}
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                                        <div className="flex items-center gap-2 text-teal-700">
                                            <Users size={16} />
                                            <span className="text-xs font-bold uppercase tracking-wider">
                                                Recipients
                                            </span>
                                        </div>

                                        <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
                                            {preview.recipientCount}
                                        </p>

                                        <p className="mt-0.5 text-xs text-slate-400">
                                            parents with a phone
                                        </p>
                                    </div>

                                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                                        <div className="flex items-center gap-2 text-amber-700">
                                            <AlertCircle size={16} />
                                            <span className="text-xs font-bold uppercase tracking-wider">
                                                Skipped
                                            </span>
                                        </div>

                                        <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
                                            {preview.skippedNoPhone}
                                        </p>

                                        <p className="mt-0.5 text-xs text-slate-400">
                                            no phone on file
                                        </p>
                                    </div>
                                </div>

                                {/* TARGET */}
                                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                                    <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">
                                        Audience
                                    </p>

                                    <div className="mt-3 flex items-center gap-3">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-navy-900/5 text-navy-900">
                                            {selectedAudience?.icon && (
                                                <selectedAudience.icon
                                                    size={18}
                                                />
                                            )}
                                        </div>

                                        <div className="min-w-0">
                                            <p className="text-sm font-bold text-slate-900">
                                                {selectedAudience?.label ||
                                                    getAudienceLabel(
                                                        audience
                                                    )}
                                            </p>

                                            <p className="mt-0.5 truncate text-xs text-slate-400">
                                                {audience ===
                                                'CLASS'
                                                    ? selectedSection
                                                        ? `${selectedSection.gradeLevelName} — ${selectedSection.name}`
                                                        : 'Selected class'
                                                    : audience ===
                                                    'GRADE'
                                                        ? selectedGrade?.name ||
                                                        'Selected grade'
                                                        : 'Every parent with a phone number'}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* PHONE SAMPLE */}
                                {preview.sample?.length > 0 && (
                                    <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
                                        <div className="flex items-center gap-2">
                                            <Smartphone
                                                size={15}
                                                className="text-slate-500"
                                            />

                                            <p className="text-xs font-bold text-slate-700">
                                                Sample recipients
                                            </p>
                                        </div>

                                        <div className="mt-3 flex flex-wrap gap-2">
                                            {preview.sample.map(
                                                (phone) => (
                                                    <span
                                                        key={phone}
                                                        className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 font-mono text-[11px] text-slate-500"
                                                    >
                                                        {phone}
                                                    </span>
                                                )
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* EXAMPLE MESSAGE */}
                                <div className="rounded-2xl border border-teal-100 bg-teal-50/50 p-4">
                                    <div className="flex items-center gap-2">
                                        <MessageSquare
                                            size={15}
                                            className="text-teal-700"
                                        />

                                        <p className="text-xs font-bold uppercase tracking-wider text-teal-800">
                                            Example message
                                        </p>
                                    </div>

                                    <div className="mt-3 rounded-2xl rounded-tl-md border border-teal-100 bg-white px-4 py-3.5 shadow-sm">
                                        <p className="whitespace-pre-wrap text-sm leading-6 text-slate-700">
                                            {
                                                preview.exampleMessage
                                            }
                                        </p>
                                    </div>
                                </div>

                                {preview.recipientCount ===
                                    0 && (
                                        <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3.5">
                                            <AlertCircle
                                                size={18}
                                                className="mt-0.5 shrink-0 text-amber-600"
                                            />

                                            <p className="text-sm font-medium leading-6 text-amber-800">
                                                There are no parents with
                                                usable phone numbers in this
                                                audience.
                                            </p>
                                        </div>
                                    )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* CAMPAIGN HISTORY */}
            <div className="mt-8">
                <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <h2 className="text-lg font-bold tracking-tight text-slate-900">
                            Campaign history
                        </h2>

                        <p className="mt-1 text-sm text-slate-500">
                            Review previous SMS campaigns and their
                            delivery counts.
                        </p>
                    </div>

                    {campaigns.length > 0 && (
                        <button
                            type="button"
                            onClick={load}
                            disabled={loading}
                            className="inline-flex w-fit items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-slate-600 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            <RefreshCw
                                size={14}
                                className={
                                    loading
                                        ? 'animate-spin'
                                        : ''
                                }
                            />
                            Refresh
                        </button>
                    )}
                </div>

                {loading && (
                    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                        <TableSkeleton columns={5} rows={4} />
                    </div>
                )}

                {error && !loading && (
                    <div className="flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-4">
                        <AlertCircle
                            size={18}
                            className="mt-0.5 shrink-0 text-rose-600"
                        />

                        <div>
                            <p className="text-sm font-semibold text-rose-800">
                                Could not load SMS campaigns
                            </p>

                            <p className="mt-1 text-sm text-rose-700">
                                {error}
                            </p>
                        </div>
                    </div>
                )}

                {!loading &&
                    !error &&
                    campaigns.length === 0 && (
                        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
                            <EmptyState
                                icon={MessageSquare}
                                title="No SMS yet"
                                description="Create a campaign, preview the audience, and send your first parent message."
                            />
                        </div>
                    )}

                {!loading &&
                    !error &&
                    campaigns.length > 0 && (
                        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                            <div className="overflow-x-auto custom-scrollbar">
                                <table className="w-full min-w-[760px] text-sm text-left">

                                    <thead className="border-b border-slate-200 bg-slate-50">
                                    <tr className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                                        <th className="px-5 py-4 sm:px-6">
                                            Campaign
                                        </th>

                                        <th className="px-5 py-4 sm:px-6">
                                            Audience
                                        </th>

                                        <th className="px-5 py-4 sm:px-6">
                                            Status
                                        </th>

                                        <th className="px-5 py-4 sm:px-6">
                                            Delivery
                                        </th>

                                        <th className="px-5 py-4 sm:px-6">
                                            When
                                        </th>
                                    </tr>
                                    </thead>

                                    <tbody className="divide-y divide-slate-100">
                                    {campaigns.map((c) => {
                                        const status =
                                            getStatusConfig(
                                                c.status
                                            );

                                        const StatusIcon =
                                            status.icon;

                                        const deliveryPercent =
                                            c.recipientCount > 0
                                                ? Math.round(
                                                    ((c.sentCount ||
                                                            0) /
                                                        c.recipientCount) *
                                                    100
                                                )
                                                : 0;

                                        return (
                                            <tr
                                                key={c.id}
                                                className="group transition-colors hover:bg-slate-50/80"
                                            >
                                                {/* CAMPAIGN */}
                                                <td className="px-5 py-4 sm:px-6">
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500 transition-colors group-hover:bg-navy-900/5 group-hover:text-navy-900">
                                                            <MessageSquare
                                                                size={17}
                                                            />
                                                        </div>

                                                        <div className="min-w-0">
                                                            <p className="truncate font-semibold text-slate-900">
                                                                {c.title}
                                                            </p>

                                                            <p className="mt-0.5 text-xs text-slate-400">
                                                                Campaign
                                                                #{c.id}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* AUDIENCE */}
                                                <td className="px-5 py-4 sm:px-6">
                                                        <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-600">
                                                            {getAudienceLabel(
                                                                c.audience
                                                            )}
                                                        </span>
                                                </td>

                                                {/* STATUS */}
                                                <td className="px-5 py-4 sm:px-6">
                                                        <span
                                                            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${status.className}`}
                                                        >
                                                            <StatusIcon
                                                                size={13}
                                                            />
                                                            {status.label}
                                                        </span>
                                                </td>

                                                {/* DELIVERY */}
                                                <td className="px-5 py-4 sm:px-6">
                                                    <div className="min-w-[180px]">
                                                        <div className="flex items-center justify-between gap-3">
                                                                <span className="text-sm font-semibold text-slate-700">
                                                                    {c.sentCount ||
                                                                        0}
                                                                    /
                                                                    {c.recipientCount ||
                                                                        0}
                                                                </span>

                                                            {c.failedCount >
                                                                0 && (
                                                                    <span className="text-xs font-semibold text-rose-600">
                                                                        {
                                                                            c.failedCount
                                                                        }{' '}
                                                                        failed
                                                                    </span>
                                                                )}
                                                        </div>

                                                        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100">
                                                            <div
                                                                className={`h-full rounded-full ${
                                                                    c.failedCount >
                                                                    0
                                                                        ? 'bg-amber-500'
                                                                        : 'bg-teal-500'
                                                                }`}
                                                                style={{
                                                                    width: `${Math.min(
                                                                        deliveryPercent,
                                                                        100
                                                                    )}%`,
                                                                }}
                                                            />
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* DATE */}
                                                <td className="px-5 py-4 text-xs text-slate-500 sm:px-6">
                                                    {c.createdAt
                                                        ? new Date(
                                                            c.createdAt
                                                        ).toLocaleString()
                                                        : '—'}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
            </div>
        </div>
    );
}