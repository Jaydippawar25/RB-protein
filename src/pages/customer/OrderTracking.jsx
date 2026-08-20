import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FiCheckCircle, FiCircle } from 'react-icons/fi';
import { getOrder } from '../../services/orderService';
import { ORDER_STATUSES } from '../../utils/constants';
import Loader from '../../components/common/Loader';

export default function OrderTracking() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { getOrder(id).then(setOrder).finally(() => setLoading(false)); }, [id]);

  if (loading) return <Loader full />;
  if (!order) return <div className="max-w-lg mx-auto py-24 text-center">Order not found. <Link to="/orders" className="text-brand-green-500">Back to orders</Link></div>;

  const currentIdx = ORDER_STATUSES.indexOf(order.status);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="font-display font-bold text-2xl mb-1">Order #{order.id.slice(-8).toUpperCase()}</h1>
      <p className="text-gray-500 mb-8">Placed on {order.createdAt?.toDate ? order.createdAt.toDate().toLocaleDateString() : '—'}</p>

      <div className="card p-6 mb-8">
        <div className="flex justify-between">
          {ORDER_STATUSES.filter((s) => s !== 'cancelled').map((s, i) => (
            <div key={s} className="flex-1 flex flex-col items-center text-center relative">
              {i > 0 && <div className={`absolute top-3 right-1/2 w-full h-0.5 ${i <= currentIdx ? 'bg-brand-green-500' : 'bg-gray-200 dark:bg-brand-border'}`} />}
              {i <= currentIdx ? <FiCheckCircle className="text-brand-green-500 z-10 bg-white dark:bg-brand-surface" size={22} /> : <FiCircle className="text-gray-300 z-10 bg-white dark:bg-brand-surface" size={22} />}
              <span className="text-[11px] mt-2 capitalize text-gray-500">{s.replace(/_/g, ' ')}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="card p-6 mb-8">
        <h2 className="font-semibold mb-3">Items</h2>
        {order.items.map((i) => (
          <div key={i.productId} className="flex justify-between py-2 text-sm border-b border-gray-100 dark:border-brand-border last:border-0">
            <span>{i.name} × {i.qty}</span><span>₹{(i.price * i.qty).toFixed(2)}</span>
          </div>
        ))}
        <div className="flex justify-between pt-3 font-semibold"><span>Total</span><span>₹{order.total?.toFixed(2)}</span></div>
      </div>

      <div className="card p-6">
        <h2 className="font-semibold mb-2">Shipping to</h2>
        <p className="text-sm text-gray-600 dark:text-gray-300">{order.address?.line1}, {order.address?.city}, {order.address?.state} — {order.address?.pincode}</p>
      </div>
    </div>
  );
}
