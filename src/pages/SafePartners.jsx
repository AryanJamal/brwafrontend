import { useState, useEffect, useMemo, useCallback } from "react";
import {
    Plus,
    Trash2,
    X,
    Check,
    ChevronDown,
    CheckCircle,
    AlertTriangle,
    Loader2,
    Edit2,
    Search, // Added search icon
} from "lucide-react";
import { safePartnersApi, safeTypesApi } from "../services/apiService";

const defaultFormData = {
    partner_name: "",
    partner_phone_number: "",
    safe_type_id: "",
    total_usd: "",
    total_usdt: "",
    total_iqd: "",
    is_office: false,
    is_person: false,
};

const formatPartnerResponse = (rawPartner, safeTypesList) => {
    if (rawPartner.partner && rawPartner.safe_type) {
        return rawPartner;
    }
    const safeType = safeTypesList.find(
        (type) => type.id.toString() === rawPartner.safe_type_id
    );
    return {
        ...rawPartner,
        partner: {
            name: rawPartner.partner_name,
            phone_number: rawPartner.partner_phone_number,
        },
        safe_type: safeType || {
            id: rawPartner.safe_type_id,
            name: "Unknown",
            type: "Unknown",
        },
    };
};

const SafePartners = () => {
    const [safePartners, setSafePartners] = useState([]);
    const [safeTypes, setSafeTypes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [partnerToDeleteId, setPartnerToDeleteId] = useState(null);
    const [statusMessage, setStatusMessage] = useState(null);
    const [isSuccess, setIsSuccess] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState(defaultFormData);
    const [currentPartner, setCurrentPartner] = useState(null);

    // New state for search query
    const [searchQuery, setSearchQuery] = useState("");
    // New state for aggregated totals
    const [totals, setTotals] = useState({});

    const dismissStatus = useCallback(() => {
        setTimeout(() => {
            setStatusMessage(null);
        }, 5000);
    }, []);

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const [partnersResponse, typesResponse] = await Promise.all([
                safePartnersApi.getAll(),
                safeTypesApi.getAll(),
            ]);
            const formattedPartners = partnersResponse.data.map((p) =>
                formatPartnerResponse(p, typesResponse.data)
            );
            setSafeTypes(typesResponse.data);
            setSafePartners(formattedPartners);
            setLoading(false);
        } catch (err) {
            console.error("Failed to fetch data:", err);
            setError(err.message);
            setLoading(false);
        }
    }, []);

    // Effect to calculate totals whenever safePartners or safeTypes change
    useEffect(() => {
        if (safePartners.length > 0 && safeTypes.length > 0) {
            const calculatedTotals = safePartners.reduce((acc, partner) => {
                const safeTypeName = partner.safe_type?.name;
                if (safeTypeName) {
                    if (!acc[safeTypeName]) {
                        acc[safeTypeName] = { usd: 0, iqd: 0, usdt: 0 };
                    }
                    acc[safeTypeName].usd += Number(partner.total_usd);
                    acc[safeTypeName].iqd += Number(partner.total_iqd) || 0;
                    acc[safeTypeName].usdt += Number(partner.total_usdt) || 0;
                }
                return acc;
            }, {});
            setTotals(calculatedTotals);
        } else {
            setTotals({});
        }
    }, [safePartners, safeTypes]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleRadioChange = (e) => {
        const { name } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            is_office: name === "is_office",
            is_person: name === "is_person",
        }));
    };

    const handleCreateOrUpdate = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        const payload = {
            partner_name: formData.partner_name,
            partner_phone_number: formData.partner_phone_number,
            safe_type_id: formData.safe_type_id,
            is_office: formData.is_office,
            is_person: formData.is_person,
            total_usd: parseFloat(formData.total_usd) || 0,
            total_usdt: parseFloat(formData.total_usdt) || 0,
            total_iqd: parseFloat(formData.total_iqd) || 0,
        };

        try {
            if (currentPartner) {
                await safePartnersApi.update(currentPartner.id, payload);
                setStatusMessage("Partner updated successfully.");
                setSafePartners((prevPartners) =>
                    prevPartners.map((p) =>
                        p.id === currentPartner.id
                            ? {
                                ...p,
                                ...payload,
                                partner: {
                                    name: payload.partner_name,
                                    phone_number: payload.partner_phone_number,
                                },
                                safe_type: safeTypes.find(
                                    (type) => type.id.toString() === payload.safe_type_id
                                ),
                            }
                            : p
                    )
                );
            } else {
                await safePartnersApi.create(payload);
                setStatusMessage("Partner created successfully.");
                fetchData();
            }
            setIsSuccess(true);
            resetForm();
        } catch (err) {
            console.error("Form submission error:", err);
            setStatusMessage(`Error: ${err.message}`);
            setIsSuccess(false);
        } finally {
            setIsSubmitting(false);
            dismissStatus();
        }
    };

    const handleDelete = useCallback((id) => {
        setPartnerToDeleteId(id);
        setShowConfirmModal(true);
    }, []);

    const confirmDelete = async () => {
        try {
            await safePartnersApi.delete(partnerToDeleteId);
            setSafePartners(
                safePartners.filter((partner) => partner.id !== partnerToDeleteId)
            );
            setShowConfirmModal(false);
            setPartnerToDeleteId(null);
            setStatusMessage("Partner deleted successfully.");
            setIsSuccess(true);
        } catch (err) {
            console.error("Deletion error:", err);
            setShowConfirmModal(false);
            setStatusMessage(`Error deleting partner: ${err.message}`);
            setIsSuccess(false);
        } finally {
            dismissStatus();
        }
    };

    const resetForm = () => {
        setFormData(defaultFormData);
        setShowForm(false);
        setCurrentPartner(null);
    };


    // Filtered partners based on search query
    const filteredPartners = useMemo(() => {
        if (!searchQuery) {
            return safePartners;
        }
        return safePartners.filter(
            (partner) =>
                partner.partner.name
                    .toLowerCase()
                    .includes(searchQuery.toLowerCase()) ||
                partner.safe_type.name
                    .toLowerCase()
                    .includes(searchQuery.toLowerCase())
        );
    }, [safePartners, searchQuery]);

    const renderedPartners = useMemo(() => {
    if (filteredPartners.length === 0) {
        return (
            <div className="p-6 text-center text-white/60">
                No safe partners found.
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 md:grid-cols-1 gap-3 p-4">
            {filteredPartners.map((partner) => (
                <div
                    key={partner.id}
                    className="bg-gray-800/80 backdrop-blur-sm border border-white/10 rounded-lg p-4"
                >
                    <div className="flex justify-between items-start">
                        <div>
                            <h2 className="font-bold text-white">{partner.partner.name}</h2>
                            <p className="text-sm text-white/70">
                                {partner.partner.phone_number || "No phone"}
                            </p>
                        </div>
                        <span
                            className={`text-xs px-2 py-1 rounded-full ${partner.safe_type.type === "Crypto"
                                ? "bg-blue-500/20 text-blue-300"
                                : "bg-amber-500/20 text-amber-300"
                            }`}
                        >
                            {partner.safe_type.name}
                        </span>
                    </div>
                    <div className="mt-3 grid lg:grid-cols-3 md:grid-cols-1 sm:grid-cols-1 gap-2 text-xl">
                        <div className={`rounded p-2 ${partner.total_usd < 0 ? "bg-red-950" : "bg-white/5"}`}>
                            <div className="text-white/60 text-xs">USD</div>
                            <div className="text-white font-mono overflow-hidden">
                                {Number(partner.total_usd)?.toLocaleString(undefined, {
                                    minimumFractionDigits: 2,
                                }) || "0.00"}
                            </div>
                        </div>
                        <div className={`rounded p-2 ${partner.total_iqd < 0 ? "bg-red-950" : "bg-white/5"}`}>
                            <div className="text-white/60 text-xs">IQD</div>
                            <div className="text-white font-mono overflow-hidden">
                                {Number(partner.total_iqd)?.toLocaleString() || "0"}
                            </div>
                        </div>
                        <div className={`rounded p-2 ${partner.total_usdt < 0 ? "bg-red-950" : "bg-white/5"}`}>
                            <div className="text-white/60 text-xs">USDT</div>
                            <div className="text-white font-mono overflow-hidden">
                                {Number(partner.total_usdt)?.toLocaleString(undefined, {
                                    minimumFractionDigits: 2,
                                }) || "0.00"}
                            </div>
                        </div>
                    </div>
                    <div className="mt-3 flex justify-end gap-2">
                        <button
                            onClick={() => handleDelete(partner.id)}
                            className="text-white/70 hover:text-red-400 p-1"
                            aria-label={`Delete ${partner.partner.name}`}
                        >
                            <Trash2 size={18} />
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
}, [filteredPartners, handleDelete]);

    if (loading)
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="animate-spin h-12 w-12 text-blue-500" />
            </div>
        );

    if (error)
        return (
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
        <div className="p-4 min-h-screen ml-0 sm:mt-6 md:mt-0 xsm:mt-6">
            <div className="mx-auto">
                <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                    <h1 className="text-2xl font-bold text-white">حساباتی قاسەکان</h1>
                    <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                        
                        <button
                            onClick={() => {
                                if (showForm) {
                                    resetForm();
                                } else {
                                    setShowForm(true);
                                }
                            }}
                            className="flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 text-white px-4 py-2 rounded-lg transition-all"
                        >
                            {showForm ? (
                                <>
                                    <X size={18} />
                                    هەڵوەشاندنەوە
                                </>
                            ) : (
                                <>
                                    <Plus size={18} />
                                    زیادکردنی خاوەن
                                </>
                            )}
                        </button>
                    </div>
                </div>
                
                {showForm && (
                    <div className="bg-slate-800/80 backdrop-blur-lg border border-white/20 rounded-xl shadow-lg p-6 mb-8 transition-all duration-300 transform scale-100 opacity-100">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold text-white">
                                {"زیادکردنی حساب"}
                            </h2>
                            <button
                                onClick={resetForm}
                                className="text-white/70 hover:text-white"
                                aria-label="Close form"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleCreateOrUpdate} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div>
                                        <label htmlFor="partner_name" className="block text-white/80 mb-2">
                                            ناوی خاوەن حساب
                                        </label>
                                        <input
                                            type="text"
                                            id="partner_name"
                                            name="partner_name"
                                            value={formData.partner_name}
                                            onChange={handleInputChange}
                                            className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="partner_phone_number" className="block text-white/80 mb-2">
                                            ژمارەی مۆبایل
                                        </label>
                                        <input
                                            type="tel"
                                            id="partner_phone_number"
                                            name="partner_phone_number"
                                            value={formData.partner_phone_number}
                                            onChange={handleInputChange}
                                            className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="safe_type_id" className="block text-white/80 mb-2">
                                            جۆری قاسە
                                        </label>
                                        <div className="relative">
                                            <select
                                                id="safe_type_id"
                                                name="safe_type_id"
                                                value={formData.safe_type_id}
                                                onChange={handleInputChange}
                                                className="w-full bg-slate-800/80 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 appearance-none"
                                                required
                                            >
                                                <option value="" disabled>
                                                    جۆر دیاری بکە
                                                </option>
                                                {safeTypes.map((type) => (
                                                    <option key={type.id} value={type.id}>
                                                        {type.name} ({type.type})
                                                    </option>
                                                ))}
                                            </select>
                                            <ChevronDown
                                                className="absolute left-3 top-3 text-white/50 pointer-events-none"
                                                size={18}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <label htmlFor="total_usd" className="block text-white/80 mb-2">
                                            کۆی گشتی دۆلار
                                        </label>
                                        <input
                                            type="number"
                                            id="total_usd"
                                            step="100"
                                            name="total_usd"
                                            value={formData.total_usd}
                                            onChange={handleInputChange}
                                            className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 appearance-none"
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="total_usdt" className="block text-white/80 mb-2">
                                            کۆی گشتی USDT
                                        </label>
                                        <input
                                            type="number"
                                            id="total_usdt"
                                            step="1"
                                            name="total_usdt"
                                            value={formData.total_usdt}
                                            onChange={handleInputChange}
                                            className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 appearance-none"
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="total_iqd" className="block text-white/80 mb-2 ">
                                            کۆی گشتی دینار
                                        </label>
                                        <input
                                            type="number"
                                            id="total_iqd"
                                            name="total_iqd"
                                            value={formData.total_iqd}
                                            onChange={handleInputChange}
                                            step="1000"
                                            className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 appearance-none"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex space-x-6 items-center">
                                <label className="block text-white/80">جۆری خاوەن</label>
                                <div className="flex items-center">
                                    <input
                                        id="is_office"
                                        type="radio"
                                        name="is_office"
                                        checked={formData.is_office}
                                        onChange={handleRadioChange}
                                        className="h-4 w-4 text-blue-500 border-gray-300 focus:ring-blue-500"
                                    />
                                    <label htmlFor="is_office" className="mr-2 text-white/80">
                                        نوسینگە
                                    </label>
                                </div>
                                <div className="flex items-center">
                                    <input
                                        id="is_person"
                                        type="radio"
                                        name="is_person"
                                        checked={formData.is_person}
                                        onChange={handleRadioChange}
                                        className="h-4 w-4 text-blue-500 border-gray-300 focus:ring-blue-500"
                                    />
                                    <label htmlFor="is_person" className="mr-2 text-white/80">
                                        ئامانەت
                                    </label>
                                </div>
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isSubmitting ? (
                                        <Loader2 size={18} className="animate-spin" />
                                    ) : (
                                        <Check size={18} />
                                    )}
                                    {"زیادکردنی خاوەن حساب"}
                                </button>
                                <button
                                    type="button"
                                    onClick={resetForm}
                                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white px-4 py-2 rounded-lg transition-all"
                                >
                                    <X size={18} />
                                    هەڵوەشاندنەوە
                                </button>
                            </div>
                        </form>
                    </div>
                )}
                {/* Aggregated Totals Display */}
                <div className="flex items-right justify-right gap-2 backdrop-blur-sm text-white py-5 rounded-lg transition-all">
                            <input
                                type="text"
                                placeholder="گەڕان بەدوای خاوەن یان قاسە..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-2 pr-10 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-slate-800/80 lg:w-100"
                            />
                            <Search
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50"
                                size={18}
                            />
                        </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                    {Object.entries(totals).map(([safeTypeName, safeTotal]) => (
                        <div
                            key={safeTypeName}
                            className="bg-gray-800/80 backdrop-blur-sm border border-white/10 rounded-lg p-4 text-center"
                        >
                            <h3 className="text-xl font-bold text-white mb-2">
                                کۆی گشتی {safeTypeName}
                            </h3>
                            <div className="grid grid-cols-3 gap-2">
                                <div className="bg-white/5 rounded p-2">
                                    <div className="text-white/60 text-xs">USD</div>
                                    <div className="text-white font-mono">
                                        {safeTotal.usd?.toLocaleString(undefined, {minimumFractionDigits: 2}) || "0.00"}
                                    </div>
                                </div>
                                <div className="bg-white/5 rounded p-2">
                                    <div className="text-white/60 text-xs">IQD</div>
                                    <div className="text-white font-mono overflow-hidden">
                                        {safeTotal.iqd?.toLocaleString(undefined, {minimumFractionDigits: 2}) || "0"}
                                    </div>
                                </div>
                                <div className="bg-white/5 rounded p-2">
                                    <div className="text-white/60 text-xs">USDT</div>
                                    <div className="text-white font-mono overflow-hidden">
                                        {safeTotal.usdt?.toLocaleString(undefined, {minimumFractionDigits: 2}) || "0.00"}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>


                {statusMessage && (
                    <div
                        className={`p-4 rounded-lg mb-6 flex items-center justify-between ${isSuccess
                                ? "bg-green-500/20 text-green-200 border border-green-500/30"
                                : "bg-red-500/20 text-red-200 border border-red-500/30"
                            }`}
                    >
                        <div className="flex items-center gap-3">
                            {isSuccess ? <CheckCircle size={20} /> : <AlertTriangle size={20} />}
                            <span>{statusMessage}</span>
                        </div>
                        <button
                            onClick={() => setStatusMessage(null)}
                            className="text-white/70 hover:text-white"
                            aria-label="Dismiss status message"
                        >
                            <X size={18} />
                        </button>
                    </div>
                )}

                

                <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl shadow-lg p-4 sm:p-6 md:p-0 overflow-hidden">
                    {renderedPartners}
                </div>
            </div>

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
        </div>
    );
};

export default SafePartners;