import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

export default function Register() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'customer' });
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const userCredential = await signup(form);
      toast.success('Account created!');
      const email = userCredential?.user?.email || form.email;
      if (email.toLowerCase().includes('admin') || form.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } catch (err) {
      toast.error(err.message.replace('Firebase: ', ''));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] grid place-items-center px-4 bg-grid-fade">
      <div className="w-full max-w-md card p-8">
        <h1 className="font-display font-bold text-2xl mb-1">Create your account</h1>
        <p className="text-sm text-gray-500 mb-6">Join RB_Protein and start fueling smarter.</p>
        <form onSubmit={submit} className="space-y-4">
          <input required placeholder="Full name" className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <input required type="email" placeholder="Email" className="input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <input required type="password" placeholder="Password (min 6 chars)" minLength={6} className="input" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          <button disabled={loading} className="btn-primary w-full">{loading ? 'Creating…' : 'Create Account'}</button>
        </form>
        <p className="text-sm text-center text-gray-500 mt-6">
          Already have an account? <Link to="/login" className="text-brand-green-500 font-medium">Log in</Link>
        </p>
      </div>
    </div>
  );
}
