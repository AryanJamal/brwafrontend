import { useState, useEffect } from 'react';
import { api } from '../services/apiService';
import { ArrowDown, Trash2, AlertTriangle, X, Filter, Search, ArrowUp, Clock, CheckCircle, XCircle, Wallet, DollarSign, Gift, FileText } from 'lucide-react';
import formatDate from '../components/formatdate';
import selectStyles from '../components/styles';
import Select from 'react-select';

const OutgoingMoney = () => {
    const [transactions, setTransactions] = useState([]);
    const [count, setCount] = useState(0);  // total results
    const [page, setPage] = useState(1);    // current page
    // eslint-disable-next-line no-unused-vars
    const [pageSize, setPageSize] = useState(30); // items per page
    const [bonus, setBonus] = useState(0); // items per page
    const [bonus2, setBonus2] = useState(0); // items per page
    const [partners, setPartners] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [showFilters, setShowFilters] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [transactionToDelete, setTransactionToDelete] = useState(null);
    const [showConfirmModal, setShowConfirmModal] = useState(false);

    const [filters, setFilters] = useState({
        searchQuery: '',
        status: '',
        startDate: '',
        endDate: '',
        fromPartner: '',
        toPartner: ''
    });

    const [formData, setFormData] = useState({
        from_partner: '',
        money_amount: '',
        currency: 'USD',
        to_partner: '',
        from_name: '',
        from_number: '',
        status: 'Pending',
        taker_name: '',
        my_bonus: 0,
        partner_bonus: 0,
        bonus_currency: 'USD',
        note: ''
    });

    const fetchTransactions = async () => {
        setLoading(true);
        try {
            const queryParams = {
                page,
                page_size: pageSize,
            };
            if (filters.searchQuery.trim()) {
                queryParams.search = filters.searchQuery.trim();
            }
            if (filters.status) {
                queryParams.status = filters.status;
            }
            if (filters.startDate) {
                queryParams.start_date = filters.startDate;
            }
            if (filters.endDate) {
                queryParams.end_date = filters.endDate;
            }
            if (filters.fromPartner) {
                queryParams.from_partner = filters.fromPartner;
            }
            if (filters.toPartner) {
                queryParams.to_partner = filters.toPartner;
            }

            const transRes = await api.outgoingMoney.getAll(queryParams);
            setTransactions(transRes.data);
            setCount(transRes.data.count);
            setLoading(false);
        } catch (err) {
            setError(err.message);
            setLoading(false);
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const partnersRes = await api.safePartnersApi.getAll();
                setPartners(partnersRes.data);
                await fetchTransactions();
            } catch (err) {
                setError(err.message);
                setLoading(false);
            }
        };
        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page, pageSize]);

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.outgoingMoney.create(formData);
            await fetchTransactions();
            resetForm();
        } catch (err) {
            setError(err.message);
        }
    };

    const handleDelete = async (id) => {
        setTransactionToDelete(id);
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        try {
            await api.outgoingMoney.delete(transactionToDelete);
            setShowDeleteModal(false);
            setTransactionToDelete(null);
            await api.outgoingMoney.getAll();
        } catch (err) {
            setError(err.message);
        }
    };

    const handleComplete = (id) => {
        setTransactionToDelete(id);
        setShowConfirmModal(true);
    };

    // Confirm and execute the partner deletion
    const confirmComplete = async (bonus,bonus2) => {
        try {
            await api.outgoingMoney.update(transactionToDelete, { status: 'Completed' ,my_bonus: bonus,partner_bonus:bonus2 });
            await fetchTransactions();

        } catch (err) {
            console.error("Deletion error:", err);
            // Optionally, set an error state to display to the user
        } finally {
            // Ensure the modal closes and state is reset regardless of success or failure
            setShowConfirmModal(false);
            setTransactionToDelete(null);
            setBonus(0);
            setBonus2(0);
        }
    };

    const resetForm = () => {
        setFormData({
            from_partner: '',
            money_amount: '',
            currency: 'USD',
            to_partner: '',
            from_name: '',
            from_number: '',
            status: 'Pending',
            taker_name: '',
            my_bonus: 0,
            partner_bonus: 0,
            bonus_currency: 'USD',
            note: ''
        });
        setShowForm(false);
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'Completed': return <CheckCircle size={16} className="text-green-400" />;
            case 'Pending': return <Clock size={16} className="text-amber-400" />;
            default: return <XCircle size={16} className="text-red-400" />;
        }
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
                    <h1 className="text-2xl font-bold">حساباتی قاسەکان</h1>
                </div>
                <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl shadow-lg p-4 sm:p-6 md:p-0 overflow-hidden">
                    <div className="gap-3 p-4 text-left text-red-700">
                        Error: {error}
                    </div>
                </div>
            </div>
        </div>
    );

    const partnerOptions = partners.map(partner => ({
        value: partner.id,
        label: `${partner.partner.name} - ${partner.safe_type.name}`
    }));

    const statusOptions = [
        { value: 'Pending', label: 'وەرنەگیراو' },
        { value: 'Completed', label: 'وەرگیراو' }
    ];

    return (
        <div className="p-4 min-h-screen bg-slate-50-900 ml-0 sm:mt-6 md:mt-0 xsm:mt-6">
            <div className="mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-white">حەواڵەی چوو</h1>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className="flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 text-white px-4 py-2 rounded-lg transition-all"
                        >
                            {showFilters ? "لابردنی فلتەر" : "فلتەر کردن"}
                            <Filter size={18} />
                        </button>
                        <button
                            onClick={() => setShowForm(!showForm)}
                            className="flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 text-white px-4 py-2 rounded-lg transition-all"
                        >
                            {showForm ? "لابردن" : "زیادکردن"}
                            {showForm ? <ArrowUp size={18} /> : <ArrowDown size={18} />}
                        </button>
                    </div>
                </div>
                {showFilters && (
                    <div className="bg-slate-800/80 backdrop-blur-lg border border-white/20 rounded-xl shadow-lg p-6 mb-8 transition-all">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold text-white">فلتەر کردن</h2>
                            <button onClick={() => { setShowFilters(false); setFilters({ searchQuery: '', status: '', startDate: '', endDate: '', fromPartner: '', toPartner: '' }); }} className="text-white/70 hover:text-white">
                                <XCircle size={20} />
                            </button>
                        </div>
                        <form onSubmit={(e) => { e.preventDefault(); fetchTransactions(); }} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="md:col-span-2">
                                <label className="block text-white/80 mb-2">گەڕان بەدوای:</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        name="searchQuery"
                                        value={filters.searchQuery}
                                        onChange={handleFilterChange}
                                        className="w-full bg-white/5 border border-white/20 rounded-lg pl-10 pr-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                                        placeholder="گەڕان بەدوای: بڕی پارە، ناو، ژمارە"
                                    />
                                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-white/80 mb-2">جۆری مامەڵە:</label>
                                <Select
                                    name="status"
                                    menuPortalTarget={document.body}   // 👈 attach to body
                                    
                                    value={statusOptions.find(opt => opt.value === filters.status) || null}
                                    onChange={(selected) =>
                                        setFilters((prev) => ({ ...prev, status: selected ? selected.value : "" }))
                                    }
                                    options={statusOptions}
                                    isSearchable
                                    isClearable
                                    placeholder="هەموو جۆرەکان..."
                                    styles={selectStyles}
                                />
                            </div>
                            <div>
                                <label className="block text-white/80 mb-2">لە بەرواری:</label>
                                <input
                                    type="date"
                                    name="startDate"
                                    value={filters.startDate}
                                    onChange={handleFilterChange}
                                    className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-2 text-white/70 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                                />
                            </div>
                            <div>
                                <label className="block text-white/80 mb-2">بۆ بەرواری:</label>
                                <input
                                    type="date"
                                    name="endDate"
                                    value={filters.endDate}
                                    onChange={handleFilterChange}
                                    className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-2 text-white/70 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                                />
                            </div>
                            <div>
                                <label className="block text-white/80 mb-2">لە هاوبەش:</label>
                                <Select
                                    name="fromPartner"
                                    menuPortalTarget={document.body}   // 👈 attach to body
                                    
                                    value={partnerOptions.find(opt => opt.value === filters.fromPartner) || null}
                                    onChange={(selected) =>
                                        setFilters((prev) => ({ ...prev, fromPartner: selected ? selected.value : "" }))
                                    }
                                    options={partnerOptions}
                                    isClearable
                                    isSearchable
                                    placeholder="هەموو هاوبەشەکان..."
                                    styles={selectStyles}
                                />
                            </div>
                            <div>
                                <label className="block text-white/80 mb-2">بۆ هاوبەش:</label>
                                <Select
                                    name="toPartner"
                                    menuPortalTarget={document.body}   // 👈 attach to body
                                    
                                    value={partnerOptions.find(opt => opt.value === filters.toPartner) || null}
                                    onChange={(selected) =>
                                        setFilters((prev) => ({ ...prev, toPartner: selected ? selected.value : "" }))
                                    }
                                    options={partnerOptions}
                                    isClearable
                                    isSearchable
                                    placeholder="هەموو هاوبەشەکان..."
                                    styles={selectStyles}
                                />
                            </div>
                            <div className="lg:col-span-1 flex items-end">
                                <button
                                    type="submit"
                                    className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-all"
                                >
                                    گه‌ڕان
                                </button>
                            </div>
                        </form>
                    </div>
                )}
                {showForm && (
                    <div className="bg-slate-800/80 backdrop-blur-lg border border-white/20 rounded-xl shadow-lg p-6 mb-8 transition-all">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold text-white">
                                {"زیادکردن"}
                            </h2>
                            <button onClick={resetForm} className="text-white/70 hover:text-white">
                                <XCircle size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-white/80 mb-2">لە نوسینگەی:</label>
                                <Select
                                    name="from_partner"
                                    menuPortalTarget={document.body}   // 👈 attach to body
                                    
                                    value={partnerOptions.find(opt => opt.value === formData.from_partner) || null}
                                    onChange={(selected) =>
                                        setFormData((prev) => ({ ...prev, from_partner: selected ? selected.value : "" }))
                                    }
                                    options={partnerOptions}
                                    isClearable
                                    isSearchable
                                    placeholder="نوسینگە دیاری بکە.."
                                    styles={selectStyles}
                                />
                            </div>
                            <div>
                                <label className="block text-white/80 mb-2">بۆ نوسینگەی:</label>
                                <Select
                                    name="to_partner"
                                    menuPortalTarget={document.body}   // 👈 attach to body
                                    
                                    value={partnerOptions.find(opt => opt.value === formData.to_partner) || null}
                                    onChange={(selected) =>
                                        setFormData((prev) => ({ ...prev, to_partner: selected ? selected.value : "" }))
                                    }
                                    isClearable
                                    isSearchable
                                    options={partnerOptions}
                                    placeholder="دیاری بکە..."
                                    styles={selectStyles}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-white/80 mb-2">ناوی نێردەر:</label>
                                <input
                                    type="text"
                                    name="from_name"
                                    value={formData.from_name}
                                    onChange={handleInputChange}
                                    className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                                    placeholder="ناوی نێردەر.."
                                />
                            </div>
                            <div>
                                <label className="block text-white/80 mb-2">ژمارەی نێردەر:</label>
                                <input
                                    type="text"
                                    name="from_number"
                                    value={formData.from_number}
                                    onChange={handleInputChange}
                                    className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                                    placeholder="ژمارەی مۆبایل"
                                />
                            </div>
                            <div>
                                <label className="block text-white/80 mb-2">ناوی وەرگر:</label>
                                <input
                                    type="text"
                                    name="taker_name"
                                    value={formData.taker_name}
                                    onChange={handleInputChange}
                                    className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                                    placeholder="ناوی وەرگر.."
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-white/80 mb-2">بڕی حەواڵەکراو:</label>
                                <input
                                    type="number"
                                    name="money_amount"
                                    value={formData.money_amount}
                                    onChange={handleInputChange}
                                    className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                                    required
                                    step="0.01"
                                    min="0"
                                />
                            </div>
                            <div>
                                <label className="block text-white/80 mb-2">جۆری دراو:</label>
                                <div className="flex border border-white/20">
                                    <button
                                        type="button"
                                        onClick={() => handleInputChange({ target: { name: "currency", value: "USD" } })}
                                        className={`flex-1 flex items-center justify-center gap-1 py-2 rounded-md transition-all ${formData.currency === "USD"
                                            ? "bg-blue-600 text-white"
                                            : "text-white/70 hover:bg-white/10"
                                            }`}
                                    >
                                        <DollarSign size={18} /> USD
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleInputChange({ target: { name: "currency", value: "IQD" } })}
                                        className={`flex-1 flex items-center justify-center gap-1 py-2 rounded-md transition-all ${formData.currency === "IQD"
                                            ? "bg-blue-600 text-white"
                                            : "text-white/70 hover:bg-white/10"
                                            }`}
                                    >
                                        <Wallet size={18} /> IQD
                                    </button>
                                </div>
                            </div>
                            <div>
                                <label className="block text-white/80 mb-2">جۆری مامەڵە</label>
                                <Select
                                    name="status"
                                    menuPortalTarget={document.body}   // 👈 attach to body
                                    
                                    value={statusOptions.find(opt => opt.value === formData.status) || null}
                                    onChange={(selected) =>
                                        setFormData((prev) => ({ ...prev, status: selected ? selected.value : "" }))
                                    }
                                    isClearable
                                    isSearchable
                                    options={statusOptions}
                                    styles={selectStyles}
                                />
                            </div>
                            <div>
                                <label className="block text-white/80 mb-2">عمولە بۆ دوکان:</label>
                                <input
                                    type="number"
                                    name="my_bonus"
                                    value={formData.my_bonus}
                                    onChange={handleInputChange}
                                    className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                                />
                            </div>
                            <div>
                                <label className="block text-white/80 mb-2">عمولە بۆ نوسینگەی نێردەر:</label>
                                <input
                                    type="number"
                                    name="partner_bonus"
                                    value={formData.partner_bonus}
                                    onChange={handleInputChange}
                                    className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                                />
                            </div>
                            <div>
                                <label className="block text-white/80 mb-2">دراوی عمولە:</label>
                                <div className="flex border border-white/20">
                                    <button
                                        type="button"
                                        onClick={() => handleInputChange({ target: { name: "bonus_currency", value: "USD" } })}
                                        className={`flex-1 flex items-center justify-center gap-1 py-2 rounded-md transition-all ${formData.bonus_currency === "USD"
                                            ? "bg-blue-600 text-white"
                                            : "text-white/70 hover:bg-white/10"
                                            }`}
                                    >
                                        <DollarSign size={18} /> USD
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleInputChange({ target: { name: "bonus_currency", value: "IQD" } })}
                                        className={`flex-1 flex items-center justify-center gap-1 py-2 rounded-md transition-all ${formData.bonus_currency === "IQD"
                                            ? "bg-blue-600 text-white"
                                            : "text-white/70 hover:bg-white/10"
                                            }`}
                                    >
                                        <Wallet size={18} /> IQD
                                    </button>
                                </div>
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-white/80 mb-2">تێبینـی:</label>
                                <textarea
                                    name="note"
                                    value={formData.note}
                                    onChange={handleInputChange}
                                    className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                                    rows="3"
                                />
                            </div>
                            <div className="md:col-span-2 flex gap-3 pt-2">
                                <button
                                    type="submit"
                                    className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-all"
                                >
                                    {"دروست کردن"}
                                </button>
                                <button
                                    type="button"
                                    onClick={resetForm}
                                    className="flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white px-4 py-2 rounded-lg transition-all"
                                >
                                    لابردن
                                </button>
                            </div>
                        </form>
                    </div>
                )}
                <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl shadow-lg p-4 sm:p-6 md:p-0 overflow-hidden">
                    {transactions.length === 0 ? (
                        <div className="col-span-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6 text-center text-white/60">
                            هیچ حەواڵەیەکی چوو نییە
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-1 lg:grid-cols-4 md:grid-cols-1 gap-3 p-4">
                                {transactions.map((transaction) => (
                                    <div key={transaction.id} className="bg-slate-800/80 backdrop-blur-lg border border-white/20 rounded-xl shadow-lg p-6 hover:bg-slate-800/90 transition-colors">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="flex items-center gap-2">
                                                {getStatusIcon(transaction.status)}
                                                <span className="text-white font-medium">{transaction.status === 'Completed' ? 'واصڵ' : 'وەرنەگیراو'}</span>
                                            </div>
                                            <div className="text-sm text-white/70">
                                                {formatDate(transaction.created_at)}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 mb-4">
                                            <DollarSign className="text-green-400" size={20} />
                                            <div>
                                                <p className="text-sm text-white/80">بڕی حەواڵەی نێردراو</p>
                                                <p className="text-white font-bold text-xl">
                                                    {parseFloat(transaction.money_amount).toLocaleString()} {transaction.currency}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="space-y-3 mb-4">
                                            {(transaction.from_partner || transaction.from_name) && (
                                                <div className="flex items-center gap-3">
                                                    <ArrowDown className="text-red-400" size={16} />
                                                    <div>
                                                        <p className="text-sm text-white/80">لە لایەن</p>
                                                        <p className="text-white">
                                                            {transaction.from_partner
                                                                ? (transaction.from_partner.partner.name)
                                                                : transaction.from_name}
                                                        </p>
                                                    </div>
                                                </div>
                                            )}
                                            {(transaction.to_partner || transaction.taker_name) && (
                                                <div className="flex items-center gap-3">
                                                    <ArrowUp className="text-green-400" size={16} />
                                                    <div>
                                                        <p className="text-sm text-white/80">بۆ نوسینگەی</p>
                                                        <p className="text-white">
                                                            {transaction.to_partner
                                                                ? transaction.to_partner.partner.name
                                                                : transaction.taker_name}
                                                        </p>
                                                        {transaction.from_number && (
                                                            <p className="text-sm text-white/70">{transaction.from_number}</p>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                        {(transaction.my_bonus != 0 || transaction.partner_bonus != 0) && (
                                            <div className="bg-white/5 rounded-lg p-3 mb-4">
                                                <h4 className="text-sm font-medium text-white/80 mb-2 flex items-center gap-2">
                                                    <Gift size={16} /> عمولەکان
                                                </h4>
                                                <div className="grid grid-cols-2 gap-2">
                                                    {transaction.my_bonus != 0 && (
                                                        <div>
                                                            <p className="text-xs text-white/70">عمولەی دوکان</p>
                                                            <p className="text-white">
                                                                {parseFloat(transaction.my_bonus).toFixed(2)} {transaction.bonus_currency}
                                                            </p>
                                                        </div>
                                                    )}
                                                    {transaction.partner_bonus != 0 && (
                                                        <div>
                                                            <p className="text-xs text-white/70">عمولە بۆ نوسینگە</p>
                                                            <p className="text-white">
                                                                {parseFloat(transaction.partner_bonus).toFixed(2)} {transaction.bonus_currency}
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                        {transaction.note && (
                                            <div className="mt-4 pt-4 border-t border-white/10">
                                                <div className="flex items-center gap-2 text-white/80 mb-1">
                                                    <FileText size={16} />
                                                    <span className="text-sm">تێبینی</span>
                                                </div>
                                                <p className="text-white text-sm">{transaction.note}</p>
                                            </div>
                                        )}
                                        <div className="mt-4 pt-4 border-t border-white/10 flex justify-end gap-3">
                                            {transaction.status === 'Pending' && (
                                                <button
                                                    onClick={() => handleComplete(transaction.id)}
                                                    className="text-white/70 hover:text-green-400 transition-colors text-sm"
                                                >
                                                    <CheckCircle size={22} />
                                                </button>
                                            )}
                                            <button
                                                onClick={() => handleDelete(transaction.id)}
                                                className="text-white/70 hover:text-red-400 transition-colors p-2 rounded-full hover:bg-white/5"
                                                title="Delete"
                                            >
                                                <Trash2 size={22} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </div>
            {showDeleteModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl shadow-lg p-6 w-full max-w-sm text-white">
                        <div className="flex flex-col items-center mb-4">
                            <AlertTriangle size={48} className="text-red-400 mb-3" />
                            <h3 className="text-xl font-bold mb-2 text-center">دڵنیای؟</h3>
                            <p className="text-white/80 text-center">
                                ئەم کارە هەڵناوەشێتەوە.
                            </p>
                        </div>
                        <div className="flex gap-3 justify-center mt-4">
                            <button
                                onClick={confirmDelete}
                                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium px-4 py-2 rounded-lg transition-all"
                            >
                                <span className="flex items-center justify-center gap-2">
                                    <CheckCircle size={18} /> دڵنیابوون
                                </span>
                            </button>
                            <button
                                onClick={() => setShowDeleteModal(false)}
                                className="flex-1 bg-white/10 hover:bg-white/20 text-white font-medium px-4 py-2 rounded-lg transition-all"
                            >
                                <span className="flex items-center justify-center gap-2">
                                    <X size={18} /> هەڵوەشاندنەوە
                                </span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {showConfirmModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl shadow-lg p-6 w-full max-w-sm text-white">
                        <div className="flex flex-col items-center mb-4">
                            <AlertTriangle size={48} className="text-red-400 mb-3" />
                            <h3 className="text-xl font-bold mb-2 text-center">دڵنیای؟</h3>
                            <p className="text-white/80 text-center">
                                ئەم کارە هەڵناوەشێتەوە.
                            </p>
                        </div>

                        {/* Added a form group for the bonus input */}
                        <div className="mb-4 w-full">
                            <label htmlFor="bonus" className="block text-sm font-medium mb-1 text-center">
                                عمولەی دوکان
                            </label>
                            <input
                                type="number"
                                id="bonus"
                                name="bonus"
                                value={bonus}
                                onChange={(e) => setBonus(e.target.value)}
                                className="w-full px-3 py-2 text-white bg-white/10 border border-white/20 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                                placeholder="عمولەی دوکان بنوسە"
                            />
                            <label htmlFor="bonus" className="block text-sm font-medium mb-1 text-center">
                                عمولەی نوسینگە
                            </label>
                            <input
                                type="number"
                                id="bonus2"
                                name="bonus2"
                                value={bonus2}
                                onChange={(e) => setBonus2(e.target.value)}
                                className="w-full px-3 py-2 text-white bg-white/10 border border-white/20 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                                placeholder="عمولەی نوسینگە بنوسە"
                            />
                        </div>

                        <div className="flex gap-3 justify-center mt-4">
                            <button
                                onClick={() => confirmComplete(bonus,bonus2)} // Pass the bonus value here
                                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium px-4 py-2 rounded-lg transition-all"
                            >
                                <span className="flex items-center justify-center gap-2">
                                    <CheckCircle size={18} /> دڵنیابوون
                                </span>
                            </button>
                            <button
                                onClick={() => setShowConfirmModal(false)}
                                className="flex-1 bg-white/10 hover:bg-white/20 text-white font-medium px-4 py-2 rounded-lg transition-all"
                            >
                                <span className="flex items-center justify-center gap-2">
                                    <X size={18} /> هەڵوەشاندنەوە
                                </span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {count > pageSize && (
                <div className="flex justify-center items-center gap-4 mt-6 text-white">
                    <button
                        disabled={page === 1}
                        onClick={() => setPage(page - 1)}
                        className="px-3 py-1 rounded bg-white/10 hover:bg-white/20 disabled:opacity-40"
                    >
                        پێشوو
                    </button>
                    <span>
                        پەڕە {page} لە {Math.ceil(count / pageSize)}
                    </span>
                    <button
                        disabled={page >= Math.ceil(count / pageSize)}
                        onClick={() => setPage(page + 1)}
                        className="px-3 py-1 rounded bg-white/10 hover:bg-white/20 disabled:opacity-40"
                    >
                        داهاتوو
                    </button>
                </div>
            )}
        </div>
    );
};

export default OutgoingMoney;
