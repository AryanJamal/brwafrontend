import { useState, useEffect } from 'react';
import { api } from '../services/apiService';
import { ArrowDown, ArrowUp, Clock, CheckCircle, XCircle, User, DollarSign, Gift, FileText } from 'lucide-react';
import formatDate from '../components/formatdate';
const IncomingMoney = () => {
    const [transactions, setTransactions] = useState([]);
    const [partners, setPartners] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentId, setCurrentId] = useState(null);

    const [formData, setFormData] = useState({
        from_partner: '',
        money_amount: '',
        currency: 'USD',
        to_partner: '',
        to_name: '',
        to_number: '',
        status: 'Pending',
        my_bonus: '',
        partner_bonus: '',
        bonus_currency: 'USD',
        note: ''
    });

    // Fetch initial data
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [transRes, partnersRes] = await Promise.all([
                    api.incomingMoney.getAll(),
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

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (isEditing) {
                await api.incomingMoney.update(currentId, formData);


            } else {
                await api.incomingMoney.create(formData);
            }
            const res = await api.incomingMoney.getAll();
            setTransactions(res.data);
            resetForm();
        } catch (err) {
            setError(err.message);
        }
    };

    const handleEdit = (transaction) => {
        setFormData({
            from_partner: transaction.from_partner?.id || '',
            money_amount: transaction.money_amount,
            currency: transaction.currency,
            to_partner: transaction.to_partner?.id || '',
            to_name: transaction.to_name || '',
            to_number: transaction.to_number || '',
            status: transaction.status,
            my_bonus: transaction.my_bonus,
            partner_bonus: transaction.partner_bonus,
            bonus_currency: transaction.bonus_currency,
            note: transaction.note || ''
        });
        setIsEditing(true);
        setCurrentId(transaction.id);
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this transaction?')) {
            try {
                await api.incomingMoney.delete(id);
                setTransactions(transactions.filter(t => t.id !== id));
            } catch (err) {
                setError(err.message);
            }
        }
    };

    const resetForm = () => {
        setFormData({
            from_partner: '',
            money_amount: '',
            currency: 'USD',
            to_partner: '',
            to_name: '',
            to_number: '',
            status: 'Pending',
            my_bonus: '',
            partner_bonus: '',
            bonus_currency: 'USD',
            note: ''
        });
        setIsEditing(false);
        setCurrentId(null);
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
                {/* Header */}
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
                    <h1 className="text-2xl font-bold text-white">حەواڵەی هاتوو</h1>
                    <button
                        onClick={() => setShowForm(!showForm)}
                        className="flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 text-white px-4 py-2 rounded-lg transition-all"
                    >
                        {showForm ? "لابردن" : "زیادکردن"}
                        {showForm ? <ArrowUp size={18} /> : <ArrowDown size={18} />}
                    </button>
                </div>

                {/* Form Panel */}
                {showForm && (
                    <div className="bg-slate-800/80 backdrop-blur-lg border border-white/20 rounded-xl shadow-lg p-6 mb-8 transition-all">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold text-white">
                                {isEditing ? "گۆڕانکاری" : "زیادکردن"}
                            </h2>
                            <button onClick={resetForm} className="text-white/70 hover:text-white">
                                <XCircle size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* From Partner */}
                            <div>
                                <label className="block text-white/80 mb-2">هاتووە لە:</label>
                                <select
                                    name="from_partner"
                                    value={formData.from_partner}
                                    onChange={handleInputChange}
                                    className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                                >
                                    <option value="">نوسینگە دیاری بکە..</option>
                                    {partners.map(partner => (
                                        <option key={partner.id} value={partner.id}>{partner.partner.name} - {partner.safe_type.name}</option>
                                    ))}
                                </select>
                            </div>

                            {/* To Partner */}
                            <div>
                                <label className="block text-white/80 mb-2">هاتووە بۆ:</label>
                                <select
                                    name="to_partner"
                                    value={formData.to_partner}
                                    onChange={handleInputChange}
                                    className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                                >
                                    <option value="">دیاری بکە...</option>
                                    {partners.map(partner => (
                                        <option key={partner.id} value={partner.id}>{partner.partner.name} - {partner.safe_type.name}</option>
                                    ))}
                                </select>
                            </div>

                            {/* To Name */}
                            <div>
                                <label className="block text-white/80 mb-2">هاتووە بۆ:</label>
                                <input
                                    type="text"
                                    name="to_name"
                                    value={formData.to_name}
                                    onChange={handleInputChange}
                                    className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                                    placeholder="ناوی وەرگر.."
                                />
                            </div>

                            {/* To Number */}
                            <div>
                                <label className="block text-white/80 mb-2">ژمارەی وەرگر..</label>
                                <input
                                    type="text"
                                    name="to_number"
                                    value={formData.to_number}
                                    onChange={handleInputChange}
                                    className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                                    placeholder="ژمارەی مۆبایل"
                                />
                            </div>

                            {/* Money Amount */}
                            <div>
                                <label className="block text-white/80 mb-2">بڕی هاتـوو:</label>
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

                            {/* Currency */}
                            <div>
                                <label className="block text-white/80 mb-2">جۆری دراو</label>
                                <select
                                    name="currency"
                                    value={formData.currency}
                                    onChange={handleInputChange}
                                    className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                                    required
                                >
                                    <option value="USD">USD</option>
                                    <option value="IQD">IQD</option>
                                </select>
                            </div>

                            {/* Status */}
                            <div>
                                <label className="block text-white/80 mb-2">جۆری مامەڵە</label>
                                <select
                                    name="status"
                                    value={formData.status}
                                    onChange={handleInputChange}
                                    className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                                    required
                                >
                                    <option value="Pending">وەرنەگیراو</option>
                                    <option value="Completed">وەرگیراو</option>
                                </select>
                            </div>

                            {/* My Bonus */}
                            <div>
                                <label className="block text-white/80 mb-2">عمولە بۆ دوکان</label>
                                <input
                                    type="number"
                                    name="my_bonus"
                                    value={formData.my_bonus}
                                    onChange={handleInputChange}
                                    className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                                    step="0.01"
                                    min="0"
                                />
                            </div>

                            {/* Partner Bonus */}
                            <div>
                                <label className="block text-white/80 mb-2">عمولە بۆ نوسینگەی نێردەر</label>
                                <input
                                    type="number"
                                    name="partner_bonus"
                                    value={formData.partner_bonus}
                                    onChange={handleInputChange}
                                    className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                                    step="0.01"
                                    min="0"
                                />
                            </div>

                            {/* Bonus Currency */}
                            <div>
                                <label className="block text-white/80 mb-2">دراوی عمولە</label>
                                <select
                                    name="bonus_currency"
                                    value={formData.bonus_currency}
                                    onChange={handleInputChange}
                                    className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                                >
                                    <option value="USD">دۆلار</option>
                                    <option value="IQD">دینار</option>
                                </select>
                            </div>

                            {/* Note */}
                            <div className="md:col-span-2">
                                <label className="block text-white/80 mb-2">تێبینـی</label>
                                <textarea
                                    name="note"
                                    value={formData.note}
                                    onChange={handleInputChange}
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
                                    {isEditing ? "گۆڕانکاری" : "دروست کردن"}
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

                {/* Transactions List */}
                <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl shadow-lg p-4 sm:p-6 md:p-0 overflow-hidden">
                    {transactions.length === 0 ? (
                        <div className="col-span-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6 text-center text-white/60">
                            هیچ حەواڵەیەکی هاتوو نییە
                        </div>
                    ) : (
                        <>
                            {/* Mobile & Tablet Card View with Desktop 2-column */}
                            <div className="grid grid-cols-1 lg:grid-cols-4 md:grid-cols-1 gap-3 p-4">
                                {transactions.map((transaction) => (
                                    <div key={transaction.id} className="bg-slate-800/80 backdrop-blur-lg border border-white/20 rounded-xl shadow-lg p-6 hover:bg-slate-800/90 transition-colors">
                                        {/* Header with status */}
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="flex items-center gap-2">
                                                {getStatusIcon(transaction.status)}
                                                <span className="text-white font-medium">{transaction.status === 'Completed' ? 'واصڵ' : 'وەرنەگیراو'}</span>
                                            </div>
                                            <div className="text-sm text-white/70">
                                                {formatDate(transaction.created_at)}
                                            </div>
                                        </div>

                                        {/* Amount and currency */}
                                        <div className="flex items-center gap-3 mb-4">
                                            <DollarSign className="text-green-400" size={20} />
                                            <div>
                                                <p className="text-sm text-white/80">بڕی حەواڵەی هاتـوو</p>
                                                <p className="text-white font-bold text-xl">
                                                    {parseFloat(transaction.money_amount).toLocaleString()} {transaction.currency}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Partners */}
                                        <div className="space-y-3 mb-4">
                                            {transaction.from_partner && (
                                                <div className="flex items-center gap-3">
                                                    <ArrowDown className="text-red-400" size={16} />
                                                    <div>
                                                        <p className="text-sm text-white/80">لە لایەن</p>
                                                        <p className="text-white">
                                                            {(transaction.from_partner.partner.name)}
                                                        </p>
                                                    </div>
                                                </div>
                                            )}

                                            {(transaction.to_partner || transaction.to_name) && (
                                                <div className="flex items-center gap-3">
                                                    <ArrowUp className="text-green-400" size={16} />
                                                    <div>
                                                        <p className="text-sm text-white/80">بۆ</p>
                                                        <p className="text-white">
                                                            {transaction.to_partner
                                                                ? (transaction.to_partner.partner.name)
                                                                : transaction.to_name}
                                                        </p>
                                                        {transaction.to_number && (
                                                            <p className="text-sm text-white/70">{transaction.to_number}</p>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Bonuses */}
                                        {(transaction.my_bonus > 0 || transaction.partner_bonus > 0) && (
                                            <div className="bg-white/5 rounded-lg p-3 mb-4">
                                                <h4 className="text-sm font-medium text-white/80 mb-2 flex items-center gap-2">
                                                    <Gift size={16} /> عمولەکان
                                                </h4>
                                                <div className="grid grid-cols-2 gap-2">
                                                    {transaction.my_bonus > 0 && (
                                                        <div>
                                                            <p className="text-xs text-white/70">عمولەی دوکان</p>
                                                            <p className="text-white">
                                                                {parseFloat(transaction.my_bonus).toFixed(2)} {transaction.bonus_currency}
                                                            </p>
                                                        </div>
                                                    )}
                                                    {transaction.partner_bonus > 0 && (
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

                                        {/* Note */}
                                        {transaction.note && (
                                            <div className="mt-4 pt-4 border-t border-white/10">
                                                <div className="flex items-center gap-2 text-white/80 mb-1">
                                                    <FileText size={16} />
                                                    <span className="text-sm">تێبینی</span>
                                                </div>
                                                <p className="text-white text-sm">{transaction.note}</p>
                                            </div>
                                        )}

                                        {/* Actions */}
                                        <div className="mt-4 pt-4 border-t border-white/10 flex justify-end gap-3">
                                            <button
                                                onClick={() => handleEdit(transaction)}
                                                className="text-white/70 hover:text-purple-400 transition-colors text-sm"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDelete(transaction.id)}
                                                className="text-white/70 hover:text-red-400 transition-colors text-sm"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default IncomingMoney;