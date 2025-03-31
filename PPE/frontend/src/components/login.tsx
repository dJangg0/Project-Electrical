import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../App.css";
type LoginProps = {
    onLogin: (userRole: "admin" | "user") => void;
};

const Login: React.FC<LoginProps> = ({ onLogin }) => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate(); // Hook for navigation

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (email === "admin" && password === "admin123") {
            onLogin("admin");
            navigate("/dashboard"); // Redirect to Admin Web UI
        } else if (email === "user" && password === "user123") {
            onLogin("user");
            navigate("/mobile-ui"); // Redirect to Mobile UI
        } else {
            alert("Invalid credentials");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-cente rounded-2xl p-2">
            <form onSubmit={handleSubmit} className="bg-white p-8 border-3 border-blue-400 rounded-lg w-96 space-y-6">
                <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Welcome Back</h2>

                <div className="space-y-2">
                    <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                        Username
                    </label>
                    <input
                        id="username"
                        type="text"
                        placeholder="Enter your username"
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ease-in-out text-gray-700 outline-none"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>

                <div className="space-y-2">
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                        Password
                    </label>
                    <input
                        id="password"
                        type="password"
                        placeholder="Enter your password"
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ease-in-out text-gray-700 outline-none"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>

                <button 
                    type="submit" 
                    className="w-1/2  text-white py-3 rounded-lg font-semibold focus:ring-4 focus:ring-blue-500 !important"
                >
                    Sign In
                </button>
                
            </form>
        </div>
    );
};

export default Login;
