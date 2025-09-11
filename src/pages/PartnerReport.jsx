import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import { api } from '../services/apiService';
import { User, CreditCard, ArrowDown, ArrowUp, FileText, Wallet, TrendingUp, Download } from 'lucide-react';
import formatDate from '../components/formatdate';
import selectStyles from '../components/styles';

const PartnerReport = () => {
    const [partners, setPartners] = useState([]);
    const [selectedPartner, setSelectedPartner] = useState(null);
    const [reportData, setReportData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    useEffect(() => {
        const fetchPartners = async () => {
            try {
                const response = await api.partners.getAll();
                setPartners(response.data);
            } catch {
                setError('Failed to load partner list.');
            }
        };
        fetchPartners();
    }, []);

    const fetchReport = async () => {
        if (!selectedPartner) {
            setError('Please select a partner first.');
            setReportData(null);
            return;
        }

        setLoading(true);
        setError(null);
        try {
            const params = new URLSearchParams();
            if (startDate) params.append('start', startDate);
            if (endDate) params.append('end', endDate);

            const response = await api.partners.getReport(selectedPartner.value, params);
            setReportData(response.data);
        } catch {
            setError('Failed to fetch report.');
            setReportData(null);
        } finally {
            setLoading(false);
        }
    };

    const handleGenerateReport = () => {
        fetchReport();
    };

    const calculateTotals = () => {
        if (!reportData) return null;

        const cryptoTotal = reportData.crypto_transactions?.reduce((sum, transaction) => {
            const amount = parseFloat(transaction.usdt_amount || transaction.amount || 0);
            if (transaction.transaction_type === 'Buy') {
                return sum + amount;
            } else if (transaction.transaction_type === 'Sell') {
                return sum - amount;
            }
            return sum;
        }, 0) || 0;

        const incomingTotal = reportData.incoming_money?.reduce((sum, transaction) =>
            sum + parseFloat(transaction.money_amount || transaction.amount || 0), 0) || 0;

        const outgoingTotal = reportData.outgoing_money?.reduce((sum, transaction) =>
            sum + parseFloat(transaction.money_amount || transaction.amount || 0), 0) || 0;

        const debtTotal = reportData.debts?.reduce((sum, debt) =>
            sum + parseFloat(debt.total_amount || 0), 0) || 0;

        const repaidTotal = reportData.debts?.reduce((sum, debt) =>
            sum + parseFloat(debt.amount_repaid || 0), 0) || 0;

        const remainingDebt = reportData.debts?.reduce((sum, debt) =>
            sum + parseFloat(debt.remaining_amount || 0), 0) || 0;

        return {
            cryptoTotal,
            incomingTotal,
            outgoingTotal,
            debtTotal,
            repaidTotal,
            remainingDebt,
            grandTotal: cryptoTotal + incomingTotal + outgoingTotal
        };
    };

    const renderReportContent = () => {
        if (loading) return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
            </div>
        );

        if (error) return (
            <div className="bg-red-500/20 backdrop-blur-sm border border-red-500/30 rounded-xl p-6 text-red-200">
                Error: {error}
            </div>
        );

        if (!reportData) return (
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6 text-center text-white/60">
                Select a partner and dates to generate a report.
            </div>
        );

        const totals = calculateTotals();

        return (
            <div className="space-y-6">
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-slate-800/80 backdrop-blur-lg border border-white/20 rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <TrendingUp className="text-green-400" size={16} />
                            <span className="text-white/80">کۆی گشتی مامەڵەی کریپتـۆ</span>
                        </div>
                        <div className={`text-xl font-bold ${Number(totals?.cryptoTotal) < 0 ? 'text-red-400' : 'text-white'}`}>
                            {totals?.cryptoTotal?.toFixed(2)} USD
                        </div>
                    </div>

                    <div className="bg-slate-800/80 backdrop-blur-lg border border-white/20 rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <ArrowDown className="text-green-400" size={16} />
                            <span className="text-white/80">حەواڵەی هاتوو</span>
                        </div>
                        <div className="text-xl font-bold text-white">
                            {totals?.incomingTotal?.toFixed(2)} USD
                        </div>
                    </div>

                    <div className="bg-slate-800/80 backdrop-blur-lg border border-white/20 rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <ArrowUp className="text-red-400" size={16} />
                            <span className="text-white/80">حەواڵە کراو</span>
                        </div>
                        <div className="text-xl font-bold text-white">
                            {totals?.outgoingTotal?.toFixed(2)} USD
                        </div>
                    </div>
                </div>

                {/* Crypto Transactions */}
                <div className="bg-slate-800/80 backdrop-blur-lg border border-white/20 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <CreditCard className="text-blue-400" size={20} />
                        مامەڵەکانی کریپتۆ ({reportData.crypto_transactions?.length || 0})
                    </h3>
                    {reportData.crypto_transactions?.length > 0 ? (
                        <div className="space-y-2">
                            {reportData.crypto_transactions.map((transaction) => (
                                <div key={transaction.id} className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                                    <div>
                                        <div className="text-white font-medium">{transaction.transaction_type}</div>
                                        <div className="text-white/70 text-sm">
                                            {transaction.client_name || transaction.partner_client  || 'No client name'}
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-white font-bold">
                                            {parseFloat(transaction.usdt_amount).toFixed(2)} USDT
                                        </div>
                                        <div className="text-green-400 text-sm">
                                            نرخ: {parseFloat(transaction.usdt_price).toFixed(2)} {transaction.currency}
                                        </div>
                                        <div className="text-white/70 text-xs">
                                            {formatDate(transaction.created_at)}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-white/60">هیچ مامەڵەیەکی کریپتۆ نییە</p>
                    )}
                </div>

                {/* Incoming Money */}
                <div className="bg-slate-800/80 backdrop-blur-lg border border-white/20 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <ArrowDown className="text-green-400" size={20} />
                        حەواڵەی هاتوو ({reportData.incoming_money?.length || 0})
                    </h3>
                    {reportData.incoming_money?.length > 0 ? (
                        <div className="space-y-2">
                            {reportData.incoming_money.map((transaction) => (
                                <div key={transaction.id} className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                                    <div>
                                        <div className="text-white font-medium">
                                            {parseFloat(transaction.money_amount).toFixed(2)} {transaction.currency}
                                        </div>
                                        <div className="text-white/70 text-sm">
                                            بارودۆخ: <span className={transaction.status === 'Completed' ? 'text-green-400' : 'text-amber-400'}>
                                                {transaction.status}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-green-400 text-sm">
                                            عمولەی من: +{parseFloat(transaction.my_bonus).toFixed(2)} {transaction.bonus_currency}
                                        </div>
                                        <div className="text-blue-400 text-sm">
                                            عمولەی شەریک: +{parseFloat(transaction.partner_bonus).toFixed(2)} {transaction.bonus_currency}
                                        </div>
                                        <div className="text-white/70 text-xs">
                                            {formatDate(transaction.created_at)}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-white/60">هیچ حەواڵەیەکی هاتووی نییە.</p>
                    )}
                </div>
                {/* Incoming Money */}
                <div className="bg-slate-800/80 backdrop-blur-lg border border-white/20 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <ArrowDown className="text-green-400" size={20} />
                        حەواڵەی هاتوو ({reportData.incoming_money?.length || 0})
                    </h3>
                    {reportData.incoming_money?.length > 0 ? (
                        <div className="space-y-2">
                            {reportData.incoming_money.map((transaction) => (
                                <div key={transaction.id} className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                                    <div>
                                        <div className="text-white font-medium">
                                            {parseFloat(transaction.money_amount).toFixed(2)} {transaction.currency}
                                        </div>
                                        <div className="text-white/70 text-sm">
                                            بارودۆخ: <span className={transaction.status === 'Completed' ? 'text-green-400' : 'text-amber-400'}>
                                                {transaction.status}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-green-400 text-sm">
                                            عمولەی من: +{parseFloat(transaction.my_bonus).toFixed(2)} {transaction.bonus_currency}
                                        </div>
                                        <div className="text-blue-400 text-sm">
                                            عمولەی شەریک: +{parseFloat(transaction.partner_bonus).toFixed(2)} {transaction.bonus_currency}
                                        </div>
                                        <div className="text-white/70 text-xs">
                                            {formatDate(transaction.created_at)}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-white/60">هیچ حەواڵەیەکی هاتووی نییە.</p>
                    )}
                </div>

                {/* Outgoing Money */}
                <div className="bg-slate-800/80 backdrop-blur-lg border border-white/20 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <ArrowUp className="text-red-400" size={20} />
                        حەواڵەی کراو ({reportData.outgoing_money?.length || 0})
                    </h3>
                    {reportData.outgoing_money?.length > 0 ? (
                        <div className="space-y-2">
                            {reportData.outgoing_money.map((transaction) => (
                                <div key={transaction.id} className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                                    <div>
                                        <div className="text-white font-medium">
                                            {parseFloat(transaction.money_amount).toFixed(2)} {transaction.currency}
                                        </div>
                                        <div className="text-white/70 text-sm">
                                            بارودۆخ: <span className={transaction.status === 'Completed' ? 'text-green-400' : 'text-amber-400'}>
                                                {transaction.status}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-green-400 text-sm">
                                            عمولەی من: +{parseFloat(transaction.my_bonus).toFixed(2)} {transaction.bonus_currency}
                                        </div>
                                        <div className="text-blue-400 text-sm">
                                            عمولەی شەریک: +{parseFloat(transaction.partner_bonus).toFixed(2)} {transaction.bonus_currency}
                                        </div>
                                        <div className="text-white/70 text-xs">
                                            {formatDate(transaction.created_at)}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-white/60">هیچ حەواڵەیەکی کراو نییە.</p>
                    )}
                </div>

                {/* Debts Section */}
                {reportData.debts?.length > 0 && (
                    <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6">
                        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                            <FileText className="text-amber-400" size={20} />
                            Debts ({reportData.debts.length})
                        </h3>
                        <div className="space-y-3">
                            {reportData.debts.map((debt) => (
                                <div key={debt.id} className="p-3 bg-white/5 rounded-lg">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <div className="text-white font-medium">
                                                {parseFloat(debt.total_amount).toFixed(2)} {debt.currency}
                                            </div>
                                            <div className="text-white/70 text-sm">
                                                Debtor: {debt.debtor_name}
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-green-400">
                                                Repaid: {parseFloat(debt.amount_repaid).toFixed(2)}
                                            </div>
                                            <div className="text-red-400">
                                                Remaining: {parseFloat(debt.remaining_amount).toFixed(2)}
                                            </div>
                                        </div>
                                    </div>
                                    {debt.note && (
                                        <p className="text-white/70 text-sm mt-2">Note: {debt.note}</p>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Debt Repayments Section */}
                {reportData.debt_repayments?.length > 0 && (
                    <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6">
                        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                            <Wallet className="text-green-400" size={20} />
                            Debt Repayments ({reportData.debt_repayments.length})
                        </h3>
                        <div className="space-y-2">
                            {reportData.debt_repayments.map((repayment) => (
                                <div key={repayment.id} className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                                    <div>
                                        <div className="text-white font-medium">
                                            {parseFloat(repayment.amount).toFixed(2)} {repayment.currency}
                                        </div>
                                        <div className="text-white/70 text-sm">
                                            Safe: {repayment.safe_type?.name || 'N/A'}
                                        </div>
                                    </div>
                                    <div className="text-white/70 text-xs">
                                        {formatDate(repayment.created_at)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="p-4 min-h-screen bg-slate-50-900 ml-0 sm:mt-6 md:mt-0 xsm:mt-6">
            <div className="mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-white">حسابی کەسی</h1>
                </div>

                {/* Filters */}
                <div className="bg-slate-800/80 backdrop-blur-lg border border-white/20 rounded-xl shadow-lg p-6 mb-6">
                    <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                        <User className="text-blue-400" size={20} />
                        پیشاندانی ڕاپۆرت
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div>
                            <label className="block text-white/80 mb-2">ناو دیاری بکە</label>
                            <Select
                                menuPortalTarget={document.body}
                                value={selectedPartner}
                                onChange={setSelectedPartner}
                                options={partners.map(partner => ({ value: partner.id, label: partner.name }))}
                                isClearable
                                isSearchable
                                styles={selectStyles}
                                placeholder="ناو دیاری بکە.."
                            />
                        </div>

                        <div>
                            <label className="block text-white/80 mb-2">لە بەرواری</label>
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                            />
                        </div>

                        <div>
                            <label className="block text-white/80 mb-2">بۆ بەرواری</label>
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                            />
                        </div>
                    </div>

                    <button
                        onClick={handleGenerateReport}
                        disabled={loading}
                        className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-all disabled:opacity-50"
                    >
                        <Download size={18} />
                        {loading ? 'چاوەڕوانبـە...' : 'پیشاندانی ڕاپۆرت'}
                    </button>
                </div>

                {/* Report Content */}
                {renderReportContent()}
            </div></div>
    );
};

export default PartnerReport;