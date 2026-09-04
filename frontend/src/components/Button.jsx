import React from 'react';

const variants = {
  primary: 'bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500/30',
  secondary: 'bg-slate-100 hover:bg-slate-200 text-slate-700 focus:ring-slate-400/30',
  danger: 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500/30',
};

export const Button = ({ children, variant = 'primary', className = '', ...props }) => {
  return (
    <button
      className={`inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-md shadow-sm transition-all focus:outline-none focus:ring-2 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;