import React from 'react';
import { NavLink } from 'react-router-dom';

const navItems = [
  { name: 'Dashboard', path: '/dashboard' },
  { name: 'Medicines', path: '/medicines' },
  { name: 'Inventory', path: '/inventory' },
  { name: 'Suppliers', path: '/suppliers' },
];

const Sidebar = () => {
  return (
    <aside className="w-60 min-h-screen bg-slate-900 text-white p-6 flex flex-col">
      <h2 className="text-xl font-bold mb-8 px-2 tracking-wide text-blue-400">
        MediStock
      </h2>
      <nav className="flex flex-col gap-2">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
              }`
            }
          >
            {item.name}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;