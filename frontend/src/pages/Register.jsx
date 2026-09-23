import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Shield, Eye, EyeOff, Activity, ShieldCheck, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';
import authService from '../services/authService';

const ROLES = [
  { value: 'ADMIN', label: 'Administrator (Full Access)' },
  { value: 'PHARMACIST', label: 'Pharmacist (Dispensary & Orders)' },
  { value: 'STAFF', label: 'Staff (Inventory & Checkouts)' },
];

const Register = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: '',
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  // Handle field change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear specific field validation error
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

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required.';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required.';
    } else if (!emailRegex.test(formData.email.trim())) {
      newErrors.email = 'Please enter a valid email address.';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required.';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters.';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Confirm Password is required.';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match.';
    }

    if (!formData.role) {
      newErrors.role = 'Please select a role.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');

    if (!validate()) {
      return;
    }

    setIsLoading(true);

    try {
      await authService.register({
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
        role: formData.role,
      });

      // On successful registration, navigate to login page with success notification
      navigate('/login', {
        state: {
          successMessage: 'Registration successful! Please sign in with your new credentials.',
        },
      });
    } catch (err) {
      const message = authService.handleError(err);
      setApiError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid min-h-screen w-full grid-cols-1 bg-slate-50 lg:grid-cols-[1fr_1.15fr]">
      {/* Left Showcase Banner */}
      <div className="relative hidden min-h-screen flex-col justify-between overflow-hidden bg-gradient-to-br from-slate-950 via-sky-950 to-sky-900 px-10 py-14 text-white lg:flex">
        <div className="relative z-10">
          <div className="inline-flex items-center gap-3 no-underline">
            <div className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-sky-500 to-teal-500 text-white shadow-lg">
              <Activity size={26} strokeWidth={2.5} />
            </div>
            <span className="text-2xl font-extrabold tracking-tight text-white">Medi<span>Stock</span></span>
          </div>
        </div>

        <div className="relative z-10 my-12">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-semibold text-sky-300 backdrop-blur">
            <ShieldCheck size={16} />
            Account Setup
          </div>
          <h1 className="mb-4 max-w-xl text-4xl font-extrabold leading-tight tracking-tight text-white">
            Join the Next Generation Healthcare Management Suite.
          </h1>
          <p className="mb-8 max-w-xl text-base leading-relaxed text-slate-300">
            Register your verified staff credentials to start managing pharmaceuticals, medical batch registries, and supply lines.
          </p>

          <div className="flex flex-col gap-4">
            <div className="flex items-start gap-3.5">
              <div className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full bg-sky-400/15 text-sky-300">
                <ShieldCheck size={16} />
              </div>
              <div className="[&_h4]:text-[15px] [&_h4]:font-semibold [&_h4]:text-slate-100 [&_p]:mt-0.5 [&_p]:text-sm [&_p]:text-slate-400">
                <h4>Verified Roles</h4>
                <p>Granular access control tailored to hospital administrators, pharmacists, and support staff.</p>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <div className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full bg-sky-400/15 text-sky-300">
                <Activity size={16} />
              </div>
              <div className="[&_h4]:text-[15px] [&_h4]:font-semibold [&_h4]:text-slate-100 [&_p]:mt-0.5 [&_p]:text-sm [&_p]:text-slate-400">
                <h4>Audited Workflows</h4>
                <p>Enterprise audit trails and compliant record-keeping for regulated medication.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 flex items-center justify-between border-t border-white/10 pt-6 text-xs text-slate-500">
          <span>&copy; {new Date().getFullYear()} MediStock System</span>
          <span>Enterprise Healthcare Edition</span>
        </div>
      </div>

      {/* Right Registration Form Section */}
      <div className="relative flex items-center justify-center bg-slate-50 px-5 py-10 md:px-8">
        <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-7 shadow-2xl sm:p-9">
          {/* Mobile Header Branding */}
          <div className="mb-7 inline-flex items-center gap-2.5 no-underline lg:hidden">
            <div className="grid h-9 w-9 place-items-center rounded-lg bg-gradient-to-br from-sky-500 to-teal-500 text-white">
              <Activity size={20} strokeWidth={2.5} />
            </div>
            <span className="text-xl font-extrabold text-slate-900 [&_span]:text-sky-600">Medi<span>Stock</span></span>
          </div>

          <div className="mb-7">
            <h2 className="mb-1 text-2xl font-bold tracking-tight text-slate-900">Create Account</h2>
            <p className="text-sm text-slate-500">Register your MediStock credentials</p>
          </div>

          {/* Error Banner */}
          {apiError && (
            <div className="mb-5 flex items-start gap-3 rounded-lg px-4 py-3 text-sm leading-relaxed border border-red-200 bg-red-50 text-red-800" role="mb-5 flex items-start gap-3 rounded-lg px-4 py-3 text-sm leading-relaxed">
              <AlertCircle size={18} className="mt-0.5 shrink-0" />
              <div>{apiError}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            {/* Full Name Field */}
            <div className="mb-5 flex flex-col [&_label]:mb-2 [&_label]:text-sm [&_label]:font-semibold [&_label]:text-slate-800 [&_input]:w-full [&_input]:box-border [&_input]:rounded-lg [&_input]:border [&_input]:border-slate-300 [&_input]:bg-white [&_input]:px-3.5 [&_input]:py-3 [&_input]:text-sm [&_input]:text-slate-800 [&_input]:outline-none [&_input]:focus:border-blue-600 [&_input]:focus:ring-2 [&_input]:focus:ring-blue-100 [&_select]:w-full [&_select]:box-border [&_select]:rounded-lg [&_select]:border [&_select]:border-slate-300 [&_select]:bg-white [&_select]:px-3.5 [&_select]:py-3 [&_select]:text-sm [&_select]:text-slate-800 [&_select]:outline-none [&_select]:focus:border-blue-600 [&_select]:focus:ring-2 [&_select]:focus:ring-blue-100 [&_textarea]:w-full [&_textarea]:box-border [&_textarea]:rounded-lg [&_textarea]:border [&_textarea]:border-slate-300 [&_textarea]:bg-white [&_textarea]:px-3.5 [&_textarea]:py-3 [&_textarea]:text-sm [&_textarea]:text-slate-800 [&_textarea]:outline-none [&_textarea]:focus:border-blue-600 [&_textarea]:focus:ring-2 [&_textarea]:focus:ring-blue-100">
              <label htmlFor="register-name" className="mb-1.5 block text-sm font-semibold text-slate-700">
                Full Name
              </label>
              <div className="relative flex items-center">
                <span className="pointer-events-none absolute left-3.5 flex items-center justify-center text-slate-400">
                  <User size={18} />
                </span>
                <input
                  id="register-name"
                  type="text"
                  name="name"
                  className={`h-12 w-full rounded-lg border border-slate-300 bg-slate-50 px-4 pl-11 text-sm text-slate-900 outline-none transition hover:bg-white focus:border-sky-600 focus:bg-white focus:ring-2 focus:ring-sky-100 disabled:cursor-not-allowed disabled:opacity-60 ${errors.name ? 'border-red-500 bg-red-50 focus:border-red-500 focus:ring-red-100' : ''}`}
                  placeholder="Dr. Jane Doe"
                  value={formData.name}
                  onChange={handleChange}
                  disabled={isLoading}
                  autoComplete="name"
                />
              </div>
              {errors.name && (
                <div className="mt-1 flex items-center gap-1.5 text-xs font-medium text-red-600">
                  <AlertCircle size={14} />
                  <span>{errors.name}</span>
                </div>
              )}
            </div>

            {/* Email Field */}
            <div className="mb-5 flex flex-col [&_label]:mb-2 [&_label]:text-sm [&_label]:font-semibold [&_label]:text-slate-800 [&_input]:w-full [&_input]:box-border [&_input]:rounded-lg [&_input]:border [&_input]:border-slate-300 [&_input]:bg-white [&_input]:px-3.5 [&_input]:py-3 [&_input]:text-sm [&_input]:text-slate-800 [&_input]:outline-none [&_input]:focus:border-blue-600 [&_input]:focus:ring-2 [&_input]:focus:ring-blue-100 [&_select]:w-full [&_select]:box-border [&_select]:rounded-lg [&_select]:border [&_select]:border-slate-300 [&_select]:bg-white [&_select]:px-3.5 [&_select]:py-3 [&_select]:text-sm [&_select]:text-slate-800 [&_select]:outline-none [&_select]:focus:border-blue-600 [&_select]:focus:ring-2 [&_select]:focus:ring-blue-100 [&_textarea]:w-full [&_textarea]:box-border [&_textarea]:rounded-lg [&_textarea]:border [&_textarea]:border-slate-300 [&_textarea]:bg-white [&_textarea]:px-3.5 [&_textarea]:py-3 [&_textarea]:text-sm [&_textarea]:text-slate-800 [&_textarea]:outline-none [&_textarea]:focus:border-blue-600 [&_textarea]:focus:ring-2 [&_textarea]:focus:ring-blue-100">
              <label htmlFor="register-email" className="mb-1.5 block text-sm font-semibold text-slate-700">
                Work Email Address
              </label>
              <div className="relative flex items-center">
                <span className="pointer-events-none absolute left-3.5 flex items-center justify-center text-slate-400">
                  <Mail size={18} />
                </span>
                <input
                  id="register-email"
                  type="email"
                  name="email"
                  className={`h-12 w-full rounded-lg border border-slate-300 bg-slate-50 px-4 pl-11 text-sm text-slate-900 outline-none transition hover:bg-white focus:border-sky-600 focus:bg-white focus:ring-2 focus:ring-sky-100 disabled:cursor-not-allowed disabled:opacity-60 ${errors.email ? 'border-red-500 bg-red-50 focus:border-red-500 focus:ring-red-100' : ''}`}
                  placeholder="jane.doe@hospital.com"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={isLoading}
                  autoComplete="email"
                />
              </div>
              {errors.email && (
                <div className="mt-1 flex items-center gap-1.5 text-xs font-medium text-red-600">
                  <AlertCircle size={14} />
                  <span>{errors.email}</span>
                </div>
              )}
            </div>

            {/* Role Selection Field */}
            <div className="mb-5 flex flex-col [&_label]:mb-2 [&_label]:text-sm [&_label]:font-semibold [&_label]:text-slate-800 [&_input]:w-full [&_input]:box-border [&_input]:rounded-lg [&_input]:border [&_input]:border-slate-300 [&_input]:bg-white [&_input]:px-3.5 [&_input]:py-3 [&_input]:text-sm [&_input]:text-slate-800 [&_input]:outline-none [&_input]:focus:border-blue-600 [&_input]:focus:ring-2 [&_input]:focus:ring-blue-100 [&_select]:w-full [&_select]:box-border [&_select]:rounded-lg [&_select]:border [&_select]:border-slate-300 [&_select]:bg-white [&_select]:px-3.5 [&_select]:py-3 [&_select]:text-sm [&_select]:text-slate-800 [&_select]:outline-none [&_select]:focus:border-blue-600 [&_select]:focus:ring-2 [&_select]:focus:ring-blue-100 [&_textarea]:w-full [&_textarea]:box-border [&_textarea]:rounded-lg [&_textarea]:border [&_textarea]:border-slate-300 [&_textarea]:bg-white [&_textarea]:px-3.5 [&_textarea]:py-3 [&_textarea]:text-sm [&_textarea]:text-slate-800 [&_textarea]:outline-none [&_textarea]:focus:border-blue-600 [&_textarea]:focus:ring-2 [&_textarea]:focus:ring-blue-100">
              <label htmlFor="register-role" className="mb-1.5 block text-sm font-semibold text-slate-700">
                Assigned System Role
              </label>
              <div className="relative flex items-center">
                <span className="pointer-events-none absolute left-3.5 flex items-center justify-center text-slate-400">
                  <Shield size={18} />
                </span>
                <select
                  id="register-role"
                  name="role"
                  className={`h-12 w-full rounded-lg border border-slate-300 bg-slate-50 px-4 pl-11 text-sm text-slate-900 outline-none transition hover:bg-white focus:border-sky-600 focus:bg-white focus:ring-2 focus:ring-sky-100 disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer appearance-none pr-10 ${errors.role ? 'border-red-500 bg-red-50 focus:border-red-500 focus:ring-red-100' : ''}`}
                  value={formData.role}
                  onChange={handleChange}
                  disabled={isLoading}
                >
                  <option value="">Select your assigned role...</option>
                  {ROLES.map((r) => (
                    <option key={r.value} value={r.value}>
                      {r.label}
                    </option>
                  ))}
                </select>
              </div>
              {errors.role && (
                <div className="mt-1 flex items-center gap-1.5 text-xs font-medium text-red-600">
                  <AlertCircle size={14} />
                  <span>{errors.role}</span>
                </div>
              )}
            </div>

            {/* Password Field */}
            <div className="mb-5 flex flex-col [&_label]:mb-2 [&_label]:text-sm [&_label]:font-semibold [&_label]:text-slate-800 [&_input]:w-full [&_input]:box-border [&_input]:rounded-lg [&_input]:border [&_input]:border-slate-300 [&_input]:bg-white [&_input]:px-3.5 [&_input]:py-3 [&_input]:text-sm [&_input]:text-slate-800 [&_input]:outline-none [&_input]:focus:border-blue-600 [&_input]:focus:ring-2 [&_input]:focus:ring-blue-100 [&_select]:w-full [&_select]:box-border [&_select]:rounded-lg [&_select]:border [&_select]:border-slate-300 [&_select]:bg-white [&_select]:px-3.5 [&_select]:py-3 [&_select]:text-sm [&_select]:text-slate-800 [&_select]:outline-none [&_select]:focus:border-blue-600 [&_select]:focus:ring-2 [&_select]:focus:ring-blue-100 [&_textarea]:w-full [&_textarea]:box-border [&_textarea]:rounded-lg [&_textarea]:border [&_textarea]:border-slate-300 [&_textarea]:bg-white [&_textarea]:px-3.5 [&_textarea]:py-3 [&_textarea]:text-sm [&_textarea]:text-slate-800 [&_textarea]:outline-none [&_textarea]:focus:border-blue-600 [&_textarea]:focus:ring-2 [&_textarea]:focus:ring-blue-100">
              <label htmlFor="register-password" className="mb-1.5 block text-sm font-semibold text-slate-700">
                Password
              </label>
              <div className="relative flex items-center">
                <span className="pointer-events-none absolute left-3.5 flex items-center justify-center text-slate-400">
                  <Lock size={18} />
                </span>
                <input
                  id="register-password"
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  className={`h-12 w-full rounded-lg border border-slate-300 bg-slate-50 px-4 pl-11 text-sm text-slate-900 outline-none transition hover:bg-white focus:border-sky-600 focus:bg-white focus:ring-2 focus:ring-sky-100 disabled:cursor-not-allowed disabled:opacity-60 ${errors.password ? 'border-red-500 bg-red-50 focus:border-red-500 focus:ring-red-100' : ''}`}
                  placeholder="Min. 8 characters"
                  value={formData.password}
                  onChange={handleChange}
                  disabled={isLoading}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="absolute right-2.5 rounded-md border-0 bg-transparent p-1.5 text-slate-400 transition hover:text-slate-800"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && (
                <div className="mt-1 flex items-center gap-1.5 text-xs font-medium text-red-600">
                  <AlertCircle size={14} />
                  <span>{errors.password}</span>
                </div>
              )}
            </div>

            {/* Confirm Password Field */}
            <div className="mb-5 flex flex-col [&_label]:mb-2 [&_label]:text-sm [&_label]:font-semibold [&_label]:text-slate-800 [&_input]:w-full [&_input]:box-border [&_input]:rounded-lg [&_input]:border [&_input]:border-slate-300 [&_input]:bg-white [&_input]:px-3.5 [&_input]:py-3 [&_input]:text-sm [&_input]:text-slate-800 [&_input]:outline-none [&_input]:focus:border-blue-600 [&_input]:focus:ring-2 [&_input]:focus:ring-blue-100 [&_select]:w-full [&_select]:box-border [&_select]:rounded-lg [&_select]:border [&_select]:border-slate-300 [&_select]:bg-white [&_select]:px-3.5 [&_select]:py-3 [&_select]:text-sm [&_select]:text-slate-800 [&_select]:outline-none [&_select]:focus:border-blue-600 [&_select]:focus:ring-2 [&_select]:focus:ring-blue-100 [&_textarea]:w-full [&_textarea]:box-border [&_textarea]:rounded-lg [&_textarea]:border [&_textarea]:border-slate-300 [&_textarea]:bg-white [&_textarea]:px-3.5 [&_textarea]:py-3 [&_textarea]:text-sm [&_textarea]:text-slate-800 [&_textarea]:outline-none [&_textarea]:focus:border-blue-600 [&_textarea]:focus:ring-2 [&_textarea]:focus:ring-blue-100">
              <label htmlFor="register-confirm-password" className="mb-1.5 block text-sm font-semibold text-slate-700">
                Confirm Password
              </label>
              <div className="relative flex items-center">
                <span className="pointer-events-none absolute left-3.5 flex items-center justify-center text-slate-400">
                  <Lock size={18} />
                </span>
                <input
                  id="register-confirm-password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  className={`h-12 w-full rounded-lg border border-slate-300 bg-slate-50 px-4 pl-11 text-sm text-slate-900 outline-none transition hover:bg-white focus:border-sky-600 focus:bg-white focus:ring-2 focus:ring-sky-100 disabled:cursor-not-allowed disabled:opacity-60 ${errors.confirmPassword ? 'border-red-500 bg-red-50 focus:border-red-500 focus:ring-red-100' : ''}`}
                  placeholder="Re-enter your password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  disabled={isLoading}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="absolute right-2.5 rounded-md border-0 bg-transparent p-1.5 text-slate-400 transition hover:text-slate-800"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                  tabIndex={-1}
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.confirmPassword && (
                <div className="mt-1 flex items-center gap-1.5 text-xs font-medium text-red-600">
                  <AlertCircle size={14} />
                  <span>{errors.confirmPassword}</span>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="mt-2 flex h-12 w-full items-center justify-center gap-2 rounded-lg border-0 bg-gradient-to-r from-sky-600 to-sky-700 text-sm font-semibold text-white shadow-md transition hover:-translate-y-0.5 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
              id="register-submit-btn"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full border-2 border-slate-300 border-t-sky-600 h-4 w-4"></div>
                  <span>Creating Account...</span>
                </>
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-slate-500">
            Already registered?{' '}
            <Link to="/login" className="font-semibold text-sky-600 no-underline hover:text-sky-700 hover:underline">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
