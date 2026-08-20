import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

export default function Login() {
  const { login, googleLogin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const userCredential = await login(form.email, form.password);
      toast.success('Welcome back!');
      const email = userCredential?.user?.email || form.email;
      if (email.toLowerCase().includes('admin')) {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } catch (err) {
      toast.error(err.message?.replace('Firebase: ', '') || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const userCredential = await googleLogin();
      toast.success('Logged in with Google!');
      const email = userCredential?.user?.email || '';
      if (email.toLowerCase().includes('admin')) {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } catch (err) {
      console.error('Google login error:', err);
      toast.error(err.message?.replace('Firebase: ', '') || 'Google login failed');
    }
  };

  return (
    <div className="min-h-[85vh] grid place-items-center px-4 py-12 bg-grid-fade">
      <div className="w-full max-w-md card p-8 shadow-card border border-gray-200 dark:border-brand-border">
        {/* Header */}
        <div className="text-center mb-6">
          <span className="inline-flex items-center justify-center h-12 w-12 rounded-2xl bg-brand-green-500/10 text-brand-green-500 font-bold text-xl mb-3 border border-brand-green-500/20">
            RB
          </span>
          <h1 className="font-display font-bold text-2xl">Log In to RB_Protein</h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Access your account, track nutrition & custom supplements.
          </p>
        </div>

        {/* Email Login Form */}
        <form onSubmit={handleEmailLogin} className="space-y-4">
          <div>
            <label className="block text-xs uppercase font-bold tracking-wider text-gray-500 mb-1.5">Email Address</label>
            <input
              required
              type="email"
              placeholder="name@example.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full px-4 py-2.5 text-sm rounded-xl border border-gray-300 dark:border-brand-border bg-transparent focus:border-brand-green-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs uppercase font-bold tracking-wider text-gray-500 mb-1.5">Password</label>
            <input
              required
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full px-4 py-2.5 text-sm rounded-xl border border-gray-300 dark:border-brand-border bg-transparent focus:border-brand-green-500 focus:outline-none"
            />
          </div>
          <button disabled={loading} className="btn-primary w-full py-3 text-sm font-bold">
            {loading ? 'Logging in…' : 'Log In'}
          </button>
        </form>

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200 dark:border-brand-border" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white dark:bg-brand-surface px-2 text-gray-400 font-semibold">Or continue with</span>
          </div>
        </div>

        {/* Google Account Login Button */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          className="w-full py-2.5 px-4 rounded-xl border border-gray-300 dark:border-brand-border bg-white dark:bg-brand-charcoal text-gray-800 dark:text-gray-100 font-semibold text-sm hover:bg-gray-50 dark:hover:bg-brand-border transition-colors flex items-center justify-center gap-3 shadow-sm"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          Google Account
        </button>

        <p className="text-xs text-center text-gray-500 dark:text-gray-400 mt-6">
          New here?{' '}
          <Link to="/register" className="text-brand-green-500 font-bold hover:underline">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}
