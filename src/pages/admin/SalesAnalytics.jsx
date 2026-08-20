import { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { listAllOrders } from '../../services/orderService';
import Loader from '../../components/common/Loader';

const COLORS = ['#FF6B00', '#FF8833', '#FFAE73', '#E65F00', '#B84C00', '#5C2600'];

export default function SalesAnalytics() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { listAllOrders().then((r) => setOrders(r.docs)).finally(() => setLoading(false)); }, []);
  if (loading) return <Loader />;

  const productSales = {};
  orders.forEach((o) => o.items.forEach((i) => { productSales[i.name] = (productSales[i.name] || 0) + i.qty; }));
  const topProducts = Object.entries(productSales).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([name, qty]) => ({ name, qty }));

  const statusCount = {};
  orders.forEach((o) => { statusCount[o.status] = (statusCount[o.status] || 0) + 1; });
  const statusData = Object.entries(statusCount).map(([name, value]) => ({ name, value }));

  return (
    <div className="space-y-6">
      <h1 className="font-display font-bold text-2xl">Sales Analytics</h1>
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <h3 className="font-semibold mb-4">Top Selling Products (units)</h3>
          <div className="space-y-2">
            {topProducts.map((p) => (
              <div key={p.name} className="flex items-center gap-3">
                <span className="text-sm flex-1 truncate">{p.name}</span>
                <div className="h-2 rounded-full bg-brand-green-500" style={{ width: `${(p.qty / topProducts[0].qty) * 100}px` }} />
                <span className="text-xs text-gray-500 w-8 text-right">{p.qty}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="card p-6">
          <h3 className="font-semibold mb-4">Orders by Status</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={statusData} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80} paddingAngle={2}>
                  {statusData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip /><Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
