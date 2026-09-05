import { NavLink } from 'react-router-dom'

const navItems = [
  { to: '/dashboard', label: 'Overview' },
  { to: '/medicines', label: 'Medicines' },
  { to: '/suppliers', label: 'Suppliers' },
  { to: '/inventory', label: 'Inventory' },
]

export default function DashboardLayout({ children, userLabel = 'Signed in' }) {
  return (
    <div className="flex min-h-screen bg-slate-50">
      <aside className="flex w-60 shrink-0 flex-col border-r border-slate-200 bg-white">
        <div className="flex items-center gap-2 border-b border-slate-200 px-5 py-5">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-blue-600 text-sm font-bold text-white">
            M
          </div>
          <span className="text-base font-bold text-slate-900">MedStock</span>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-4">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `block rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className="flex flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
          <p className="text-xs uppercase tracking-wide text-slate-400">Pharmacy inventory console</p>
          <span className="text-sm text-slate-600">{userLabel}</span>
        </header>

        <main className="flex-1 px-6 py-6">{children}</main>
      </div>
    </div>
  )
}
