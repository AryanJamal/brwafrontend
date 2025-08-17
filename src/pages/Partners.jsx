import { useState, useEffect } from 'react';
import { Plus, CheckCircle, AlertTriangle, Trash2, X, Check, User, Phone, Building, UserCheck } from 'lucide-react';
import { api } from '../services/apiService';

const Partners = () => {
    // State variables for managing partners, loading, and errors
    const [partners, setPartners] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // State for the delete confirmation modal
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [partnerToDeleteId, setPartnerToDeleteId] = useState(null);

    // State for the add partner form
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        phone_number: null,
        is_system_owner: false,
        is_office: false,
        is_person: false
    });

    // Fetch all partners on component load
    useEffect(() => {
        const fetchPartners = async () => {
            try {
                const response = await api.partners.getAll();
                setPartners(response.data);
                setLoading(false);
            } catch (err) {
                setError(err.message);
                setLoading(false);
            }
        };

        fetchPartners();
    }, []);

    // Handle input changes for the form
    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    // Handle form submission to create a new partner
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await api.partners.create(formData);
            setPartners([...partners, res.data]);
            resetForm();
        } catch (err) {
            setError(err.message);
        }
    };

    // Prepare to show the delete confirmation modal
    const handleDelete = (id) => {
        setPartnerToDeleteId(id);
        setShowConfirmModal(true);
    };

    // Confirm and execute the partner deletion
    const confirmDelete = async () => {
        try {
            await api.partners.delete(partnerToDeleteId);
            setPartners(
                partners.filter((partner) => partner.id !== partnerToDeleteId)
            );
        } catch (err) {
            console.error("Deletion error:", err);
            // Optionally, set an error state to display to the user
        } finally {
            // Ensure the modal closes and state is reset regardless of success or failure
            setShowConfirmModal(false);
            setPartnerToDeleteId(null);
        }
    };

    // Reset the form and hide it
    const resetForm = () => {
        setFormData({
            name: '',
            phone_number: '',
            is_system_owner: false,
            is_office: false,
            is_person: false
        });
        setShowForm(false);
    };

    // Helper function to get the partner's type label
    const getPartnerType = (partner) => {
        if (partner.is_system_owner) return 'خاوەن حساب';
        if (partner.is_office) return 'نوسینـگە';
        if (partner.is_person) return 'ئامانەت';
        return 'دیاری نەکراو';
    };

    // Helper function to get the partner's type icon
    const getPartnerIcon = (partner) => {
        if (partner.is_system_owner) return <UserCheck size={20} className="text-purple-400" />;
        if (partner.is_office) return <Building size={20} className="text-blue-400" />;
        if (partner.is_person) return <User size={20} className="text-green-400" />;
        return <User size={20} className="text-white/40" />;
    };

    if (loading) return (
        <div className="ml-0 md:ml-64 p-4 md:p-8 min-h-screen flex justify-center items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
        </div>
    );

    if (error) return (
        <div className="p-4 min-h-screen text-white">
            <div className="mx-auto max-w-7xl">
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold">کڕین و فرۆشتنی کریپتۆ</h1>
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
                    <h1 className="text-2xl font-bold text-white">ئاکاونتی شەریکەکان</h1>
                    <button
                        onClick={() => setShowForm(!showForm)}
                        className="flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 text-white px-4 py-2 rounded-lg transition-all"
                    >
                        <Plus size={18} />
                        {showForm ? "لابردن" : "زیادکردن"}
                    </button>
                </div>

                {/* Form Panel */}
                {showForm && (
                    <div className="bg-slate-800/80 backdrop-blur-lg border border-white/20 rounded-xl shadow-lg p-6 mb-8 transition-all">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold text-white">
                                {"دروستکردنی ئاکاونت"}
                            </h2>
                            <button onClick={resetForm} className="text-white/70 hover:text-white">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Name */}
                            <div>
                                <label className="block text-white/80 mb-2">ناو</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                                    required
                                />
                            </div>

                            {/* Phone Number */}
                            <div>
                                <label className="block text-white/80 mb-2">ژمارەی مۆبایل</label>
                                <input
                                    type="tel"
                                    name="phone_number"
                                    value={formData.phone_number}
                                    onChange={handleInputChange}
                                    className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                                />
                            </div>

                            {/* Partner Type Checkboxes */}
                            <div className="space-y-3">
                                <label className="block text-white/80 mb-2">تایبەتمەندی :</label>

                                <div className="flex items-center gap-3">
                                    <input
                                        type="checkbox"
                                        id="is_office"
                                        name="is_office"
                                        checked={formData.is_office}
                                        onChange={handleInputChange}
                                        className="h-4 w-4 rounded border-white/20 bg-white/5 text-purple-600 focus:ring-purple-500/50"
                                    />
                                    <label htmlFor="is_office" className="flex items-center gap-2 text-white/80">
                                        <Building size={16} /> نوسینـگە
                                    </label>
                                </div>

                                <div className="flex items-center gap-3">
                                    <input
                                        type="checkbox"
                                        id="is_person"
                                        name="is_person"
                                        checked={formData.is_person}
                                        onChange={handleInputChange}
                                        className="h-4 w-4 rounded border-white/20 bg-white/5 text-purple-600 focus:ring-purple-500/50"
                                    />
                                    <label htmlFor="is_person" className="flex items-center gap-2 text-white/80">
                                        <User size={16} /> ئامانەت
                                    </label>
                                </div>
                            </div>

                            {/* Form Actions */}
                            <div className="flex gap-3 pt-4">
                                <button
                                    type="submit"
                                    className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-all"
                                >
                                    <Check size={18} />
                                    {"دروستکردن"}
                                </button>

                                <button
                                    type="button"
                                    onClick={resetForm}
                                    className="flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white px-4 py-2 rounded-lg transition-all"
                                >
                                    <X size={18} />
                                    هەڵوەشاندنەوە
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Partners List as Cards */}
                <div className="space-y-4">
                    {partners.length === 0 ? (
                        <div className="bg-slate-800/80 backdrop-blur-lg border border-white/20 rounded-xl p-6 text-center text-white/60">
                            هیچ ئاکاونتێک نەدۆزرایەوە
                        </div>
                    ) : (
                        partners.map((partner) => (
                            <div key={partner.id} className="bg-slate-800/80 backdrop-blur-lg border border-white/20 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
                                <div className="flex justify-between items-center mb-4">
                                    <div className="flex items-center gap-2 text-lg font-bold text-white">
                                        {getPartnerIcon(partner)}
                                        <span>{partner.name}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm">
                                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${partner.is_system_owner ? 'bg-purple-500/20 text-purple-300' :
                                            partner.is_office ? 'bg-blue-500/20 text-blue-300' :
                                                partner.is_person ? 'bg-green-500/20 text-green-300' :
                                                    'bg-gray-500/20 text-gray-300'
                                            }`}>
                                            {getPartnerType(partner)}
                                        </span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="flex items-center gap-2">
                                        <Phone size={20} className="text-yellow-400" />
                                        <div className="text-sm">
                                            <p className="font-medium text-white/80">ژمارەی مۆبایل</p>
                                            <p className="text-white">{partner.phone_number || 'N/A'}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-white/10">

                                    <button
                                        onClick={() => handleDelete(partner.id)}
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

export default Partners;
