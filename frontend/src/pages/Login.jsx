import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, Activity, ShieldCheck, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';
import authService from '../services/authService';

const Login = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const [apiSuccess, setApiSuccess] = useState(location.state?.successMessage || '');

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear field-specific validation error on typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }

    if (apiError) setApiError('');
  };

  // Client-side form validation
  const validate = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required.';
    } else if (!emailRegex.test(formData.email.trim())) {
      newErrors.email = 'Please enter a valid email address.';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');
    setApiSuccess('');

    if (!validate()) {
      return;
    }

    setIsLoading(true);

    try {
      await authService.login({
        email: formData.email.trim(),
        password: formData.password,
      });

      setApiSuccess('Login successful!');
      navigate('/dashboard', { replace: true });
    } catch (err) {
      const message = authService.handleError(err);
      setApiError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      {/* Left Branding & Highlights Panel */}
      <div className="auth-banner">
        <div className="banner-header">
          <div className="banner-brand">
            <div className="brand-icon-box">
              <Activity size={26} strokeWidth={2.5} />
            </div>
            <span className="brand-name">Medi<span>Stock</span></span>
          </div>
        </div>

        <div className="banner-content">
          <div className="banner-pill">
            <ShieldCheck size={16} />
            Healthcare Inventory Portal
          </div>
          <h1 className="banner-heading">
            Precision Management for Pharmacy & Medical Supplies.
          </h1>
          <p className="banner-description">
            Sign in to securely access clinical stock levels, track pharmaceutical shipments, and streamline inventory operations.
          </p>

          <div className="banner-features">
            <div className="feature-item">
              <div className="feature-icon-wrapper">
                <ShieldCheck size={16} />
              </div>
              <div className="feature-text">
                <h4>Role-Based Access</h4>
                <p>Protected operations tailored for Administrators, Pharmacists, and Staff.</p>
              </div>
            </div>

            <div className="feature-item">
              <div className="feature-icon-wrapper">
                <Activity size={16} />
              </div>
              <div className="feature-text">
                <h4>Real-Time Sync</h4>
                <p>Centralized ledger for all medicinal batches, stock orders, and logs.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="banner-footer">
          <span>&copy; {new Date().getFullYear()} MediStock System</span>
          <span>Enterprise Healthcare Edition</span>
        </div>
      </div>

      {/* Right Login Form Section */}
      <div className="auth-form-section">
        <div className="auth-card">
          {/* Mobile Header Branding */}
          <div className="mobile-brand">
            <div className="mobile-brand-icon">
              <Activity size={20} strokeWidth={2.5} />
            </div>
            <span className="mobile-brand-name">Medi<span>Stock</span></span>
          </div>

          <div className="form-header">
            <h2 className="form-title">Welcome Back</h2>
            <p className="form-subtitle">Enter your credentials to access your account</p>
          </div>

          {/* Success Banner */}
          {apiSuccess && (
            <div className="alert alert-success" role="alert">
              <CheckCircle2 size={18} className="alert-icon" />
              <div>{apiSuccess}</div>
            </div>
          )}

          {/* Error Banner */}
          {apiError && (
            <div className="alert alert-error" role="alert">
              <AlertCircle size={18} className="alert-icon" />
              <div>{apiError}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            {/* Email Field */}
            <div className="form-group">
              <label htmlFor="login-email" className="form-label">
                Email Address
              </label>
              <div className="input-container">
                <span className="input-icon-left">
                  <Mail size={18} />
                </span>
                <input
                  id="login-email"
                  type="email"
                  name="email"
                  className={`input-field ${errors.email ? 'input-error' : ''}`}
                  placeholder="name@hospital.com"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={isLoading}
                  autoComplete="email"
                />
              </div>
              {errors.email && (
                <div className="error-message">
                  <AlertCircle size={14} />
                  <span>{errors.email}</span>
                </div>
              )}
            </div>

            {/* Password Field */}
            <div className="form-group">
              <label htmlFor="login-password" className="form-label">
                Password
              </label>
              <div className="input-container">
                <span className="input-icon-left">
                  <Lock size={18} />
                </span>
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  className={`input-field ${errors.password ? 'input-error' : ''}`}
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  disabled={isLoading}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="input-icon-btn"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && (
                <div className="error-message">
                  <AlertCircle size={14} />
                  <span>{errors.password}</span>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="btn-primary"
              id="login-submit-btn"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <div className="spinner spinner-sm"></div>
                  <span>Signing In...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <div className="form-footer">
            Don't have an account?{' '}
            <Link to="/register" className="auth-link">
              Create an account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
