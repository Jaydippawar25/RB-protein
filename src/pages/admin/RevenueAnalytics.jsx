import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { listAllOrders } from '../../services/orderService';
import Loader from '../../components/common/Loader';
import StatCard from '../../components/admin/StatCard';

export default function RevenueAnalytics() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { listAllOrders().then((r) => setOrders(r.docs)).finally(() => setLoading(false)); }, []);
  if (loading) return <Loader />;

  const paid = orders.filter((o) => o.status !== 'cancelled');
  const revenue = paid.reduce((s, o) => s + (o.total || 0), 0);
  const avgOrderValue = paid.length ? revenue / paid.length : 0;

  const byMonth = {};
  paid.forEach((o) => {
    const m = o.createdAt?.toDate ? o.createdAt.toDate().toLocaleDateString('en-IN', { month: 'short' }) : 'Unknown';
    byMonth[m] = (byMonth[m] || 0) + o.total;
  });

  return (
    <div className="space-y-6">
      <h1 className="font-display font-bold text-2xl">Revenue Analytics</h1>
      <div className="grid grid-cols-3 gap-4">
        <StatCard label="Total Revenue" value={`₹${revenue.toLocaleString('en-IN')}`} />
        <StatCard label="Orders" value={paid.length} />
        <StatCard label="Avg Order Value" value={`₹${avgOrderValue.toFixed(0)}`} />
      </div>
      <div className="card p-6">
        <h3 className="font-semibold mb-4">Monthly Revenue</h3>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={Object.entries(byMonth).map(([month, total]) => ({ month, total }))}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2A2F2A" />
              <XAxis dataKey="month" /><YAxis /><Tooltip />
              <Bar dataKey="total" fill="#FF6B00" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
