import { useState } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { updateDocument } from '../../firebase/firestore';

export default function Profile() {
  const { user, profile } = useAuth();
  const [form, setForm] = useState({ name: profile?.name || '', phone: profile?.phone || '' });
  const [saving, setSaving] = useState(false);

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateDocument('users', user.uid, form);
      toast.success('Profile updated');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="font-display font-bold text-3xl mb-6">Profile</h1>
      <form onSubmit={save} className="card p-6 space-y-4">
        <label className="text-sm block">Email
          <input disabled value={user?.email || ''} className="input mt-1 opacity-60" />
        </label>
        <label className="text-sm block">Full name
          <input className="input mt-1" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </label>
        <label className="text-sm block">Phone
          <input className="input mt-1" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
        </label>
        <button disabled={saving} className="btn-primary w-full">{saving ? 'Saving…' : 'Save Changes'}</button>
      </form>
    </div>
  );
}
