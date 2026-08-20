import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { listAllOrders } from '../../services/orderService';
import { queryCollection } from '../../firebase/firestore';
import StatCard from '../../components/admin/StatCard';
import Loader from '../../components/common/Loader';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [ordersRes, usersRes, productsRes] = await Promise.all([
        listAllOrders(),
        queryCollection('users', { pageSize: 1000 }),
        queryCollection('products', { pageSize: 1000 }),
      ]);
      const orders = ordersRes.docs;
      const revenue = orders.filter((o) => o.paymentStatus === 'paid' || o.status !== 'cancelled').reduce((s, o) => s + (o.total || 0), 0);

      // Group revenue by day for the last 14 entries (demo aggregation; for scale,
      // pre-aggregate via a scheduled Cloud Function into a `dailyStats` collection).
      const byDay = {};
      orders.forEach((o) => {
        const d = o.createdAt?.toDate ? o.createdAt.toDate().toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }) : 'Unknown';
        byDay[d] = (byDay[d] || 0) + (o.total || 0);
      });
      const chartData = Object.entries(byDay).map(([date, total]) => ({ date, total }));

      const categoryCount = {};
      productsRes.docs.forEach((p) => { categoryCount[p.category] = (categoryCount[p.category] || 0) + 1; });

      setStats({
        revenue, orderCount: orders.length, userCount: usersRes.docs.length, productCount: productsRes.docs.length,
        pendingProducts: productsRes.docs.filter((p) => p.status === 'pending').length,
        chartData,
        categoryData: Object.entries(categoryCount).map(([category, count]) => ({ category, count })),
      });
      setLoading(false);
    })();
  }, []);

  if (loading) return <Loader full />;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display font-bold text-2xl mb-1">Admin Overview</h1>
        <p className="text-gray-500 text-sm">Platform-wide performance at a glance.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Revenue" value={`₹${stats.revenue.toLocaleString('en-IN')}`} />
        <StatCard label="Orders" value={stats.orderCount} />
        <StatCard label="Users" value={stats.userCount} />
        <StatCard label="Products" value={stats.productCount} />
      </div>

      <div className="card p-3 bg-brand-green-500/10 border-brand-green-500/30">
        <p className="text-sm font-medium">Products awaiting moderation: <span className="font-bold">{stats.pendingProducts}</span></p>
      </div>

      <div className="card p-6">
        <h3 className="font-semibold mb-4">Revenue Trend</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={stats.chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2A2F2A" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Line type="monotone" dataKey="total" stroke="#FF6B00" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card p-6">
        <h3 className="font-semibold mb-4">Products by Category</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stats.categoryData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2A2F2A" />
              <XAxis dataKey="category" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="count" fill="#FF6B00" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
