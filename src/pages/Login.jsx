// src/pages/Login.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/apiService"; // you already export `api`


const Login = ({ setAuth }) => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();


    // Function to handle login form submission
    const handleLogin = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            // Replaced the original api.token.post with our mock function
            const res = await api.token.post({username, password});

            // Save tokens in localStorage
            localStorage.setItem("access", res.data.access);
            localStorage.setItem("refresh", res.data.refresh);

            // Update auth state
            setAuth(true);

            // Redirect to home
            navigate("/");
        } catch (err) {
            console.error("Login failed:", err);
            // Set the error message to display in the modal
            setError("Invalid username or password. Please try again.");
            
        } finally {
            setIsLoading(false);
        }
    };

    // Function to close the error modal
    const handleCloseModal = () => {
        setError(null);
        setUsername("");
        setPassword("");
    };

    return (
        <div className="flex items-center justify-center min-h-screen p-4 md:p-8 bg-slate-800 font-sans">
            <div className="relative w-full max-w-sm mx-auto overflow-hidden bg-white/10 rounded-3xl backdrop-blur-md shadow-xl border border-white/20 p-6 sm:p-8">
                {/* Decorative background shapes for the glassmorphism effect */}
                <div className="absolute top-0 left-0 w-48 h-48 -mt-24 -ml-24 rounded-full bg-blue-700/50 blur-xl"></div>
                <div className="absolute bottom-0 right-0 w-64 h-64 -mb-32 -mr-32 rounded-full bg-blue-700/50 blur-xl"></div>

                {/* Login Form */}
                <form onSubmit={handleLogin} className="relative z-10 space-y-5">
                    <h2 className="text-3xl font-extrabold text-white text-center drop-shadow-lg">
                        نوسینگەی بڕوا
                    </h2>

                    <div className="space-y-4">
                        <input
                            type="text"
                            placeholder="ناو"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            disabled={isLoading}
                            className="w-full px-5 py-3 text-sm text-white bg-black/20 rounded-xl placeholder:text-white/60 focus:ring-2 focus:ring-blue-400 focus:outline-none transition duration-300 disabled:opacity-50"
                        />
                        <input
                            type="password"
                            placeholder="پاسووۆڕد"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            disabled={isLoading}
                            className="w-full px-5 py-3 text-sm text-white bg-black/20 rounded-xl placeholder:text-white/60 focus:ring-2 focus:ring-blue-400 focus:outline-none transition duration-300 disabled:opacity-50"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-3 text-lg font-bold text-white bg-blue-700 rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-slate-800 disabled:opacity-50 disabled:transform-none disabled:cursor-not-allowed"
                    >
                        {isLoading ? "چاوەڕوانبـە" : "چونەژوورەوە"}
                    </button>
                </form>
            </div>

            {/* Glassmorphism Error Modal */}
            {error && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
                    <div className="relative w-full max-w-xs mx-auto overflow-hidden bg-white/10 rounded-3xl backdrop-blur-md shadow-2xl border border-white/20 p-6 text-center">
                        <h3 className="text-xl font-bold text-red-600 mb-2 drop-shadow-md">
                            هەڵەیـە
                        </h3>
                        <p className="text-sm text-white mb-4 drop-shadow-sm">زانیاریەکانت هەڵەیە دوبارە هەوڵ بدەرەوە!</p>
                        <button
                            onClick={handleCloseModal}
                            className="px-6 py-2 text-white bg-red-600 rounded-lg shadow-md transition-all duration-300 hover:bg-red-700"
                        >
                            دووبارە
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Login;
