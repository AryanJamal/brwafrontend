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
    Search,
} from "lucide-react";
import Select from "react-select";
import { safePartnersApi, safeTypesApi } from "../services/apiService";
import api from "../services/apiService";
import selectStyles from "../components/styles";
const defaultFormData = {
    partner_id: "",
    safe_type_id: "",
    total_usd: "",
    total_usdt: "",
    total_iqd: "",
};

const formatPartnerResponse = (rawPartner, safeTypesList) => {
    if (rawPartner.partner && rawPartner.safe_type) {
        return rawPartner;
    }
    const safeType = safeTypesList.find(
        (type) => type.id.toString() === rawPartner.safe_type_id
    );
    const partner = rawPartner.partner || {
        name: rawPartner.partner_name,
        phone_number: rawPartner.partner_phone_number,
    };
    return {
        ...rawPartner,
        partner,
        safe_type: safeType || {
            id: rawPartner.safe_type_id,
            name: "نەزانراو",
            type: "نەزانراو",
        },
    };
};

const SafePartners = () => {
    const [safePartners, setSafePartners] = useState([]);
    const [safeTypes, setSafeTypes] = useState([]);
    const [partners, setPartners] = useState([]); // New state for partners list
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [partnerToDeleteId, setPartnerToDeleteId] = useState(null);
    const [statusMessage, setStatusMessage] = useState(null);
    const [SafeModal, setSafeModal] = useState(null);
    const [isSuccess, setIsSuccess] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState(defaultFormData);
    const [searchQuery, setSearchQuery] = useState("");
    const [totals, setTotals] = useState({});

    const dismissStatus = useCallback(() => {
        setTimeout(() => {
            setStatusMessage(null);
        }, 5000);
    }, []);

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const [partnersResponse, typesResponse, allPartnersResponse] = await Promise.all([
                safePartnersApi.getAll(),
                safeTypesApi.getAll(),
                api.partners.getAll(), // Fetch all partners
            ]);
            const formattedPartners = partnersResponse.data.map((p) =>
                formatPartnerResponse(p, typesResponse.data)
            );
            setSafeTypes(typesResponse.data);
            setSafePartners(formattedPartners);
            setPartners(allPartnersResponse.data); // Set partners list
            setLoading(false);
        } catch (err) {
            console.error("Failed to fetch data:", err);
            setError(err.message);
            setLoading(false);
        }
    }, []);

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

    const handleCreateOrUpdate = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        const payload = {
            partner_id: formData.partner_id,
            safe_type_id: formData.safe_type_id,
            total_usd: parseFloat(formData.total_usd) || 0,
            total_usdt: parseFloat(formData.total_usdt) || 0,
            total_iqd: parseFloat(formData.total_iqd) || 0,
        };

        try {
            await safePartnersApi.create(payload);
            setStatusMessage("Partner created successfully.");
            fetchData();
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
    };

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
                    هیچ داتایەک نەدۆزرایەوە
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
                                    {partner.partner.phone_number || ""}
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
                                    لابردن
                                </>
                            ) : (
                                <>
                                    <Plus size={18} />
                                    زیادکردن
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {showForm && (
                    <div className="bg-slate-800/80 backdrop-blur-lg border border-white/20 rounded-xl shadow-lg p-6 mb-8 transition-all duration-300 transform scale-100 opacity-100">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold text-white">
                                {"زیادکردن"}
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
                                    {/* Partner Select */}
                                    <div>
                                        <label htmlFor="partner_id" className="block text-white/80 mb-2">
                                            خاوەن حساب
                                        </label>
                                        <Select
                                            id="partner_id"
                                            menuPortalTarget={document.body}   // 👈 attach to body
                                            menuPosition="fixed"
                                            name="partner_id"
                                            options={partners.map((partner) => ({
                                                value: partner.id,
                                                label: partner.name,
                                            }))}
                                            value={
                                                partners
                                                    .map((partner) => ({
                                                        value: partner.id,
                                                        label: partner.name,
                                                    }))
                                                    .find((opt) => opt.value === formData.partner_id) || null
                                            }
                                            onChange={(selected) =>
                                                setFormData((prev) => ({ ...prev, partner_id: selected?.value || "" }))
                                            }
                                            placeholder="خاوەنی حساب دیاری بکە"
                                            classNamePrefix="react-select"
                                            styles={selectStyles}
                                        />
                                    </div>

                                    {/* Safe Type Select */}
                                    <div>
                                        <label htmlFor="safe_type_id" className="block text-white/80 mb-2">
                                            جۆری قاسە
                                        </label>
                                        <Select
                                            id="safe_type_id"
                                            name="safe_type_id"
                                            menuPortalTarget={document.body}   // 👈 attach to body
                                            menuPosition="fixed"
                                            options={safeTypes.map((type) => ({
                                                value: type.id,
                                                label: `${type.name} (${type.type})`,
                                            }))}
                                            value={
                                                safeTypes
                                                    .map((type) => ({
                                                        value: type.id,
                                                        label: `${type.name} (${type.type})`,
                                                    }))
                                                    .find((opt) => opt.value === formData.safe_type_id) || null
                                            }
                                            onChange={(selected) =>
                                                setFormData((prev) => ({ ...prev, safe_type_id: selected?.value || "" }))
                                            }
                                            placeholder="جۆر دیاری بکە"
                                            classNamePrefix="react-select"
                                            styles={selectStyles}
                                        />
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
                                    {"زیادکردن"}
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

                <div className="relative items-right justify-right gap-2 backdrop-blur-sm text-white py-5 rounded-lg transition-all">

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
                <button
                            onClick={() => {
                                if (SafeModal) {
                                    setSafeModal(null);
                                } else {
                                    setSafeModal(true);
                                }
                            }}
                            className="w-full flex items-center justify-center gap-2 bg-gray-700/60 hover:bg-gray-700/80 backdrop-blur-sm border border-white/20 text-white px-4 py-2 rounded-lg transition-all"
                        >
                            {SafeModal ? (
                                <>
                                    <X size={18} />
                                    شاردنەوە
                                </>
                            ) : (
                                <>
                                    <Plus size={18} />
                                    بیشاندانی کۆی گشتی
                                </>
                            )}
                        </button>

                {SafeModal && (
                    <div className="grid grid-cols-1 md:grid-cols-2 py-4 lg:grid-cols-3 gap-4 transition-all duration-300 transform scale-100 opacity-100">
                    {Object.entries(totals).map(([safeTypeName, safeTotal]) => (
                        <div
                            key={safeTypeName}
                            className="bg-gray-800/80 backdrop-blur-sm border border-white/10 rounded-lg p-4 text-center"
                        >
                            <h3 className="text-xl font-bold text-white mb-2">
                                کۆی گشتی {safeTypeName}
                            </h3>
                            <div className="grid grid-cols-1 gap-2">
                                <div className="bg-white/5 rounded p-2">
                                    <div className="text-white/60 text-xs">USD</div>
                                    <div className="text-white font-mono">
                                        {safeTotal.usd?.toLocaleString(undefined, { minimumFractionDigits: 2 }) || "0.00"}
                                    </div>
                                </div>
                                <div className="bg-white/5 rounded p-2">
                                    <div className="text-white/60 text-xs">IQD</div>
                                    <div className="text-white font-mono overflow-hidden">
                                        {safeTotal.iqd?.toLocaleString(undefined, { minimumFractionDigits: 2 }) || "0"}
                                    </div>
                                </div>
                                <div className="bg-white/5 rounded p-2">
                                    <div className="text-white/60 text-xs">USDT</div>
                                    <div className="text-white font-mono overflow-hidden">
                                        {safeTotal.usdt?.toLocaleString(undefined, { minimumFractionDigits: 2 }) || "0.00"}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                )};

                

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