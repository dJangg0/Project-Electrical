import { useState } from "react";
import { useNavigate } from "react-router-dom";

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
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <form onSubmit={handleSubmit} className="bg-white p-6 shadow-md rounded-lg w-80">
                <h2 className="text-xl font-bold mb-4 text-center">Login</h2>

                <input
                    type="text"
                    placeholder="Username"
                    className="border p-2 w-full mb-3 rounded"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />

                <input
                    type="password"
                    placeholder="Password"
                    className="border p-2 w-full mb-3 rounded"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />

                <button type="submit" className="bg-blue-500 text-white p-2 rounded w-full hover:bg-blue-600">
                    Login
                </button>
            </form>
        </div>
    );
};

export default Login;
