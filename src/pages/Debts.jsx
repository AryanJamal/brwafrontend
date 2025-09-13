import { useState, useEffect } from 'react';
import { api } from '../services/apiService';
import { Plus, Coins, Trash2, X, Check, DollarSign, Filter, XCircle, Phone, Wallet, Receipt } from 'lucide-react';
import formatDate from '../components/formatdate';
import selectStyles from '../components/styles';
import Select from 'react-select';

const Debts = () => {
    const [debts, setDebts] = useState([]);
    const [safes, setSafes] = useState([]);
    const [safePartners, setSafePartners] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showDebtForm, setShowDebtForm] = useState(false);
    const [showFilters, setShowFilters] = useState(false);
    const [showRepaymentForm, setShowRepaymentForm] = useState(false);
    const [search, setSearch] = useState("");
    const [filterTransactionType, setFilterTransactionType] = useState(null);
    const [selectedDebt, setSelectedDebt] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [filterSafePartner, setFilterSafePartner] = useState(null);
    const [filterSafe, setFilterSafe] = useState(null);
    // eslint-disable-next-line no-unused-vars
    const [pageSize, setPageSize] = useState(30); // same as backend default
    const [totalPages, setTotalPages] = useState(1);

    const [debtFormData, setDebtFormData] = useState({
        debt_safe_id: '',
        debtor_name: '',
        debtor_phone: '',
        safe_partner_id: '',
        total_amount: '',
        currency: 'USD',
        note: ''
    });

    const [repaymentFormData, setRepaymentFormData] = useState({
        amount: '',
        safe_type_id: '',
        currency: 'USD',
        conversion_rate: 1,
    });

    const partnerOptions = safePartners.map(partner => ({
        value: partner.id,
        label: `${partner.partner.name} - ${partner.safe_type.name}`
    }));

    // Fetch initial data
    const fetchData = async (params = {}) => {
        try {
            setLoading(true);
            const [debtsRes, safesRes, safePartners] = await Promise.all([
                api.debt.getAll({
                    page: currentPage,
                    page_size: pageSize,
                    ...params
                }),
                api.safeTypes.getAll(),
                api.safePartnersApi.getAll()
            ]);

            setDebts(debtsRes.data.results);
            setTotalPages(Math.ceil(debtsRes.data.count / pageSize));
            setSafes(safesRes.data);
            setSafePartners(safePartners.data);
            setLoading(false);
        } catch (err) {
            setError(err.message);
            setLoading(false);
        }
    };
    useEffect(() => {
        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentPage, pageSize]);
    const handleFilterSubmit = () => {
        const params = {};
        if (search) params.search = search;
        if (filterTransactionType) params.transaction_type = filterTransactionType.value;
        if (filterSafePartner) params.safe_partner_id = filterSafePartner.value;
        if (filterSafe) params.debt_safe_id = filterSafe.value;

        fetchData(params);
    };
    const handleResetFilters = () => {
        setShowFilters(false);
        setSearch("");
        setFilterTransactionType(null);
        setFilterSafePartner(null);
        setFilterSafe(null);
        fetchData();
    };


    const handleSelectChange = (selectedOption, actionMeta) => {
        const { name } = actionMeta;
        setDebtFormData(prev => ({
            ...prev,
            [name]: selectedOption ? selectedOption.value : ''
        }));
    };
    const handleRSelectChange = (selectedOption, actionMeta) => {
        const { name } = actionMeta;
        setRepaymentFormData(prev => ({
            ...prev,
            [name]: selectedOption ? selectedOption.value : ''
        }));
    };

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
                amount: parseFloat(repaymentFormData.amount),
                safe_type_id: repaymentFormData.safe_type_id,
                currency: repaymentFormData.currency,
                conversion_rate: repaymentFormData.conversion_rate
            });

            const res = await api.debt.getAll();
            setDebts(res.data);
            setRepaymentFormData({ amount: '', safe_type_id: '', currency: 'USD', conversion_rate: 1 });
            setShowRepaymentForm(false);
            setSelectedDebt(null);
        } catch (err) {
            setError(err.message);
        }
    }

    const handleAddRepayment = (debt) => {
        setSelectedDebt(debt);
        setRepaymentFormData({ amount: '', safe_type_id: '', currency: 'USD', conversion_rate: 1 }); // Reset repayment form
        setShowRepaymentForm(true);
    };

    const handleDelete = async (id) => {
        // Find the debt to check for repayments
        const debtToDelete = debts.find(d => d.id === id);

        // If the debt has repayments, prevent deletion and show an alert
        if (debtToDelete && debtToDelete.repayments && debtToDelete.repayments.length > 0) {
            alert('This debt has repayments and cannot be deleted. You must delete all repayments first.');
            return;
        }

        if (window.confirm('Are you sure you want to delete this debt?')) {
            try {
                await api.debt.delete(id);
                setDebts(debts.filter(d => d.id !== id));
            } catch (err) {
                setError(err.message);
            }
        }
    };

    // New function to handle deleting a single repayment
    // eslint-disable-next-line no-unused-vars
    const handleDeleteRepayment = async (repaymentId, debtId) => {
        if (window.confirm('Are you sure you want to delete this repayment?')) {
            try {
                // Assuming you have a delete method for repayments in your API
                await api.debtrepayment.delete(repaymentId);

                // Re-fetch all debts to get the updated list
                const res = await api.debt.getAll();
                setDebts(res.data);

                // Optional: You could also update the state more efficiently without a full re-fetch
                // by finding the debt and removing the repayment from its array.

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
            safe_partner_id: '',
            currency: 'USD',
            note: ''
        });
        setShowDebtForm(false);
    };
    const safeOptions = safes.map(safe => ({
        value: safe.id,
        label: `${safe.name}`
    }));

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
                    <div className="flex gap-2">
                        <button
                            onClick={() => {
                                if (showFilters) {
                                    setShowFilters(false);
                                } else {
                                    setShowDebtForm(false);
                                    setShowFilters(true);
                                }
                            }}
                            className="flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 text-white px-4 py-2 rounded-lg transition-all"
                        >
                            <Filter size={18} />
                            {showFilters ? "لابردن" : "فلتەرکردن"}
                        </button>
                        <button
                            onClick={() => {setShowDebtForm(!showDebtForm),setShowFilters(false)}}
                            className="flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 text-white px-4 py-2 rounded-lg transition-all"
                        >
                            <Plus size={18} />
                            {showDebtForm ? "لابردن" : "زیادکردن"}
                        </button>
                    </div>
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
                                <Select
                                    name="debt_safe_id"
                                    menuPortalTarget={document.body}
                                    options={safeOptions}
                                    value={safeOptions.find(option => option.value === debtFormData.debt_safe_id) || null}
                                    onChange={handleSelectChange}
                                    styles={selectStyles}
                                    placeholder="قاسەی دیاری بکە..."
                                    isClearable
                                    isSearchable
                                />
                            </div>

                            <div>
                                <label className="block text-white/80 mb-2">قەرزدار</label>
                                <Select
                                    name="safe_partner_id"
                                    menuPortalTarget={document.body}
                                    options={partnerOptions}
                                    value={partnerOptions.find(option => option.value === debtFormData.safe_partner_id) || null}
                                    onChange={handleSelectChange}
                                    styles={selectStyles}
                                    placeholder="ناوی دیاری بکە..."
                                    isClearable
                                    isSearchable
                                />
                            </div>

                            {/* Debtor Name */}
                            <div>
                                <label className="block text-white/80 mb-2">ناوی قەرزدار</label>
                                <input
                                    type="text"
                                    name="debtor_name"
                                    placeholder='ناوی قەرزدار..'
                                    value={debtFormData.debtor_name}
                                    onChange={handleDebtInputChange}
                                    className="w-full bg-white/5 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                                />
                            </div>

                            {/* Debtor Phone */}
                            <div>
                                <label className="block text-white/80 mb-2">ژمارەی مۆبایل</label>
                                <input
                                    type="tel"
                                    name="debtor_phone"
                                    value={debtFormData.debtor_phone}
                                    placeholder='0770-XXX-XXXX'
                                    onChange={handleDebtInputChange}
                                    className="w-full bg-white/5 text-right rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                                />
                            </div>

                            {/* Total Amount */}
                            <div>
                                <label className="block text-white/80 mb-2">بڕی قەرز</label>
                                <input
                                    type="number"
                                    name="total_amount"
                                    value={debtFormData.total_amount}
                                    onChange={handleDebtInputChange}
                                    className="w-full bg-white/5 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                                    required
                                    placeholder='0'
                                    step="0.01"
                                    min="0"
                                />
                            </div>

                            {/* Currency */}
                            <div>
                                <label className="block text-slate-300 mb-2">جۆری دراو</label>
                                <div className="grid grid-cols-3 gap-2">
                                    <button
                                        type="button"
                                        onClick={() => handleDebtInputChange({ target: { name: "currency", value: "USDT" } })}
                                        className={`flex flex-col items-center justify-center py-2 rounded-lg transition-all ${debtFormData.currency === "USDT"
                                            ? "bg-blue-600 text-white"
                                            : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                                            }`}
                                    >
                                        <Coins size={18} />
                                        <span className="text-sm mt-1">USDT</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleDebtInputChange({ target: { name: "currency", value: "USD" } })}
                                        className={`flex flex-col items-center justify-center py-2 rounded-lg transition-all ${debtFormData.currency === "USD"
                                            ? "bg-blue-600 text-white"
                                            : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                                            }`}
                                    >
                                        <DollarSign size={18} />
                                        <span className="text-sm mt-1">USD</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleDebtInputChange({ target: { name: "currency", value: "IQD" } })}
                                        className={`flex flex-col items-center justify-center py-2 rounded-lg transition-all ${debtFormData.currency === "IQD"
                                            ? "bg-blue-600 text-white"
                                            : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                                            }`}
                                    >
                                        <Wallet size={18} />
                                        <span className="text-sm mt-1">IQD</span>
                                    </button>
                                </div>
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
                {/* Filter Section */}
                {showFilters && (
                    <div className="bg-slate-800/80 backdrop-blur-lg border border-white/20 rounded-xl shadow-lg p-6 mb-8 transition-all">
                        <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                            <Filter size={20} /> گەڕان و فلتەر
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {/* Search Input */}
                            <div>
                                <label className="block text-white/80 mb-2">گەڕان</label>
                                <input
                                    type="text"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="w-full bg-white/5 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                                    placeholder="ناوی قەرزدار - بڕی پارە - تێبینی"
                                />
                            </div>
                        </div>
                        <div className="flex gap-3 mt-4">
                            <button
                                onClick={handleFilterSubmit}
                                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-all"
                            >
                                <Filter size={18} /> فلتەر
                            </button>
                            <button
                                onClick={handleResetFilters}
                                className="flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white px-4 py-2 rounded-lg transition-all"
                            >
                                <XCircle size={18} /> لابردنی فلتەرەکان
                            </button>
                        </div>
                    </div>
                )}


                {/* Repayment Form Panel */}
                {showRepaymentForm && selectedDebt && (
                    <div className="bg-slate-800/80 backdrop-blur-lg border border-white/20 rounded-xl shadow-lg p-6 mb-8 transition-all">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold text-white">
                                وەرگرتنەوەی قەرز لە {selectedDebt.debtor_name ? selectedDebt.debtor_name : selectedDebt.safe_partner_name}
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
                            {/* Amount */}
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
                                />
                            </div>
                            {/* Conversion Rate (only show if different currency) */}
                            {repaymentFormData.currency !== selectedDebt.currency && (
                                <div>
                                    <label className="block text-white/80 mb-2"> نرخ گۆڕین </label>
                                    <input
                                        type="number"
                                        name="conversion_rate"
                                        value={repaymentFormData.conversion_rate}
                                        onChange={handleRepaymentInputChange}
                                        className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                                        step="0.01"
                                        min="0.01"
                                        required
                                    />
                                </div>
                            )}

                            {/* Safe Type */}
                            <div>
                                <label className="block text-white/80 mb-2">قاسەی وەرگرتن</label>
                                <Select
                                    name="safe_type_id"
                                    menuPortalTarget={document.body}
                                    options={safeOptions}
                                    value={safeOptions.find(option => option.value === repaymentFormData.safe_type_id) || null}
                                    onChange={handleRSelectChange}
                                    styles={selectStyles}
                                    placeholder="قاسە دیاری بکە..."
                                    isClearable
                                    isSearchable
                                />
                            </div>

                            {/* Currency */}
                            <div>
                                <label className="block text-white/80 mb-2">دراو</label>
                                <div className="flex border border-white/20">
                                    <button
                                        type="button"
                                        onClick={() => handleRepaymentInputChange({ target: { name: "currency", value: "USD" } })}
                                        className={`flex-1 flex items-center justify-center gap-1 py-2 rounded-md transition-all ${repaymentFormData.currency === "USD"
                                            ? "bg-blue-600 text-white"
                                            : "text-white/70 hover:bg-white/10"
                                            }`}
                                    >
                                        <DollarSign size={18} /> USD
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleRepaymentInputChange({ target: { name: "currency", value: "USDT" } })}
                                        className={`flex-1 flex items-center justify-center gap-1 py-2 rounded-md transition-all ${repaymentFormData.currency === "USDT"
                                            ? "bg-blue-600 text-white"
                                            : "text-white/70 hover:bg-white/10"
                                            }`}
                                    >
                                        <Coins size={18} /> USDT
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleRepaymentInputChange({ target: { name: "currency", value: "IQD" } })}
                                        className={`flex-1 flex items-center justify-center gap-1 py-2 rounded-md transition-all ${repaymentFormData.currency === "IQD" ? "bg-blue-600 text-white" : "text-white/70 hover:bg-white/10"
                                            }`}
                                    >
                                        <Wallet size={18} /> IQD
                                    </button>
                                </div>
                            </div>

                            {/* Actions */}
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
                <div className="bg-white/10 backdrop-blur-lg rounded-xl shadow-lg p-4 sm:p-6 md:p-0 overflow-hidden">
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
                                            <h3 className="text-lg font-semibold text-white">{debt.debtor_name ? debt.debtor_name : debt.safe_partner_name}</h3>
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
                                                style={{ width: `${Math.min(getProgressPercentage(debt), 100)}%` }}
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
                                                        <span className="text-green-400 flex items-center gap-2">
                                                            +{parseFloat(repayment.amount).toLocaleString()} {repayment.currency}
                                                            {/* Add delete button for each repayment */}
                                                            <button
                                                                onClick={() => handleDeleteRepayment(repayment.id, debt.id)}
                                                                className="text-red-400 hover:text-red-500 transition-colors"
                                                                title="Delete Repayment"
                                                            >
                                                                <Trash2 size={14} />
                                                            </button>
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
                                            {/* Conditionally render the delete button based on whether there are repayments */}
                                            {debt.repayments && debt.repayments.length === 0 && (
                                                <button
                                                    onClick={() => handleDelete(debt.id)}
                                                    className="p-1 text-white/70 hover:text-red-400 transition-colors"
                                                    title="Delete"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
                <div className="flex justify-center mt-6 gap-2">
                    <button
                        onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="px-3 py-1 bg-white/10 text-white rounded disabled:opacity-50"
                    >
                        پێشتر
                    </button>

                    <span className="text-white">
                        {currentPage} لە {totalPages}
                    </span>

                    <button
                        onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="px-3 py-1 bg-white/10 text-white rounded disabled:opacity-50"
                    >
                        دواتر
                    </button>
                </div>

            </div>
        </div>
    );
};

export default Debts;