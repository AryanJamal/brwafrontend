import { useState, useEffect } from "react";
import { safeTypesApi } from "../services/apiService";
import { Plus, Edit, Trash2, X, Check, ChevronDown, CheckCircle, AlertTriangle } from "lucide-react"; // Added new icons

const SafeTypes = () => {
    const [safeTypes, setSafeTypes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [formData, setFormData] = useState({
        name: "",
        type: "Crypto",
    });
    const [isEditing, setIsEditing] = useState(false);
    const [currentId, setCurrentId] = useState(null);
    const [showForm, setShowForm] = useState(false);

    // Fetch all safe types
    useEffect(() => {
        const fetchSafeTypes = async () => {
            try {
                const response = await safeTypesApi.getAll();
                setSafeTypes(response.data);
                setLoading(false);
            } catch (err) {
                setError(err.message);
                setLoading(false);
            }
        };

        fetchSafeTypes();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (isEditing) {
                await safeTypesApi.update(currentId, formData);
                setSafeTypes(
                    safeTypes.map((type) =>
                        type.id === currentId ? { ...type, ...formData } : type
                    )
                );
            } else {
                const response = await safeTypesApi.create(formData);
                setSafeTypes([...safeTypes, response.data]);
            }
            resetForm();
        } catch (err) {
            setError(err.message);
        }
    };

    const handleEdit = (safeType) => {
        setFormData({
            name: safeType.name,
            type: safeType.type,
        });
        setIsEditing(true);
        setCurrentId(safeType.id);
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        try {
            await safeTypesApi.delete(id);
            setSafeTypes(safeTypes.filter((type) => type.id !== id));
        } catch (err) {
            setError(err.message);
        }
    };

    const resetForm = () => {
        setFormData({ name: "", type: "Crypto" });
        setIsEditing(false);
        setCurrentId(null);
        setShowForm(false);
    };

    if (loading) return (
        <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
    );

    if (error) return (
        <div className="bg-red-500/20 backdrop-blur-sm border border-red-500/30 rounded-xl p-4 text-red-200">
            Error: {error}
        </div>
    );

    return (
        <div className="p-4 min-h-screen bg-slate-50-900 ml-0 sm:mt-6 md:mt-0 xsm:mt-6">
        <div className="mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-white">جۆرەکانی قاسە</h1>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 text-white px-4 py-2 rounded-lg transition-all"
                >
                    <Plus size={18} />
                    {showForm ? "لابردن" : "زیادکردنی جۆر"}
                </button>
            </div>

            {/* Form Panel */}
            {showForm && (
                <div className="bg-slate-800/80 backdrop-blur-lg border border-white/20 rounded-xl shadow-lg p-6 mb-8 transition-all">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold text-white">
                            {isEditing ? "دەستکاری کردن" : "زیادکردن"}
                        </h2>
                        <button
                            onClick={resetForm}
                            className="text-white/70 hover:text-white"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4" >
                        <div>
                            <label className="block text-white/80 mb-2">ناو</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-white/80 mb-2">جۆر</label>
                            <div className="relative">
                            <select
                                name="type"
                                value={formData.type}
                                onChange={handleInputChange}
                                className="w-full bg-blue-900/45 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 appearance-none"
                                required
                            >
                                <option value="Crypto">Crypto - کریـپتۆ</option>
                                <option value="Physical">Physical - بەرجەستە</option>
                            </select>
                            <ChevronDown className="absolute left-3 top-3 text-white/50 pointer-events-none" size={18} />
                            </div>
                        </div>

                        <div className="flex gap-3 pt-2">
                            <button
                                type="submit"
                                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-all"
                            >
                                <Check size={18} />
                                {isEditing ? "تازە کردنەوە" : "دروست کردن"}
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

            {/* Safe Types Table */}
            <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl shadow-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="border-b border-white/20">
                            <tr>
                                <th className="px-6 py-3 text-right text-white/80 font-medium">ناو</th>
                                <th className="px-6 py-3 text-right text-white/80 font-medium">جۆر</th>
                                <th className="px-6 py-3 text-right text-white/80 font-medium">گۆڕانکاری</th>
                            </tr>
                        </thead>
                        <tbody>
                            {safeTypes.length === 0 ? (
                                <tr>
                                    <td colSpan="3" className="px-6 py-4 text-center text-white/60">
                                        هیچ جۆرێک بونی نییە!
                                    </td>
                                </tr>
                            ) : (
                                safeTypes.map((safeType) => (
                                    <tr key={safeType.id} className="bg-yellow-600/10 border-b border-white/10 hover:bg-black/15 transition ease-in-out">
                                        <td className="px-6 py-4 text-white">{safeType.name}</td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${safeType.type === "Crypto"
                                                    ? "bg-blue-500/60 text-white"
                                                    : "bg-red-500/60 text-white"
                                                }`}>
                                                {safeType.type}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-start gap-3">
                                                <button
                                                    onClick={() => handleEdit(safeType)}
                                                    className="text-white/70 hover:text-blue-400 transition-colors"
                                                    title="Edit"
                                                >
                                                    <Edit size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(safeType.id)}
                                                    className="text-white/70 hover:text-red-400 transition-colors"
                                                    title="Delete"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                    </div>
                </div></div>
        </div>
    );
};

export default SafeTypes;