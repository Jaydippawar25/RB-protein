import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { queryCollection } from '../../firebase/firestore';
import { adjustStock } from '../../services/productService';
import Loader from '../../components/common/Loader';

export default function InventoryManagement() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => queryCollection('products', { pageSize: 500, sort: { field: 'stock', dir: 'asc' } }).then((r) => setProducts(r.docs)).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const updateStock = async (id, value) => {
    await adjustStock(id, Math.max(0, Number(value)));
    toast.success('Stock updated');
    load();
  };

  if (loading) return <Loader />;
  const low = products.filter((p) => p.stock <= 10);

  return (
    <div>
      <h1 className="font-display font-bold text-2xl mb-4">Inventory Management</h1>
      {low.length > 0 && (
        <div className="card p-3 mb-4 bg-red-50 dark:bg-red-500/10 border-red-300 dark:border-red-500/40">
          <p className="text-sm text-red-600 dark:text-red-400 font-medium">{low.length} products are low on stock (≤10 units).</p>
        </div>
      )}
      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 dark:bg-brand-charcoal text-left text-xs uppercase text-gray-500">
            <tr><th className="p-3">Product</th><th className="p-3">Category</th><th className="p-3">Stock</th><th className="p-3">Update</th></tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-t border-gray-100 dark:border-brand-border">
                <td className="p-3">{p.name}</td>
                <td className="p-3 capitalize">{p.category}</td>
                <td className="p-3">
                  <span className={p.stock <= 10 ? 'text-red-500 font-semibold' : ''}>{p.stock}</span>
                </td>
                <td className="p-3">
                  <input type="number" defaultValue={p.stock} onBlur={(e) => e.target.value != p.stock && updateStock(p.id, e.target.value)}
                    className="w-20 px-2 py-1 text-sm rounded-lg border border-gray-300 dark:border-brand-border bg-transparent" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
