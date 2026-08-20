import { NavLink, Outlet } from 'react-router-dom';

export default function DashboardLayout({ title, links }) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 grid lg:grid-cols-[220px_1fr] gap-8">
      <aside className="space-y-1">
        <h2 className="font-display font-bold text-lg mb-4 px-2">{title}</h2>
        {links.map((l) => (
          <NavLink key={l.to} to={l.to} end
            className={({ isActive }) => `block px-3 py-2 rounded-lg text-sm ${isActive ? 'bg-brand-green-500 text-brand-black font-semibold' : 'hover:bg-gray-100 dark:hover:bg-brand-surface text-gray-600 dark:text-gray-300'}`}>
            {l.label}
          </NavLink>
        ))}
      </aside>
      <div className="min-w-0">
        <Outlet />
      </div>
    </div>
  );
}
