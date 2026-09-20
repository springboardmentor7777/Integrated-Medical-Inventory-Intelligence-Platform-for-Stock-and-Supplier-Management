import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../services/authService";
import { useAuth } from "../context/AuthContext";
import "../styles/Login.css";

function AdminLogin() {
    const navigate = useNavigate();
    const { login } = useAuth();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError("");
        setLoading(true);

        try {
            const response = await loginUser({
                email,
                password,
            });

            if (response.role?.toUpperCase() !== "ADMIN") {
                setError("Access denied. Admin account required.");
                return;
            }

            login(response);
            navigate("/admin-dashboard");
        } catch (error) {
            console.error(error);

            setError(
                error.response?.data?.message ||
                "Admin login failed. Please check your email and password."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page admin-login-page">

            {/* Floating admin/medical icons */}
            <div className="floating-icon icon-one">👑</div>
            <div className="floating-icon icon-two">🏥</div>
            <div className="floating-icon icon-three">📊</div>
            <div className="floating-icon icon-four">🔐</div>

            <div className="login-card">

                <div className="logo-circle">👑</div>

                <div className="brand-badge">
                    MEDISTOCK ADMIN PORTAL
                </div>

                <h1>MediStock Admin</h1>

                <p className="subtitle">
                    Secure administration & system management
                </p>

                <div className="security-message">
                    🔐 Restricted access — Administrators only
                </div>

                <form onSubmit={handleSubmit}>

                    <div className="form-group">
                        <label>Admin Email</label>

                        <input
                            type="email"
                            placeholder="Enter admin email"
                            value={email}
                            onChange={(event) => setEmail(event.target.value)}
                            required
                            disabled={loading}
                        />
                    </div>

                    <div className="form-group">
                        <label>Password</label>

                        <div className="password-wrapper">

                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder="Enter admin password"
                                value={password}
                                onChange={(event) => setPassword(event.target.value)}
                                required
                                disabled={loading}
                            />

                            <button
                                type="button"
                                className="password-toggle"
                                onClick={() => setShowPassword(!showPassword)}
                                disabled={loading}
                                aria-label={
                                    showPassword
                                        ? "Hide password"
                                        : "Show password"
                                }
                            >
                                {showPassword ? "🙈" : "👁️"}
                            </button>

                        </div>
                    </div>

                    {error && (
                        <p className="error-message">
                            ⚠️ {error}
                        </p>
                    )}

                    <button
                        type="submit"
                        className="primary-button"
                        disabled={loading}
                    >
                        {loading ? (
                            <span className="button-loading">
                <span className="loading-spinner"></span>
                Verifying admin...
              </span>
                        ) : (
                            "Admin Login"
                        )}
                    </button>

                </form>

                <div className="login-divider">
                    <span>SECURE PORTAL</span>
                </div>

                <button
                    type="button"
                    className="admin-login-link"
                    onClick={() => navigate("/login")}
                >
                    ← Back to User Login
                </button>

                <p className="login-footer">
                    MediStock • Authorized Administrator Access
                </p>

            </div>
        </div>
    );
}

export default AdminLogin;