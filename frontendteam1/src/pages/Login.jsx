import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginUser } from "../services/authService";
import { useAuth } from "../context/AuthContext";
import "../styles/Login.css";

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    try {
      const response = await loginUser({
        email,
        password,
      });

      login(response);
      navigate("/dashboard");
    } catch (error) {
      console.error(error);

      setError(
        error.response?.data?.message ||
          "Login failed. Please check your email and password."
      );
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">

        <div className="logo-circle">M</div>

        <h1>MediStock</h1>
        <p className="subtitle">Welcome back! Please login to continue.</p>

        <form onSubmit={handleSubmit}>

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </div>

          {error && <p className="error-message">{error}</p>}

          <button type="submit" className="primary-button">
            Login
          </button>

        </form>

        <p className="account-text">
          Don't have an account?{" "}
          <Link to="/register">Register here</Link>
        </p>

      </div>
    </div>
  );
}

export default Login;