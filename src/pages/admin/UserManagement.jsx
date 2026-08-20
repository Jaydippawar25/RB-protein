import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { queryCollection, updateDocument } from '../../firebase/firestore';
import Loader from '../../components/common/Loader';

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState('all');

  const load = () => queryCollection('users', { pageSize: 500 }).then((r) => setUsers(r.docs)).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const setStatus = async (uid, status) => {
    await updateDocument('users', uid, { status });
    toast.success(`User ${status}`);
    load();
  };

  const filtered = roleFilter === 'all' ? users : users.filter((u) => u.role === roleFilter);

  if (loading) return <Loader />;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="font-display font-bold text-2xl">User Management</h1>
        <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="input w-40">
          <option value="all">All Roles</option>
          <option value="customer">Customers</option>
          <option value="admin">Admins</option>
        </select>
      </div>
      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 dark:bg-brand-charcoal text-left text-xs uppercase text-gray-500">
            <tr><th className="p-3">Name</th><th className="p-3">Email</th><th className="p-3">Role</th><th className="p-3">Status</th><th className="p-3">Actions</th></tr>
          </thead>
          <tbody>
            {filtered.map((u) => (
              <tr key={u.id} className="border-t border-gray-100 dark:border-brand-border">
                <td className="p-3">{u.name}</td>
                <td className="p-3 text-gray-500">{u.email}</td>
                <td className="p-3 capitalize">{u.role}</td>
                <td className="p-3"><span className={`text-xs px-2 py-1 rounded-full ${u.status === 'active' ? 'bg-green-100 text-green-700' : u.status === 'suspended' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>{u.status}</span></td>
                <td className="p-3 space-x-2">
                  {u.status !== 'suspended'
                    ? <button onClick={() => setStatus(u.id, 'suspended')} className="text-red-500 text-xs font-medium">Suspend</button>
                    : <button onClick={() => setStatus(u.id, 'active')} className="text-brand-green-500 text-xs font-medium">Reactivate</button>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
