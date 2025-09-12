import { useState, useEffect } from 'react';
import { api } from '../services/apiService';
import { DollarSign, Calendar, TrendingUp, Users, Wallet, CreditCard, FileText, Building, ArrowUp, ArrowDown, RefreshCcw } from 'lucide-react';

const Dashboard = () => {
    const [dailyBonuses, setDailyBonuses] = useState({ USD: '0.00', IQD: '0.00' });
    const [monthlyBonuses, setMonthlyBonuses] = useState({ USD: '0.00', IQD: '0.00' });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    // eslint-disable-next-line no-unused-vars
    const [selectedPeriod, setSelectedPeriod] = useState('today');
    // Fetch initial data
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [dailyResponse, monthlyResponse,] = await Promise.all([
                    api.bonuses.getDaily(),
                    api.bonuses.getMonthly(),
                ]);

                setDailyBonuses(dailyResponse.data);
                setMonthlyBonuses(monthlyResponse.data);

            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [selectedPeriod]);

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
    return (
        <div className="p-4 min-h-screen bg-slate-50-900 ml-0 sm:mt-6 md:mt-0 xsm:mt-6">
            <div className="mx-auto">
                <div className="flex justify-between items-center mb-6">

                <h1 className="text-2xl font-bold text-white">داهـات</h1>
                    <button
                        onClick={refreshData}
                        className="flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 text-white px-4 py-2 rounded-lg transition-all"
                    >
                        <RefreshCcw size={18} />
                        نوێکردنەوە
                    </button>
                </div>
                    {/* Bonus Cards Grid */}
                    <div className="bg-white/10 backdrop-blur-lg rounded-xl shadow-lg p-4 sm:p-6 md:p-0 overflow-hidden">
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
            </div>
            );
};

            export default Dashboard;
