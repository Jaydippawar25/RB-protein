import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { listAllOrders, updateOrderStatus } from '../../services/orderService';
import { ORDER_STATUSES } from '../../utils/constants';
import Loader from '../../components/common/Loader';

export default function OrderProcessing() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  const load = () => listAllOrders(filter || undefined).then((r) => setOrders(r.docs)).finally(() => setLoading(false));
  useEffect(() => { load(); }, [filter]);

  const advance = async (order) => {
    const idx = ORDER_STATUSES.indexOf(order.status);
    const next = ORDER_STATUSES[idx + 1];
    if (!next || next === 'cancelled') return;
    await updateOrderStatus(order.id, next);
    toast.success(`Order moved to "${next.replace('_', ' ')}"`);
    load();
  };

  if (loading) return <Loader />;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="font-display font-bold text-2xl">Order Processing</h1>
        <select value={filter} onChange={(e) => setFilter(e.target.value)} className="input w-48">
          <option value="">All Statuses</option>
          {ORDER_STATUSES.map((s) => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
        </select>
      </div>
      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 dark:bg-brand-charcoal text-left text-xs uppercase text-gray-500">
            <tr><th className="p-3">Order</th><th className="p-3">Total</th><th className="p-3">Status</th><th className="p-3">Action</th></tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id} className="border-t border-gray-100 dark:border-brand-border">
                <td className="p-3">#{o.id.slice(-8).toUpperCase()}</td>
                <td className="p-3">₹{o.total?.toFixed(2)}</td>
                <td className="p-3 capitalize">{o.status.replace(/_/g, ' ')}</td>
                <td className="p-3">
                  {o.status !== 'delivered' && o.status !== 'cancelled' && (
                    <button onClick={() => advance(o)} className="text-brand-green-500 text-xs font-medium">Advance →</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
