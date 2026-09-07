import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Coins, Copy, Save, Loader2 } from 'lucide-react';
import axiosClient from '../../api/axiosClient';

export default function FeeStructures() {
    const [grades, setGrades] = useState([]);
    const [feeItems, setFeeItems] = useState([]);
    const [gradeId, setGradeId] = useState('');
    const [amounts, setAmounts] = useState({}); // feeItemId -> string
    const [copyFrom, setCopyFrom] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [savedMsg, setSavedMsg] = useState('');

    useEffect(() => {
        Promise.all([
            axiosClient.get('/grade-levels'),
            axiosClient.get('/fee-items'),
        ]).then(([g, f]) => {
            setGrades(g.data);
            setFeeItems(f.data);
            if (g.data[0]) setGradeId(String(g.data[0].id));
        }).catch(() => setError('Could not load grades or fee items'))
            .finally(() => setLoading(false));
    }, []);

    const loadStructure = useCallback(async () => {
        if (!gradeId) return;
        setError('');
        setSavedMsg('');
        try {
            const { data } = await axiosClient.get(`/fee-structures/${gradeId}`);
            const map = {};
            data.forEach((l) => { map[l.feeItemId] = String(l.amount); });
            setAmounts(map);
        } catch {
            setError('Could not load this grade’s fee structure');
        }
    }, [gradeId]);

    useEffect(() => { queueMicrotask(() => loadStructure()); }, [loadStructure]);

    const setAmount = (itemId, value) => {
        setAmounts((prev) => ({ ...prev, [itemId]: value }));
    };

    const handleSave = async (e) => {
        e.preventDefault();
        const lines = feeItems
            .map((item) => ({ feeItemId: item.id, amount: amounts[item.id] }))
            .filter((l) => l.amount !== undefined && l.amount !== '' && Number(l.amount) > 0)
            .map((l) => ({ feeItemId: l.feeItemId, amount: Number(l.amount) }));
        setSaving(true);
        setError('');
        setSavedMsg('');
        try {
            await axiosClient.put(`/fee-structures/${gradeId}`, { lines });
            setSavedMsg('Saved successfully. Generated invoices will use these amounts for this grade.');
        } catch (err) {
            setError(err.response?.data?.message || 'Could not save');
        } finally {
            setSaving(false);
        }
    };

    const handleCopy = async () => {
        if (!copyFrom) return;
        setSaving(true);
        setError('');
        try {
            const { data } = await axiosClient.post(`/fee-structures/${gradeId}/copy-from`, {
                sourceGradeLevelId: Number(copyFrom),
            });
            const map = {};
            data.forEach((l) => { map[l.feeItemId] = String(l.amount); });
            setAmounts(map);
            setSavedMsg('Structure copied successfully. Changes are applied.');
        } catch (err) {
            setError(err.response?.data?.message || 'Could not copy');
        } finally {
            setSaving(false);
        }
    };

    const gradeName = grades.find((g) => String(g.id) === gradeId)?.name || '';

    return (
        <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 animate-in fade-in duration-500">
            {/* BACK LINK */}
            <Link to="/fees" className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors mb-6">
                <ArrowLeft size={16} /> Back to Fee Collection
            </Link>

            {/* HEADER */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">Fee Structures</h1>
                <p className="text-sm text-slate-500 mt-1.5">
                    Define tuition and itemized fee allocations per grade level. Blank fields indicate the item is not billed for the selected grade.
                </p>
            </div>

            {/* CONTROLS BAR */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 mb-6 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
                <div className="w-full sm:w-auto">
                    <label className="block text-xs font-bold tracking-wider text-slate-400 uppercase mb-2">Select Grade Level</label>
                    <select
                        value={gradeId}
                        onChange={(e) => setGradeId(e.target.value)}
                        className="px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-medium text-slate-800 min-w-[16rem] focus:outline-none focus:ring-2 focus:ring-navy-900/20"
                    >
                        {grades.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
                    </select>
                </div>

                <div className="w-full sm:w-auto">
                    <label className="block text-xs font-bold tracking-wider text-slate-400 uppercase mb-2">Copy Structure From</label>
                    <div className="flex gap-2.5">
                        <select
                            value={copyFrom}
                            onChange={(e) => setCopyFrom(e.target.value)}
                            className="px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-navy-900/20"
                        >
                            <option value="">Select source grade...</option>
                            {grades.filter((g) => String(g.id) !== gradeId).map((g) => (
                                <option key={g.id} value={g.id}>{g.name}</option>
                            ))}
                        </select>
                        <button
                            type="button"
                            onClick={handleCopy}
                            disabled={!copyFrom || saving}
                            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-sm font-semibold transition-all disabled:opacity-50 shadow-sm"
                        >
                            <Copy size={15} /> Copy
                        </button>
                    </div>
                </div>
            </div>

            {/* ALERTS */}
            {error && (
                <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 text-sm font-medium text-rose-700 mb-6 shadow-sm">
                    {error}
                </div>
            )}
            {savedMsg && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-sm font-medium text-emerald-800 mb-6 shadow-sm">
                    {savedMsg}
                </div>
            )}

            {/* CONTENT AREA */}
            {loading ? (
                <div className="flex items-center justify-center py-20 bg-white rounded-2xl border border-slate-200 shadow-sm">
                    <Loader2 size={24} className="animate-spin text-slate-400 mr-2" />
                    <span className="text-sm font-medium text-slate-500">Loading fee structure...</span>
                </div>
            ) : (
                <form onSubmit={handleSave}>
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-6">
                        <div className="overflow-x-auto custom-scrollbar">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-slate-50 border-b border-slate-200">
                                <tr className="text-[11px] font-bold tracking-wider text-slate-500 uppercase">
                                    <th className="px-6 py-4">Fee Item</th>
                                    <th className="px-6 py-4 w-72">Amount (KES) for {gradeName.toUpperCase()}</th>
                                </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                {feeItems.length === 0 && (
                                    <tr>
                                        <td colSpan={2} className="px-6 py-12 text-center text-slate-400 font-medium">
                                            No fee items found. Please add fee items first.
                                        </td>
                                    </tr>
                                )}
                                {feeItems.map((item) => (
                                    <tr key={item.id} className="group bg-white hover:bg-slate-50/80 transition-colors">
                                        <td className="px-6 py-4 font-semibold text-slate-900">
                                            <div className="flex items-center gap-2.5">
                                                <div className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600">
                                                    <Coins size={16} />
                                                </div>
                                                {item.name}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <input
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                placeholder="Not billed"
                                                value={amounts[item.id] ?? ''}
                                                onChange={(e) => setAmount(item.id, e.target.value)}
                                                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-navy-900/20"
                                            />
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={saving || !gradeId}
                        className="flex items-center gap-2 px-6 py-3 rounded-xl bg-navy-900 hover:bg-navy-800 text-white text-sm font-semibold transition-all shadow-sm disabled:opacity-50 active:scale-[0.98]"
                    >
                        {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                        {saving ? 'Saving Structure...' : `Save ${gradeName} Structure`}
                    </button>
                </form>
            )}
        </div>
    );
}