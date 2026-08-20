import { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { FiHeart, FiMenu, FiX, FiSearch } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { getSiteContent, DEFAULT_SITE_CONTENT } from '../../services/siteContentService';
import ThemeToggle from './ThemeToggle';

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const [siteContent, setSiteContent] = useState(DEFAULT_SITE_CONTENT);
  const { user, isAuthenticated, isAdmin, profile, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    getSiteContent().then((data) => {
      if (data) setSiteContent(data);
    });
  }, []);

  const userInitial = (
    profile?.name?.[0] ||
    user?.displayName?.[0] ||
    user?.email?.[0] ||
    'U'
  ).toUpperCase();

  const submitSearch = (e) => {
    e.preventDefault();
    navigate(`/products?search=${encodeURIComponent(q)}`);
  };

  const navLinks = [
    { to: '/products', label: siteContent.navProductLabel || 'All Products' },
    { to: '/macro-calculator', label: siteContent.navMacroLabel || 'Macro Calculator' },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-gray-200 dark:border-brand-border bg-white/90 dark:bg-brand-black/90 backdrop-blur">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Logo — dynamic signature block */}
        <Link to="/" className="flex items-center gap-2 shrink-0 group">
          <span className="relative grid place-items-center h-9 w-9 bg-brand-green-500 -skew-x-6 shadow-glow">
            <span className="skew-x-6 font-display font-bold text-brand-black text-lg">
              {siteContent.logoBadgeText || 'RB'}
            </span>
          </span>
          <span className="font-display font-bold text-xl tracking-wide">
            {siteContent.brandName || 'RB_PROTEIN'}
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center gap-7">
          {navLinks.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) =>
                `text-sm font-medium tracking-wide transition-colors border-b-2 pb-1 ${
                  isActive
                    ? 'text-brand-green-500 border-brand-green-500'
                    : 'text-gray-600 dark:text-gray-300 border-transparent hover:text-brand-green-500'
                }`
              }
              end={l.to === '/products'}
            >
              {l.label}
            </NavLink>
          ))}
        </nav>

        {/* Search (desktop) */}
        <form onSubmit={submitSearch} className="hidden md:flex items-center flex-1 max-w-xs relative">
          <FiSearch className="absolute left-3 text-gray-400" size={16} />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search whey, oats, creatine..."
            className="w-full pl-9 pr-3 py-2 text-sm rounded-full bg-gray-100 dark:bg-brand-surface border border-transparent
                       focus:border-brand-green-500 focus:outline-none placeholder:text-gray-400"
          />
        </form>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Link to="/wishlist" className="hidden sm:grid place-items-center h-9 w-9 rounded-full hover:text-brand-green-500 text-gray-600 dark:text-gray-300">
            <FiHeart size={18} />
          </Link>

          {isAuthenticated ? (
            <div className="relative group hidden sm:block">
              <button className="flex items-center gap-2 h-9 pl-1 pr-3 rounded-full border border-gray-300 dark:border-brand-border hover:border-brand-green-500 text-sm transition-colors">
                <span className="h-7 w-7 rounded-full bg-brand-green-500 text-brand-black font-extrabold text-xs grid place-items-center uppercase shadow-glow">
                  {userInitial}
                </span>
                <span className="font-semibold text-xs tracking-wide">
                  {profile?.name?.split(' ')[0] || user?.displayName?.split(' ')[0] || 'User'}
                </span>
              </button>
              <div className="absolute right-0 mt-1 w-48 rounded-xl border border-gray-200 dark:border-brand-border bg-white dark:bg-brand-surface shadow-card opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all py-2 z-50">
                <Link to="/orders" className="block px-4 py-2 text-sm hover:text-brand-green-500">My Orders</Link>
                <Link to="/profile" className="block px-4 py-2 text-sm hover:text-brand-green-500">Profile</Link>
                {isAdmin && (
                  <Link to="/admin" className="block px-4 py-2 text-sm font-bold text-brand-green-500 hover:text-brand-green-400">
                    Admin Dashboard
                  </Link>
                )}
                <button onClick={logout} className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10">Logout</button>
              </div>
            </div>
          ) : (
            <Link to="/login" className="hidden sm:inline-flex items-center h-9 px-4 rounded-full bg-brand-green-500 text-brand-black text-sm font-semibold hover:bg-brand-green-400 transition-colors">
              Login
            </Link>
          )}

          <button className="lg:hidden grid place-items-center h-9 w-9" onClick={() => setOpen(!open)} aria-label="Menu">
            {open ? <FiX size={20} /> : <FiMenu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="lg:hidden border-t border-gray-200 dark:border-brand-border px-4 py-4 space-y-3 bg-white dark:bg-brand-black">
          <form onSubmit={submitSearch} className="relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search products..."
              className="w-full pl-9 pr-3 py-2 text-sm rounded-full bg-gray-100 dark:bg-brand-surface" />
          </form>
          {navLinks.map((l) => (
            <Link key={l.to} to={l.to} onClick={() => setOpen(false)} className="block text-sm font-medium py-1">{l.label}</Link>
          ))}
          <hr className="border-gray-200 dark:border-brand-border" />
          {isAuthenticated ? (
            <>
              <div className="flex items-center gap-2 py-1">
                <span className="h-7 w-7 rounded-full bg-brand-green-500 text-brand-black font-extrabold text-xs grid place-items-center uppercase">
                  {userInitial}
                </span>
                <span className="font-bold text-sm">
                  {profile?.name || user?.displayName || user?.email}
                </span>
              </div>
              <Link to="/orders" onClick={() => setOpen(false)} className="block text-sm py-1">My Orders</Link>
              <Link to="/wishlist" onClick={() => setOpen(false)} className="block text-sm py-1">Wishlist</Link>
              {isAdmin && (
                <Link to="/admin" onClick={() => setOpen(false)} className="block text-sm font-bold text-brand-green-500 py-1">
                  Admin Dashboard
                </Link>
              )}
              <button onClick={logout} className="text-sm text-red-500">Logout</button>
            </>
          ) : (
            <Link to="/login" onClick={() => setOpen(false)} className="block text-sm font-semibold text-brand-green-500">Login / Sign up</Link>
          )}
        </div>
      )}
    </header>
  );
}
