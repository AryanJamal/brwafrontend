import React, { useState, useEffect } from 'react';
import { api } from '../services/apiService';
import { User, Clock, DollarSign, ArrowLeftRight, Coins, Banknote } from 'lucide-react';
import formatDate from '../components/formatdate';
const ExchangeTypeChoices = {
    USD_TO_IQD: 'دۆلار بۆ دینار',
    IQD_TO_USD: 'دینار بۆ دۆلار',
};

const TransferxExchange = () => {
    const [exchanges, setExchanges] = useState([]);
    const [partners, setPartners] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isAutoCalculateEnabled, setIsAutoCalculateEnabled] = useState(true);
    const [newExchange, setNewExchange] = useState({
        partner: '',
        exchange_type: 'USD_TO_IQD',
        usd_amount: '',
        iqd_amount: '',
        exchange_rate: '',
    });

    // Fetch initial data when the component mounts
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [exchangesData, partnersData,] = await Promise.all([
                    api.transferExchanges.getAll(),
                    api.safePartnersApi.getAll(),
                    api.safeTypes.getAll()
                ]);

                setExchanges(exchangesData.data);
                setPartners(partnersData.data);
            } catch (error) {
                console.error("Failed to fetch data:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    
    // Handle changes in the form inputs
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewExchange(prevState => ({
            ...prevState,
            [name]: value,
        }));
    };

    // Handle changes in the amount fields with conditional calculation
    const handleAmountChange = (e) => {
        const { name, value } = e.target;
        const rate = parseFloat(newExchange.exchange_rate);
        const newValue = value.replace(/[^0-9.]/g, ''); // Sanitize input to only numbers and decimal point

        // Update the state for the field that was just changed
        setNewExchange(prevState => ({
            ...prevState,
            [name]: newValue,
        }));

        // If auto-calculation is off, just update the single field and return
        if (!isAutoCalculateEnabled) {
            return;
        }

        // Perform automatic calculation if the exchange rate is valid
        if (rate > 0) {
            if (name === 'usd_amount') {
                const usd = parseFloat(newValue);
                const iqd = Math.round(usd * rate);
                setNewExchange(prevState => ({
                    ...prevState,
                    usd_amount: newValue,
                    iqd_amount: isNaN(iqd) ? '' : iqd.toString(),
                }));
            } else if (name === 'iqd_amount') {
                const iqd = parseFloat(newValue);
                const usd = iqd / rate;
                setNewExchange(prevState => ({
                    ...prevState,
                    iqd_amount: newValue,
                    usd_amount: isNaN(usd) ? '' : usd.toFixed(2),
                }));
            }
        }
    };

    // Handle form submission to create a new exchange
    const handleFormSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const response = await api.transferExchanges.create({
                ...newExchange,
                usd_amount: parseFloat(newExchange.usd_amount),
                iqd_amount: parseInt(newExchange.iqd_amount),
                exchange_rate: parseFloat(newExchange.exchange_rate),
            });

            setExchanges(prevExchanges => [response.data, ...prevExchanges]);
            setNewExchange({
                partner: '',
                exchange_type: 'USD_TO_IQD',
                usd_amount: '',
                iqd_amount: '',
                exchange_rate: '',
            });
        } catch (error) {
            console.error("Failed to create transfer exchange:", error);
        } finally {
            setIsLoading(false);
        }
    };


    return (
        <div className="p-4 min-h-screen bg-slate-50-900 ml-0 sm:mt-6 md:mt-0 xsm:mt-6">
            <div className="mx-auto">
                <h1 className="text-2xl font-bold text-white mb-6">ئاڵوگـۆڕی دراو</h1>

                {/* Form to add a new transfer exchange */}
                <div className="bg-slate-800/80 backdrop-blur-lg border border-white/20 rounded-xl shadow-lg p-6 mb-8">
                    <h2 className="text-xl font-semibold text-white mb-4">ئاڵوگۆڕ کردن</h2>
                    <form onSubmit={handleFormSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-white/80 mb-2">شەریـک</label>
                            <select
                                name="partner"
                                value={newExchange.partner}
                                onChange={handleInputChange}
                                required
                                className="w-full bg-slate-800/65 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                            >
                                <option value="">شەریک دیاری بکە..</option>
                                {partners.map(partner => (
                                    <option key={partner.id} value={partner.id} className='text-white'>
                                        {partner.partner.name} - {partner.safe_type.name  }
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-white/80 mb-2">جۆری ئاڵوگۆڕ</label>
                            <select
                                name="exchange_type"
                                value={newExchange.exchange_type}
                                onChange={handleInputChange}
                                required
                                className="w-full bg-slate-800/65 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                            >
                                {Object.entries(ExchangeTypeChoices).map(([key, value]) => (
                                    <option key={key} value={key} className='text-white'>{value}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-white/80 mb-2">نرخی دۆلار</label>
                            <input
                                type="number"
                                name="exchange_rate"
                                value={newExchange.exchange_rate}
                                onChange={handleInputChange}
                                required
                                step="1000"
                                className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 appearance-none"
                            />
                        </div>

                        <div>
                            <label className="block text-white/80 mb-2">بڕی دۆلار</label>
                            <input
                                type="number"
                                name="usd_amount"
                                value={newExchange.usd_amount}
                                onChange={handleAmountChange}
                                required
                                step="1000"
                                className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 appearance-none"
                            />
                        </div>

                        <div>
                            <label className="block text-white/80 mb-2">بڕی دینار</label>
                            <input
                                type="number"
                                name="iqd_amount"
                                value={newExchange.iqd_amount}
                                onChange={handleAmountChange}
                                step="100000"
                                required
                                className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 appearance-none"
                            />
                        </div>

                        <div className="flex flex-col items-start justify-center gap-2">
                            <label className="flex items-center gap-2 text-white/80">
                                <input
                                    type="checkbox"
                                    checked={isAutoCalculateEnabled}
                                    onChange={(e) => setIsAutoCalculateEnabled(e.target.checked)}
                                    className="form-checkbox text-blue-500 rounded-sm"
                                />
                                <span>کاراکردنی گۆڕینی ئۆتۆماتیکی</span>
                            </label>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full flex justify-center items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-all disabled:opacity-50 mt-auto"
                            >
                                {isLoading ? 'ناردن...' : 'زیادکردن'}
                            </button>
                        </div>
                    </form>
                </div>

                {/* List of exchanges */}
                <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl shadow-lg p-4 sm:p-6 md:p-0 overflow-hidden">
                <div className="space-y-4">
                    {isLoading ? (
                        <div className="flex justify-center items-center h-64">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
                        </div>
                    ) : exchanges.length === 0 ? (
                        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6 text-center text-white/60">
                            No exchanges found
                        </div>
                    ) : (
                        exchanges.map((exchange) => (
                            <div key={exchange.id} className="bg-slate-800/80 backdrop-blur-lg border border-white/20 rounded-xl shadow-lg p-6 hover:bg-slate-800 transition-colors">
                                <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-4 gap-4">
                                    <div className="flex items-center gap-3">
                                        <User className="text-blue-400" size={20} />
                                        <div>
                                            <h3 className="text-lg font-semibold text-white">
                                                {exchange.partner.partner?.name || 'Unknown Partner'}
                                            </h3>
                                            {exchange.partner?.safe_type && (
                                                <p className="text-sm text-white/70">
                                                    شوێن: {exchange.partner.safe_type.name}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-white/70">
                                        <Clock size={16} />
                                        <span>{formatDate(exchange.created_at)}</span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                    <div className="flex items-center gap-3">
                                        <DollarSign className="text-green-400" size={20} />
                                        <div>
                                            <p className="text-sm text-white/80">بڕی دۆلار</p>
                                            <p className="text-white font-medium">
                                                ${parseFloat(exchange.usd_amount).toLocaleString()}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <Banknote className="text-yellow-400" size={20} />
                                        <div>
                                            <p className="text-sm text-white/80">بڕی دینار</p>
                                            <p className="text-white font-medium">
                                                {parseInt(exchange.iqd_amount).toLocaleString()}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <ArrowLeftRight className="text-purple-400" size={20} />
                                        <div>
                                            <p className="text-sm text-white/80">جۆری ئاڵوگۆڕ</p>
                                            <p className="text-white font-medium">
                                                {ExchangeTypeChoices[exchange.exchange_type ]}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <Coins className="text-amber-400" size={20} />
                                        <div>
                                            <p className="text-sm text-white/80">نرخی دۆلار</p>
                                            <p className="text-white font-medium">
                                                {parseInt(exchange.exchange_rate).toLocaleString()}
                                            </p>
                                        </div>
                                    </div>
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

export default TransferxExchange;