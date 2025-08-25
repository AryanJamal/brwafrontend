import { useState, useEffect } from 'react';
import { api } from '../services/apiService';
import { Plus, Edit, Trash2, X, Check, DollarSign, User, Phone, Wallet, Receipt } from 'lucide-react';
import formatDate from '../components/formatdate';

const Debts = () => {
    const [debts, setDebts] = useState([]);
    const [safes, setSafes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showDebtForm, setShowDebtForm] = useState(false);
    const [showRepaymentForm, setShowRepaymentForm] = useState(false);
    const [selectedDebt, setSelectedDebt] = useState(null);

    const [debtFormData, setDebtFormData] = useState({
        debt_safe_id: '',
        debtor_name: '',
        debtor_phone: '',
        total_amount: '',
        currency: 'USD',
        note: ''
    });

    const [repaymentFormData, setRepaymentFormData] = useState({
        amount: ''
    });

    // Fetch initial data
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [debtsRes, safesRes] = await Promise.all([
                    api.debt.getAll(),
                    api.safeTypes.getAll()
                ]);

                setDebts(debtsRes.data);
                setSafes(safesRes.data);
                setLoading(false);
            } catch (err) {
                setError(err.message);
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleDebtInputChange = (e) => {
        const { name, value } = e.target;
        setDebtFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleRepaymentInputChange = (e) => {
        const { name, value } = e.target;
        setRepaymentFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleDebtSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.debt.create(debtFormData);
            const res = await api.debt.getAll();
            setDebts(res.data);
            resetDebtForm();
        } catch (err) {
            setError(err.message);
        }
    };

    const handleRepaymentSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.debtrepayment.create({
                debt_id: selectedDebt.id,
                amount: parseFloat(repaymentFormData.amount)
            });

            const res = await api.debt.getAll();
            setDebts(res.data);
            setRepaymentFormData({ amount: '' });
            setShowRepaymentForm(false);
            setSelectedDebt(null);
        } catch (err) {
            setError(err.message);
        }
    };

    const handleAddRepayment = (debt) => {
        setSelectedDebt(debt);
        setRepaymentFormData({ amount: '' });
        setShowRepaymentForm(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this debt?')) {
            try {
                await api.debt.delete(id);
                setDebts(debts.filter(d => d.id !== id));
            } catch (err) {
                setError(err.message);
            }
        }
    };

    const resetDebtForm = () => {
        setDebtFormData({
            debt_safe: '',
            debtor_name: '',
            debtor_phone: '',
            total_amount: '',
            currency: 'USD',
            note: ''
        });
        setShowDebtForm(false);
    };

    const getProgressPercentage = (debt) => {
        return (parseFloat(debt.amount_repaid) / parseFloat(debt.total_amount)) * 100;
    };

    if (loading) return (
        <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
        </div>
    );

    if (error) return (
        <div className="p-4 min-h-screen text-white">
            <div className="mx-auto max-w-7xl">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold">قەرز و وەرگرتنی پارە</h1>
                </div>
                <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl shadow-lg p-4 sm:p-6 md:p-0 overflow-hidden">
                    <div className="gap-3 p-4 text-left text-red-700">
                        Error: {error}
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div className="p-4 min-h-screen bg-slate-50-900 ml-0 sm:mt-6 md:mt-0 xsm:mt-6">
            <div className="mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-white">بەڕێوەبردنی قەرز</h1>
                <button
                    onClick={() => setShowDebtForm(!showDebtForm)}
                    className="flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 text-white px-4 py-2 rounded-lg transition-all"
                >
                    <Plus size={18} />
                    {showDebtForm ? "لابردن" : "زیادکردن"}
                </button>
            </div>

            {/* Debt Form Panel */}
            {showDebtForm && (
                <div className="bg-slate-800/80 backdrop-blur-lg border border-white/20 rounded-xl shadow-lg p-6 mb-8 transition-all">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold text-white">
                            {"پێدانی قەرز"}
                        </h2>
                        <button onClick={resetDebtForm} className="text-white/70 hover:text-white">
                            <X size={20} />
                        </button>
                    </div>

                    <form onSubmit={handleDebtSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Debt Safe */}
                        <div>
                            <label className="block text-white/80 mb-2">قاسە</label>
                            <select
                                name="debt_safe_id"
                                value={debtFormData.debt_safe_id}
                                onChange={handleDebtInputChange}
                                className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                                required
                            >
                                <option value="">Select Safe</option>
                                {safes.map(safe => (
                                    <option key={safe.id} value={safe.id}>{safe.name} ({safe.type})</option>
                                ))}
                            </select>
                        </div>

                        {/* Debtor Name */}
                        <div>
                            <label className="block text-white/80 mb-2">ناوی قەرزدار</label>
                            <input
                                type="text"
                                name="debtor_name"
                                value={debtFormData.debtor_name}
                                onChange={handleDebtInputChange}
                                className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                                required
                            />
                        </div>

                        {/* Debtor Phone */}
                        <div>
                            <label className="block text-white/80 mb-2">ژمارەی مۆبایل</label>
                            <input
                                type="tel"
                                name="debtor_phone"
                                value={debtFormData.debtor_phone}
                                onChange={handleDebtInputChange}
                                className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                            />
                        </div>

                        {/* Total Amount */}
                        <div>
                            <label className="block text-white/80 mb-2">بڕێ قەرز</label>
                            <input
                                type="number"
                                name="total_amount"
                                value={debtFormData.total_amount}
                                onChange={handleDebtInputChange}
                                className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                                required
                                step="0.01"
                                min="0"
                            />
                        </div>

                        {/* Currency */}
                        <div>
                            <label className="block text-white/80 mb-2">دراو</label>
                            <select
                                name="currency"
                                value={debtFormData.currency}
                                onChange={handleDebtInputChange}
                                className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                                required
                            >
                                <option value="USD">USD</option>
                                <option value="IQD">IQD</option>
                            </select>
                        </div>

                        {/* Note */}
                        <div className="md:col-span-2">
                            <label className="block text-white/80 mb-2">تێبینـی</label>
                            <textarea
                                name="note"
                                value={debtFormData.note}
                                onChange={handleDebtInputChange}
                                className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                                rows="3"
                            />
                        </div>

                        {/* Form Actions */}
                        <div className="md:col-span-2 flex gap-3 pt-2">
                            <button
                                type="submit"
                                className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-all"
                            >
                                <Check size={18} />
                                {"پێدانی قەرز"}
                            </button>

                            <button
                                type="button"
                                onClick={resetDebtForm}
                                className="flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white px-4 py-2 rounded-lg transition-all"
                            >
                                <X size={18} />
                                هەڵوەشاندنەوە
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Repayment Form Panel */}
            {showRepaymentForm && selectedDebt && (
                <div className="bg-slate-800/80 backdrop-blur-lg border border-white/20 rounded-xl shadow-lg p-6 mb-8 transition-all">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold text-white">
                            وەرگرتنەوەی قەرز لە {selectedDebt.debtor_name}
                        </h2>
                        <button onClick={() => setShowRepaymentForm(false)} className="text-white/70 hover:text-white">
                            <X size={20} />
                        </button>
                    </div>

                    <div className="mb-4 p-3 bg-white/5 rounded-lg">
                        <p className="text-white/80">بڕی قەرز: {Number(selectedDebt.total_amount).toLocaleString()} {selectedDebt.currency}</p>
                        <p className="text-white/80">بڕی وەرگیراو: {Number(selectedDebt.amount_repaid).toLocaleString()} {selectedDebt.currency}</p>
                        <p className="text-white font-medium">
                            ماوە: {Number(selectedDebt.remaining_amount).toLocaleString()} {selectedDebt.currency}
                        </p>
                    </div>

                    <form onSubmit={handleRepaymentSubmit} className="space-y-4">
                        <div>
                            <label className="block text-white/80 mb-2">بڕی وەرگرتن</label>
                            <input
                                type="number"
                                name="amount"
                                value={repaymentFormData.amount}
                                onChange={handleRepaymentInputChange}
                                className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                                required
                                step="0.01"
                                min="0.01"
                                max={selectedDebt.remaining_amount}
                            />
                        </div>

                        <div className="flex gap-3 pt-2">
                            <button
                                type="submit"
                                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-all"
                            >
                                <Check size={18} />
                                وەرگرتن
                            </button>

                            <button
                                type="button"
                                onClick={() => setShowRepaymentForm(false)}
                                className="flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white px-4 py-2 rounded-lg transition-all"
                            >
                                <X size={18} />
                                لابردن
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Debts List */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {debts.length === 0 ? (
                    <div className="col-span-full bg-slate-800/80 backdrop-blur-sm border border-white/20 rounded-xl p-6 text-center text-white/60">
                        No debts found
                    </div>
                ) : (
                    debts.map((debt) => (
                        <div key={debt.id} className="bg-slate-800/80 backdrop-blur-lg border border-white/20 rounded-xl shadow-lg p-6 hover:bg-slate-800/90 transition-colors">
                            {/* Header */}
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="text-lg font-semibold text-white">{debt.debtor_name}</h3>
                                    {debt.debtor_phone && (
                                        <p className="text-white/70 flex items-center gap-2">
                                            <Phone size={14} /> {debt.debtor_phone}
                                        </p>
                                    )}
                                </div>
                                <span className={`px-2 py-1 rounded-full text-xs ${debt.is_fully_paid
                                        ? 'bg-green-500/20 text-green-300'
                                        : 'bg-amber-500/20 text-amber-300'
                                    }`}>
                                    {debt.is_fully_paid ? 'وەرگیراو' : 'قەرزدار'}
                                </span>
                            </div>

                            {/* Safe Info */}
                            <div className="flex items-center gap-2 mb-4 text-white/80">
                                <Wallet size={16} />
                                <span>{debt.debt_safe.name} ({debt.debt_safe.type})</span>
                            </div>

                            {/* Amount Information */}
                            <div className="mb-4">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-white/80">بڕی قەرز:</span>
                                    <span className="text-white font-semibold">
                                        {parseFloat(debt.total_amount).toFixed(2)} {debt.currency}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-white/80">کۆی وەرگیراو:</span>
                                    <span className="text-green-400">
                                        {parseFloat(debt.amount_repaid).toFixed(2)} {debt.currency}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center mb-3">
                                    <span className="text-white/80">ماوە:</span>
                                    <span className="text-amber-400 font-semibold">
                                        {parseFloat(debt.remaining_amount).toFixed(2)} {debt.currency}
                                    </span>
                                </div>

                                {/* Progress Bar */}
                                <div className="w-full bg-white/10 rounded-full h-2 mb-1">
                                    <div
                                        className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all duration-300"
                                        style={{ width: `${getProgressPercentage(debt)}%` }}
                                    />
                                </div>
                                <div className="text-right text-xs text-white/60">
                                    {getProgressPercentage(debt)}% دراوە
                                </div>
                            </div>

                            {/* Repayments */}
                            {debt.repayments && debt.repayments.length > 0 && (
                                <div className="mb-4">
                                    <h4 className="text-white/80 font-medium mb-2 flex items-center gap-2">
                                        <Receipt size={16} /> دانەوەی قەرز
                                    </h4>
                                    <div className="space-y-1">
                                        {debt.repayments.map((repayment) => (
                                            <div key={repayment.id} className="flex justify-between items-center text-sm">
                                                <span className="text-white/70">{formatDate(repayment.created_at)}</span>
                                                <span className="text-green-400">
                                                    +{parseFloat(repayment.amount).toLocaleString()} {debt.currency}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Note */}
                            {debt.note && (
                                <div className="mb-4 p-3 bg-white/5 rounded-lg">
                                    <p className="text-white/80 text-sm">{debt.note}</p>
                                </div>
                            )}

                            {/* Actions */}
                            <div className="flex justify-between items-center pt-4 border-t border-white/10">
                                <div className="text-sm text-white/60">
                                    لە بەرواری: {formatDate(debt.created_at)}
                                </div>
                                <div className="flex gap-2">
                                    {!debt.is_fully_paid && (
                                        <button
                                            onClick={() => handleAddRepayment(debt)}
                                            className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm transition-colors"
                                        >
                                            دانەوەی قەرز
                                        </button>
                                    )}
                                    <button
                                        onClick={() => handleDelete(debt.id)}
                                        className="p-1 text-white/70 hover:text-red-400 transition-colors"
                                        title="Delete"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
        </div>
    );
};

export default Debts;