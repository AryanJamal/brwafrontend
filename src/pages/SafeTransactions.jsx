import { useState, useEffect } from 'react';
import { api } from '../services/apiService';
import { Plus, ArrowUp, CreditCard, Wallet, Coins, ArrowDown, Clock, XCircle, User, DollarSign, FileText, ArrowLeftRight, Trash2 } from 'lucide-react';
import formatDate from '../components/formatdate';
import selectStyles from '../components/styles';
import Select from 'react-select';

const SafeTransactions = () => {
    const [transactions, setTransactions] = useState([]);
    const [partners, setPartners] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [formType, setFormType] = useState(null); // New state for form type
    const [isLoading, setIsLoading] = useState(false); // Changed to false to prevent initial loader from showing

    const [formData, setFormData] = useState({
        // For both forms
        money_amount: '',
        currency: 'USD',
        note: '',
        // For 'transaction' form
        partner: '',
        transaction_type: 'ADD',
        // For 'transfer' form
        from_safepartner: '',
        to_safepartner: ''
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [transRes, partnersRes] = await Promise.all([
                    api.safeTransactions.getAll(),
                    api.safePartnersApi.getAll()
                ]);

                setTransactions(transRes.data);
                setPartners(partnersRes.data);
                setLoading(false);
            } catch (err) {
                setError(err.message);
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleSelectChange = (name, selectedOption) => {
        setFormData(prev => ({ ...prev, [name]: selectedOption ? selectedOption.value : '' }));
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isLoading) return;
        setIsLoading(true);

        try {
            let dataToSend = {};
            if (formType === 'transaction') {
                dataToSend = {
                    partner: formData.partner,
                    transaction_type: formData.transaction_type,
                    money_amount: formData.money_amount,
                    currency: formData.currency,
                    note: formData.note
                };
            } else if (formType === 'transfer') {
                dataToSend = {
                    from_safepartner: formData.from_safepartner,
                    transaction_type: 'TRANSFER',
                    to_safepartner: formData.to_safepartner,
                    money_amount: formData.money_amount,
                    currency: formData.currency,
                    note: formData.note
                };
            }

            await api.safeTransactions.create(dataToSend);
            const res = await api.safeTransactions.getAll();
            setTransactions(res.data);
            resetForm();
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this transaction?')) {
            try {
                await api.safeTransactions.delete(id);
                setTransactions(transactions.filter(t => t.id !== id));
            } catch (err) {
                setError(err.message);
            }
        }
    };

    const resetForm = () => {
        setFormData({
            partner: '',
            transaction_type: 'ADD',
            money_amount: '',
            currency: 'USD',
            note: '',
            from_safepartner: '',
            to_safepartner: ''
        });
        setShowForm(false);
        setFormType(null); // Reset the form type
    };

    const getStatusIcon = (type) => {
        switch (type) {
            case 'ADD': return <ArrowDown className="text-green-400" size={18} />;
            case 'REMOVE': return <ArrowUp className="text-red-400" size={18} />;
            case 'TRANSFER': return <ArrowLeftRight className="text-yellow-400" size={18} />;
            default: return <Clock className="text-amber-400" size={18} />;
        }
    };

    const getTypeLabel = (type) => {
        switch (type) {
            case 'ADD': return 'زیادکردن';
            case 'REMOVE': return 'هەڵگرتن';
            case 'TRANSFER': return 'گواستنەوە';
            default: return type;
        }
    };

    const partnerOptions = partners.map(partner => ({
        value: partner.id,
        label: `${partner.partner.name} - ${partner.safe_type.name}`
    }));

    const transactionTypeOptions = [
        { value: 'ADD', label: 'زیادکردن' },
        { value: 'REMOVE', label: 'هەڵگرتن' }
    ];

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

    return (
        <div className="p-4 min-h-screen bg-slate-50-900 ml-0 sm:mt-6 md:mt-0 xsm:mt-6">
            <div className="mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-white">گۆڕانکاری پارە</h1>
                    <button
                        onClick={() => {
                            if (showForm) {
                                resetForm();
                            } else {
                                setShowForm(true);
                            }
                        }}
                        className="flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 text-white px-4 py-2 rounded-lg transition-all"
                    >
                        <Plus size={18} />
                        {showForm ? "لابردن" : "زیادکردن"}
                    </button>
                </div>

                {showForm && (
                    <>
                        {!formType && (
                            <div className="bg-slate-800/80 backdrop-blur-lg border border-white/20 rounded-xl shadow-lg p-6 mb-8 transition-all">
                                <h2 className="text-xl font-semibold text-white mb-4">جۆری مامەڵە دیاری بکە</h2>
                                <div className="flex flex-col sm:flex-row gap-4">
                                    <button
                                        onClick={() => setFormType('transaction')}
                                        className="flex-1 flex items-center justify-center gap-2 bg-green-700 hover:bg-green-800 text-white px-4 py-4 rounded-lg transition-all"
                                    >
                                        <Wallet size={18} />
                                        زیادکردن/هەڵگرتن
                                    </button>
                                    <button
                                        onClick={() => setFormType('transfer')}
                                        className="flex-1 flex items-center justify-center gap-2 bg-amber-600 hover:bg-amber-700 text-white px-4 py-4 rounded-lg transition-all"
                                    >
                                        <ArrowLeftRight size={18} />
                                        گواستنەوە
                                    </button>
                                </div>
                            </div>
                        )}

                        {formType === 'transaction' && (
                            <div className="bg-slate-800/80 backdrop-blur-lg border border-white/20 rounded-xl shadow-lg p-6 mb-8 transition-all">
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-xl font-semibold text-white">زیادکردن و هەڵگرتن</h2>
                                    <button onClick={resetForm} className="text-white/70 hover:text-white">
                                        <XCircle size={20} />
                                    </button>
                                </div>
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    {/* Partner */}
                                    <div>
                                        <label className="block text-white/80 mb-2">شەریک و قاسە</label>
                                        <Select
                                            name="partner"
                                            options={partnerOptions}
                                            onChange={selectedOption => handleSelectChange('partner', selectedOption)}
                                            value={partnerOptions.find(option => option.value === formData.partner)}
                                            styles={selectStyles}
                                            placeholder="شەریک دیاری بکە.."
                                            isClearable
                                        />
                                    </div>
                                    {/* Transaction Type */}
                                    <div>
                                        <label className="block text-white/80 mb-2">جۆر:</label>
                                        <Select
                                            name="transaction_type"
                                            options={transactionTypeOptions}
                                            onChange={selectedOption => handleSelectChange('transaction_type', selectedOption)}
                                            value={transactionTypeOptions.find(option => option.value === formData.transaction_type)}
                                            styles={selectStyles}
                                        />
                                    </div>
                                    {/* Money Amount */}
                                    <div>
                                        <label className="block text-white/80 mb-2">بڕی پارە</label>
                                        <input
                                            type="number"
                                            name="money_amount"
                                            value={formData.money_amount}
                                            onChange={handleInputChange}
                                            className="w-full bg-white/5 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                                            required
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
                                                onClick={() => handleInputChange({ target: { name: "currency", value: "USDT" } })}
                                                className={`flex flex-col items-center justify-center py-2 rounded-lg transition-all ${formData.currency === "USDT"
                                                    ? "bg-blue-600 text-white"
                                                    : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                                                    }`}
                                            >
                                                <Coins size={18} />
                                                <span className="text-sm mt-1">USDT</span>
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleInputChange({ target: { name: "currency", value: "USD" } })}
                                                className={`flex flex-col items-center justify-center py-2 rounded-lg transition-all ${formData.currency === "USD"
                                                    ? "bg-blue-600 text-white"
                                                    : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                                                    }`}
                                            >
                                                <DollarSign size={18} />
                                                <span className="text-sm mt-1">USD</span>
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleInputChange({ target: { name: "currency", value: "IQD" } })}
                                                className={`flex flex-col items-center justify-center py-2 rounded-lg transition-all ${formData.currency === "IQD"
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
                                    <div>
                                        <label className="block text-white/80 mb-2">تێـبینی</label>
                                        <textarea
                                            name="note"
                                            value={formData.note}
                                            onChange={handleInputChange}
                                            className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                                            rows="3"
                                        />
                                    </div>
                                    {/* Form Actions */}
                                    <div className="flex gap-3 pt-2">
                                        <button
                                            type="submit"
                                            disabled={isLoading}
                                            className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-all"
                                        >
                                            {isLoading ? 'ناردن...' : 'زیادکردن'}
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

                        {formType === 'transfer' && (
                            <div className="bg-slate-800/80 backdrop-blur-lg border border-white/20 rounded-xl shadow-lg p-6 mb-8 transition-all">
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-xl font-semibold text-white">گواستنەوە</h2>
                                    <button onClick={resetForm} className="text-white/70 hover:text-white">
                                        <XCircle size={20} />
                                    </button>
                                </div>
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    {/* From Safe Partner */}
                                    <div>
                                        <label className="block text-white/80 mb-2">لە قاسەی</label>
                                        <Select
                                            name="from_safepartner"
                                            options={partnerOptions}
                                            onChange={selectedOption => handleSelectChange('from_safepartner', selectedOption)}
                                            value={partnerOptions.find(option => option.value === formData.from_safepartner)}
                                            styles={selectStyles}
                                            placeholder="قاسەی سەرەتا دیاری بکە.."
                                            isClearable
                                            required
                                        />
                                    </div>
                                    {/* To Safe Partner */}
                                    <div>
                                        <label className="block text-white/80 mb-2">بۆ قاسەی</label>
                                        <Select
                                            name="to_safepartner"
                                            options={partnerOptions}
                                            onChange={selectedOption => handleSelectChange('to_safepartner', selectedOption)}
                                            value={partnerOptions.find(option => option.value === formData.to_safepartner)}
                                            styles={selectStyles}
                                            placeholder="قاسەی کۆتایی دیاری بکە.."
                                            isClearable
                                            required
                                        />
                                    </div>
                                    {/* Money Amount */}
                                    <div>
                                        <label className="block text-white/80 mb-2">بڕی پارە</label>
                                        <input
                                            type="number"
                                            name="money_amount"
                                            value={formData.money_amount}
                                            onChange={handleInputChange}
                                            className="w-full bg-white/5 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                                            required
                                            placeholder='0'
                                            step="0.01"
                                            min="0"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-slate-300 mb-2">جۆری دراو</label>
                                        <div className="grid grid-cols-3 gap-2">
                                            <button
                                                type="button"
                                                onClick={() => handleInputChange({ target: { name: "currency", value: "USDT" } })}
                                                className={`flex flex-col items-center justify-center py-2 rounded-lg transition-all ${formData.currency === "USDT"
                                                    ? "bg-blue-600 text-white"
                                                    : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                                                    }`}
                                            >
                                                <Coins size={18} />
                                                <span className="text-sm mt-1">USDT</span>
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleInputChange({ target: { name: "currency", value: "USD" } })}
                                                className={`flex flex-col items-center justify-center py-2 rounded-lg transition-all ${formData.currency === "USD"
                                                    ? "bg-blue-600 text-white"
                                                    : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                                                    }`}
                                            >
                                                <DollarSign size={18} />
                                                <span className="text-sm mt-1">USD</span>
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleInputChange({ target: { name: "currency", value: "IQD" } })}
                                                className={`flex flex-col items-center justify-center py-2 rounded-lg transition-all ${formData.currency === "IQD"
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
                                    <div>
                                        <label className="block text-white/80 mb-2">تێـبینی</label>
                                        <textarea
                                            name="note"
                                            value={formData.note}
                                            onChange={handleInputChange}
                                            className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                                            rows="3"
                                        />
                                    </div>
                                    {/* Form Actions */}
                                    <div className="flex gap-3 pt-2">
                                        <button
                                            type="submit"
                                            disabled={isLoading}
                                            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-all"
                                        >
                                            {isLoading ? 'ناردن...' : 'گواستنەوە'}
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
                    </>
                )}

                {/* Transactions List as Cards */}
                <div className="bg-white/10 backdrop-blur-lg rounded-xl shadow-lg p-4 sm:p-6 md:p-0 overflow-hidden">
                    <div className="space-y-4 ">
                        {transactions.length === 0 ? (
                            <div className="p-8 text-center text-white">
                                <CreditCard size={48} className="mx-auto mb-4" />
                                <p>هیچ مامەڵەیەک نەدۆزرایەوە</p>
                                <button
                                    onClick={() => setShowForm(true)}
                                    className="mt-4 bg-blue-600/70 hover:bg-blue-700/70 text-white px-4 py-2 rounded-lg transition-all"
                                >
                                    زیادکردنی مامەڵەی نوێ
                                </button>
                            </div>
                        ) : (
                            transactions.map((transaction) => (
                                <div key={transaction.id} className="bg-slate-800/80 backdrop-blur-lg border border-white/20 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
                                    <div className="flex justify-between items-center mb-4">
                                        <div className="flex items-center gap-2 text-lg font-bold text-white">
                                            {getStatusIcon(transaction.transaction_type)}
                                            <span>{getTypeLabel(transaction.transaction_type)}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-white/60">
                                            <Clock size={16} />
                                            <span>{formatDate(transaction.created_at)}</span>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {transaction.from_safepartner && (
                                            <div className="flex items-center gap-2">
                                                <ArrowUp size={20} className="text-red-400" />
                                                <div className="text-sm">
                                                    <p className="font-medium text-white/80">لە قاسەی</p>
                                                    <p className="text-white">{transaction.from_safepartner?.partner?.name || 'Unknown'}</p>
                                                </div>
                                            </div>
                                        )}
                                        {transaction.to_safepartner && (
                                            <div className="flex items-center gap-2">
                                                <ArrowDown size={20} className="text-green-400" />
                                                <div className="text-sm">
                                                    <p className="font-medium text-white/80">بۆ قاسەی</p>
                                                    <p className="text-white">{transaction.to_safepartner?.partner?.name || 'Unknown'}</p>
                                                </div>
                                            </div>
                                        )}
                                        {transaction.partner && (
                                            <div className="flex items-center gap-2">
                                                <User size={20} className="text-purple-400" />
                                                <div className="text-sm">
                                                    <p className="font-medium text-white/80">شەریک</p>
                                                    <p className="text-white">{transaction.partner?.partner.name || 'Unknown'}</p>
                                                </div>
                                            </div>
                                        )}
                                        <div className="flex items-center gap-2">
                                            <DollarSign size={20} className="text-green-400" />
                                            <div className="text-sm">
                                                <p className="font-medium text-white/80">بڕی پارە</p>
                                                <p className="text-white">
                                                    {parseFloat(transaction.money_amount).toLocaleString()} {transaction.currency}
                                                </p>
                                            </div>
                                        </div>
                                        {transaction.note && (
                                            <div className="flex items-center gap-2 col-span-1 sm:col-span-2">
                                                <FileText size={20} className="text-blue-400" />
                                                <div className="text-sm">
                                                    <p className="font-medium text-white/80">تێبینی</p>
                                                    <p className="text-white">{transaction.note}</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-white/10">
                                        <button
                                            onClick={() => handleDelete(transaction.id)}
                                            className="flex items-center gap-1 text-white/70 hover:text-red-400 transition-colors"
                                            title="Delete"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SafeTransactions;