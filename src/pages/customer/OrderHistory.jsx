import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { listUserOrders } from '../../services/orderService';
import Loader from '../../components/common/Loader';

const STATUS_COLORS = {
  placed: 'bg-blue-100 text-blue-700', confirmed: 'bg-indigo-100 text-indigo-700',
  packed: 'bg-purple-100 text-purple-700', shipped: 'bg-yellow-100 text-yellow-700',
  out_for_delivery: 'bg-orange-100 text-orange-700', delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
};

export default function OrderHistory() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return setLoading(false);
    listUserOrders(user.uid).then((r) => setOrders(r.docs)).finally(() => setLoading(false));
  }, [user]);

  if (loading) return <Loader full />;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="font-display font-bold text-3xl mb-6">My Orders</h1>
      {orders.length === 0 ? (
        <p className="text-gray-500">No orders yet. <Link to="/products" className="text-brand-green-500">Start shopping</Link></p>
      ) : (
        <div className="space-y-4">
          {orders.map((o) => (
            <Link key={o.id} to={`/orders/${o.id}`} className="card p-5 flex items-center justify-between hover:border-brand-green-500 block">
              <div>
                <p className="font-medium">#{o.id.slice(-8).toUpperCase()}</p>
                <p className="text-sm text-gray-500">{o.items.length} items · ₹{o.total?.toFixed(2)}</p>
              </div>
              <span className={`text-xs font-semibold px-3 py-1 rounded-full capitalize ${STATUS_COLORS[o.status] || 'bg-gray-100 text-gray-700'}`}>
                {o.status.replace(/_/g, ' ')}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
