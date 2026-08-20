import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { queryCollection } from '../../firebase/firestore';
import { moderateProduct } from '../../services/productService';
import Loader from '../../components/common/Loader';

export default function ProductModeration() {
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => queryCollection('products', { filters: [{ field: 'status', op: '==', value: 'pending' }] })
    .then((r) => setPending(r.docs)).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const decide = async (id, status) => {
    await moderateProduct(id, status);
    toast.success(`Product ${status}`);
    load();
  };

  if (loading) return <Loader />;

  return (
    <div>
      <h1 className="font-display font-bold text-2xl mb-4">Product Moderation</h1>
      {pending.length === 0 ? <p className="text-gray-500">Nothing awaiting review.</p> : (
        <div className="grid sm:grid-cols-2 gap-4">
          {pending.map((p) => (
            <div key={p.id} className="card p-4">
              <img src={p.images?.[0] || 'https://placehold.co/300x200/141613/FF6B00?text=RB'} alt={p.name} className="w-full h-36 object-cover rounded-lg mb-3" />
              <p className="font-medium">{p.name}</p>
              <p className="text-sm text-gray-500 mb-3">₹{p.price} · {p.category}</p>
              <div className="flex gap-2">
                <button onClick={() => decide(p.id, 'approved')} className="flex-1 px-3 py-1.5 rounded-full bg-brand-green-500 text-brand-black text-sm font-semibold">Approve</button>
                <button onClick={() => decide(p.id, 'rejected')} className="flex-1 px-3 py-1.5 rounded-full border border-red-300 text-red-500 text-sm">Reject</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
