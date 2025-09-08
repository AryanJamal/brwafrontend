import { useState, useEffect } from 'react';
import { api } from '../services/apiService';
import { DollarSign, Calendar, TrendingUp, Users, Wallet, CreditCard, FileText, Building, ArrowUp, ArrowDown } from 'lucide-react';

const Dashboard = () => {
    const [dailyBonuses, setDailyBonuses] = useState({ USD: '0.00', IQD: '0.00' });
    const [monthlyBonuses, setMonthlyBonuses] = useState({ USD: '0.00', IQD: '0.00' });
    const [partners, setPartners] = useState([]);
    const [selectedPartner, setSelectedPartner] = useState('');
    const [partnerReport, setPartnerReport] = useState(null);
    const [loading, setLoading] = useState(true);
    const [reportLoading, setReportLoading] = useState(false);
    const [error, setError] = useState(null);
    // eslint-disable-next-line no-unused-vars
    const [selectedPeriod, setSelectedPeriod] = useState('today');
    // Fetch initial data
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [dailyResponse, monthlyResponse, partnersResponse] = await Promise.all([
                    api.bonuses.getDaily(),
                    api.bonuses.getMonthly(),
                    api.partners.getAll()
                ]);

                setDailyBonuses(dailyResponse.data);
                setMonthlyBonuses(monthlyResponse.data);
                setPartners(partnersResponse.data);

            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [selectedPeriod]);

    // Fetch partner report when selected
    useEffect(() => {
        const fetchPartnerReport = async () => {
            if (!selectedPartner) {
                setPartnerReport(null);
                return;
            }

            try {
                setReportLoading(true);
                const response = await api.partners.getReport(selectedPartner);
                setPartnerReport(response.data);
            } catch (err) {
                setError(err.message);
                setPartnerReport(null);
            } finally {
                setReportLoading(false);
            }
        };

        fetchPartnerReport();
    }, [selectedPartner]);

    // Refresh data function
    const refreshData = async () => {
        try {
            setLoading(true);
            const [dailyResponse, monthlyResponse] = await Promise.all([
                api.bonuses.getDaily(),
                api.bonuses.getMonthly()
            ]);

            setDailyBonuses(dailyResponse.data);
            setMonthlyBonuses(monthlyResponse.data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };


    // فانکشنی فۆرماتکردنی دراو
    const formatCurrency = (amount, currency) => {
        const formatted = parseFloat(amount).toLocaleString(undefined,{minimumFractionDigits: 2})
        return `${formatted} ${currency}`;
    };

    // Calculate totals from partner report
    const calculateTotals = () => {
        if (!partnerReport) return null;

        const cryptoTotal = partnerReport.crypto_transactions?.reduce((sum, transaction) =>
            sum + parseFloat(transaction.usdt_amount), 0) || 0;

        const incomingTotal = partnerReport.incoming_money?.reduce((sum, transaction) =>
            sum + parseFloat(transaction.money_amount), 0) || 0;

        const outgoingTotal = partnerReport.outgoing_money?.reduce((sum, transaction) =>
            sum + parseFloat(transaction.money_amount), 0) || 0;

        const cryptoBonus = partnerReport.crypto_transactions?.reduce((sum, transaction) =>
            sum + parseFloat(transaction.bonus), 0) || 0;

        const incomingMyBonus = partnerReport.incoming_money?.reduce((sum, transaction) =>
            sum + parseFloat(transaction.my_bonus), 0) || 0;

        const incomingPartnerBonus = partnerReport.incoming_money?.reduce((sum, transaction) =>
            sum + parseFloat(transaction.partner_bonus), 0) || 0;

        return {
            cryptoTotal,
            incomingTotal,
            outgoingTotal,
            cryptoBonus,
            incomingMyBonus,
            incomingPartnerBonus,
            grandTotal: cryptoTotal + incomingTotal + outgoingTotal,
            totalBonus: cryptoBonus + incomingMyBonus + incomingPartnerBonus
        };
    };

    if (loading) return (
        <div className="ml-0 md:ml-64 p-4 md:p-8 min-h-screen flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
        </div>
    );

    if (error) return (
        <div className="ml-0 md:ml-64 p-4 md:p-8 min-h-screen">
            <div className="bg-red-500/20 backdrop-blur-sm border border-red-500/30 rounded-xl p-6 text-red-200">
                هەڵە: {error}
                <button
                    onClick={refreshData}
                    className="ml-4 px-3 py-1 bg-red-600/50 hover:bg-red-600 rounded text-sm"
                >
                    دووبارە هەوڵ بدەوە
                </button>
            </div>
        </div>
    );
    const totals = partnerReport ? calculateTotals() : null;
    return (
        <div className="p-4 min-h-screen bg-slate-50-900 ml-0 sm:mt-6 md:mt-0 xsm:mt-6">
            <div className="mx-auto">
                <div className="flex justify-between items-center mb-4"></div>

                <h1 className="text-2xl font-bold text-white mb-2">داهـات</h1>

                <div className="flex py-2">
                    <button
                        onClick={refreshData}
                        className="bg-slate-800/80 hover:bg-slate-800 border border-white/20 text-white px-4 py-2 rounded-lg transition-all"
                    >
                        نوێکردنەوە
                    </button>
                </div>

                {/* Partner Report Selector */}
                <div className="bg-slate-800/80 backdrop-blur-lg border border-white/20 rounded-xl shadow-lg p-6 mb-8">
                    <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                        <Building className="text-blue-400" size={20} />
                        ڕاپۆرتی کەسی
                    </h2>
                    <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
                        <select
                            value={selectedPartner}
                            onChange={(e) => setSelectedPartner(e.target.value)}
                            className="flex-1 bg-white/5 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                        >
                            <option value="">دیاریکردنی مشتەری</option>
                            {partners.map(partner => (
                                <option key={partner.id} value={partner.id}>
                                    {partner.name}
                                </option>
                            ))}
                        </select>

                        {reportLoading && (
                            <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-purple-500"></div>
                        )}
                    </div>
                </div>
                {partnerReport && totals && (
                    <div className="bg-slate-800/80 backdrop-blur-lg border border-white/20 rounded-xl shadow-lg p-6 mb-8">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
                            <h2 className="text-xl font-semibold text-white">
                                ڕاپۆرت بۆ: <span className="text-blue-400">{partnerReport.partner}</span>
                            </h2>
                            <div className="flex gap-2 mt-2 md:mt-0">
                                <span className="px-2 py-1 bg-green-500/20 text-green-300 rounded-full text-sm">
                                    {partnerReport.crypto_transactions?.length || 0} کیرپتۆ
                                </span>
                                <span className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded-full text-sm">
                                    {partnerReport.incoming_money?.length || 0} حەواڵەی هاتوو
                                </span>
                                <span className="px-2 py-1 bg-red-500/20 text-red-300 rounded-full text-sm">
                                    {partnerReport.outgoing_money?.length || 0} حەواڵە کردن
                                </span>
                            </div>
                        </div>
                        {/* Summary Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                            <div className="bg-white/5 rounded-lg p-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <DollarSign className="text-blue-400" size={16} />
                                    <span className="text-white/80">کۆی گشتی هەمووی:</span>
                                </div>
                                <div className="text-xl font-bold text-white">
                                    {formatCurrency(totals.grandTotal, 'USD')}
                                </div>
                            </div>

                            <div className="bg-white/5 rounded-lg p-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <TrendingUp className="text-green-400" size={16} />
                                    <span className="text-white/80">کۆی گشتی عمولە:</span>
                                </div>
                                <div className="text-xl font-bold text-green-400">
                                    {formatCurrency(totals.totalBonus, 'USD')}
                                </div>
                            </div>

                            <div className="bg-white/5 rounded-lg p-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <ArrowDown className="text-blue-400" size={16} />
                                    <span className="text-white/80">کۆی مامەڵەی کرپتۆ</span>
                                </div>
                                <div className="text-xl font-bold text-white">
                                    {formatCurrency(totals.cryptoTotal, 'USD')}
                                </div>
                            </div>
                            <div className="bg-white/5 rounded-lg p-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <ArrowUp className="text-green-400" size={16} />
                                    <span className="text-white/80">کۆی گشتی حەواڵەکان</span>
                                </div>
                                <div className="text-xl font-bold text-white">
                                    {formatCurrency(totals.incomingTotal + totals.outgoingTotal, 'USD')}
                                </div>
                            </div>
                        </div>
                        {/* Detailed Sections */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Crypto Transactions */}
                            {partnerReport.crypto_transactions?.length > 0 && (
                                <div className="bg-white/5 rounded-lg p-4">
                                    <h3 className="text-lg font-semibold text-white mb-3">کریپتۆکان</h3>
                                    <div className="space-y-2">
                                        {partnerReport.crypto_transactions.map((transaction) => (
                                            <div key={transaction.id} className="flex justify-between items-center p-2 bg-white/5 rounded">
                                                <div>
                                                    <div className="text-white">{transaction.transaction_type}</div>
                                                    <div className="text-white/70 text-sm">
                                                        {formatCurrency(transaction.usdt_amount, 'USD')}
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-green-400 text-sm">
                                                        +{formatCurrency(transaction.bonus, transaction.bonus_currency)}
                                                    </div>
                                                    <div className="text-white/70 text-xs">
                                                        {new Date(transaction.created_at).toLocaleDateString()}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Money Transactions */}
                            <div className="space-y-4">
                                {/* Incoming Money */}
                                {partnerReport.incoming_money?.length > 0 && (
                                    <div className="bg-white/5 rounded-lg p-4">
                                        <h3 className="text-lg font-semibold text-white mb-3">حەواڵەی هاتوو</h3>
                                        <div className="space-y-2">
                                            {partnerReport.incoming_money.map((transaction) => (
                                                <div key={transaction.id} className="flex justify-between items-center p-2 bg-white/5 rounded">
                                                    <div>
                                                        <div className="text-white">
                                                            {formatCurrency(transaction.money_amount, transaction.currency)}
                                                        </div>
                                                        <div className="text-white/70 text-sm">
                                                            Status: {transaction.status}
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="text-green-400 text-sm">
                                                            دوکان: +{formatCurrency(transaction.my_bonus, transaction.bonus_currency)}
                                                        </div>
                                                        <div className="text-blue-400 text-sm">
                                                            نوسینگە: +{formatCurrency(transaction.partner_bonus, transaction.bonus_currency)}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Outgoing Money */}
                                {partnerReport.outgoing_money?.length > 0 && (
                                    <div className="bg-white/5 rounded-lg p-4">
                                        <h3 className="text-lg font-semibold text-white mb-3">حەواڵە کردن</h3>
                                        <div className="space-y-2">
                                            {partnerReport.outgoing_money.map((transaction) => (
                                                <div key={transaction.id} className="flex justify-between items-center p-2 bg-white/5 rounded">
                                                    <div>
                                                        <div className="text-white">
                                                            {formatCurrency(transaction.money_amount, transaction.currency)}
                                                        </div>
                                                        <div className="text-white/70 text-sm">
                                                            Status: {transaction.status}
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="text-green-400 text-sm">
                                                            دوکان: +{formatCurrency(transaction.my_bonus, transaction.bonus_currency)}
                                                        </div>
                                                        <div className="text-blue-400 text-sm">
                                                            نوسینگە: +{formatCurrency(transaction.partner_bonus, transaction.bonus_currency)}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
                    {/* Bonus Cards Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        {/* Daily USD Bonus Card */}
                        <div className="bg-slate-800/80 backdrop-blur-lg border border-white/20 rounded-xl shadow-lg p-6 hover:bg-slate-800/90 transition-colors">
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-2 bg-blue-500/20 rounded-lg">
                                    <DollarSign className="text-blue-400" size={24} />
                                </div>
                                <span className="text-sm text-white/70">ڕۆژانە</span>
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-2">
                                {formatCurrency(dailyBonuses.USD, 'USD')}
                            </h3>
                            <p className="text-white/70">خێری دۆلار</p>
                            <div className="mt-3 flex items-center text-sm text-green-400">
                                <TrendingUp size={16} />
                                <span className="ml-1">داهاتی ئەمڕۆ</span>
                            </div>
                        </div>

                        {/* Daily IQD Bonus Card */}
                        <div className="bg-slate-800/80 backdrop-blur-lg border border-white/20 rounded-xl shadow-lg p-6 hover:bg-slate-800/90 transition-colors">
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-2 bg-green-500/20 rounded-lg">
                                    <CreditCard className="text-green-400" size={24} />
                                </div>
                                <span className="text-sm text-white/70">ڕۆژانە</span>
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-2">
                                {formatCurrency(dailyBonuses.IQD, 'IQD')}
                            </h3>
                            <p className="text-white/70">خێری دینار </p>
                            <div className="mt-3 flex items-center text-sm text-green-400">
                                <TrendingUp size={16} />
                                <span className="ml-1">داهاتی ئەمڕۆ</span>
                            </div>
                        </div>

                        {/* Monthly USD Bonus Card */}
                        <div className="bg-slate-800/80 backdrop-blur-lg border border-white/20 rounded-xl shadow-lg p-6 hover:bg-slate-800/90 transition-colors">
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-2 bg-purple-500/20 rounded-lg">
                                    <Calendar className="text-purple-400" size={24} />
                                </div>
                                <span className="text-sm text-white/70">مانگانە</span>
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-2">
                                {formatCurrency(monthlyBonuses.USD, 'USD')}
                            </h3>
                            <p className="text-white/70">خێری دۆلار</p>
                            <div className="mt-3 flex items-center text-sm text-blue-400">
                                <Wallet size={16} />
                                <span className="ml-1">لە سەرەتای مانگەوە</span>
                            </div>
                        </div>

                        {/* Monthly IQD Bonus Card */}
                        <div className="bg-slate-800/80 backdrop-blur-lg border border-white/20 rounded-xl shadow-lg p-6 hover:bg-slate-800/90 transition-colors">
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-2 bg-amber-500/20 rounded-lg">
                                    <Users className="text-amber-400" size={24} />
                                </div>
                                <span className="text-sm text-white/70">مانگانە</span>
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-2">
                                {formatCurrency(monthlyBonuses.IQD, 'IQD')}
                            </h3>
                            <p className="text-white/70">خێری دینار </p>
                            <div className="mt-3 flex items-center text-sm text-blue-400">
                                <Wallet size={16} />
                                <span className="ml-1">لە سەرەتای مانگەوە</span>
                            </div>
                        </div>
                    </div>

                    {/* Summary Section */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Daily Summary */}
                        <div className="bg-slate-800/80 backdrop-blur-lg border border-white/20 rounded-xl shadow-lg p-6">
                            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                                <Calendar className="text-blue-400" size={20} />
                                کورتەی خێری ڕۆژانە
                            </h2>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                                    <span className="text-white/80">خێری دۆلار</span>
                                    <span className="text-blue-400 font-semibold">
                                        {formatCurrency(dailyBonuses.USD, 'USD')}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                                    <span className="text-white/80">خێری دینار </span>
                                    <span className="text-green-400 font-semibold">
                                        {formatCurrency(dailyBonuses.IQD, 'IQD')}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-blue-500/10 rounded-lg">
                                    <span className="text-white">کۆی گشتی ڕۆژانە</span>
                                    <span className="text-white font-bold" dir='ltr'>
                                        {formatCurrency(dailyBonuses.USD, 'USD')} + {formatCurrency(dailyBonuses.IQD, 'IQD')}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Monthly Summary */}
                        <div className="bg-slate-800/80 backdrop-blur-lg border border-white/20 rounded-xl shadow-lg p-6">
                            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                                <Wallet className="text-purple-400" size={20} />
                                کورتەی خێری مانگانە
                            </h2>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                                    <span className="text-white/80">خێری دۆلار</span>
                                    <span className="text-purple-400 font-semibold">
                                        {formatCurrency(monthlyBonuses.USD, 'USD')}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                                    <span className="text-white/80">خێری دینار </span>
                                    <span className="text-amber-400 font-semibold">
                                        {formatCurrency(monthlyBonuses.IQD, 'IQD')}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-purple-500/10 rounded-lg">
                                    <span className="text-white">کۆی گشتی مانگانە</span>
                                    <span className="text-white font-bold" dir='ltr'>
                                        {formatCurrency(monthlyBonuses.USD, 'USD')} + {formatCurrency(monthlyBonuses.IQD, 'IQD')}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="mt-8 bg-slate-800/80 backdrop-blur-lg border border-white/20 rounded-xl shadow-lg p-6">
                        <h2 className="text-xl font-semibold text-white mb-4 ">ئامارە خێراکان</h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 xsm:grid-cols-1 gap-4">
                            <div className="text-center p-4 bg-white/5 rounded-lg">
                                <DollarSign className="mx-auto text-blue-400 mb-2" size={20} />
                                <div className="text-2xl font-bold text-white">{formatCurrency(dailyBonuses.USD, 'USD')}</div>
                                <p className="text-white/70 text-sm">دۆلاری ڕۆژانە</p>
                            </div>
                            <div className="text-center p-4 bg-white/5 rounded-lg">
                                <CreditCard className="mx-auto text-green-400 mb-2" size={20} />
                                <div className="text-2xl font-bold text-white">{formatCurrency(dailyBonuses.IQD, 'IQD')}</div>
                                <p className="text-white/70 text-sm">دینار  ڕۆژانە</p>
                            </div>
                            <div className="text-center p-4 bg-white/5 rounded-lg">
                                <Wallet className="mx-auto text-purple-400 mb-2" size={20} />
                                <div className="text-2xl font-bold text-white">{formatCurrency(monthlyBonuses.USD, 'USD')}</div>
                                <p className="text-white/70 text-sm">دۆلاری مانگانە</p>
                            </div>
                            <div className="text-center p-4 bg-white/5 rounded-lg">
                                <Users className="mx-auto text-amber-400 mb-2" size={20} />
                                <div className="text-2xl font-bold text-white">{formatCurrency(monthlyBonuses.IQD, 'IQD')}</div>
                                <p className="text-white/70 text-sm">دینار  مانگانە</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            );
};

            export default Dashboard;
