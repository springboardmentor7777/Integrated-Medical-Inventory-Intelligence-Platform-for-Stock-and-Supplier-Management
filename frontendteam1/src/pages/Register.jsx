import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerUser } from "../services/authService";
import "../styles/Register.css";

function Register() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("Staff");

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();

    setMessage("");
    setError("");

    try {
      await registerUser({
        name,
        email,
        password,
        role,
      });

      setMessage("Registration successful! You can now login.");

      setTimeout(() => {
        navigate("/login");
      }, 1500);

    } catch (error) {
      console.error(error);

      setError(
        error.response?.data?.message ||
          "Registration failed. Please try again."
      );
    }
  };

  return (
    <div className="register-page">
      <div className="register-card">

        <div className="logo-circle">M</div>

        <h1>Create Account</h1>
        <p className="subtitle">Join MediStock today</p>

        <form onSubmit={handleSubmit}>

          <div className="form-group">
            <label>Full Name</label>
            <input
              type="text"
              placeholder="Enter your full name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
            />
          </div>

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
              placeholder="Create a password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Role</label>

            <select
              value={role}
              onChange={(event) => setRole(event.target.value)}
            >
              <option value="Admin">Admin</option>
              <option value="Pharmacist">Pharmacist</option>
              <option value="Staff">Staff</option>
            </select>
          </div>

          {message && (
            <p className="success-message">{message}</p>
          )}

          {error && (
            <p className="error-message">{error}</p>
          )}

          <button type="submit" className="primary-button">
            Create Account
          </button>

        </form>

        <p className="account-text">
          Already have an account?{" "}
          <Link to="/login">Login here</Link>
        </p>

      </div>
    </div>
  );
}

export default Register;