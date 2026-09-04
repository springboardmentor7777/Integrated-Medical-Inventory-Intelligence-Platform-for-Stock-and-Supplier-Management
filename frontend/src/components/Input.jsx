import React from 'react';

export const Input = ({ label, error, className = '', ...props }) => (
  <div className="flex flex-col gap-1.5 mb-4">
    {label && (
      <label className="text-xs font-semibold uppercase tracking-wider text-slate-700">
        {label}
      </label>
    )}
    <input
      className={`w-full px-3.5 py-2 text-sm text-slate-900 bg-white border rounded-md shadow-sm transition placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${
        error
          ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
          : 'border-slate-300 focus:border-blue-500'
      } ${className}`}
      {...props}
    />
    {error && <span className="text-xs text-red-600 mt-0.5">{error}</span>}
  </div>
);

export default Input;