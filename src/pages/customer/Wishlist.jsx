import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { subscribeWishlist, toggleWishlist } from '../../services/wishlistService';
import { getProduct } from '../../services/productService';
import ProductGrid from '../../components/product/ProductGrid';
import Loader from '../../components/common/Loader';
import { Link } from 'react-router-dom';

export default function Wishlist() {
  const { user } = useAuth();
  const [ids, setIds] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return setLoading(false);
    return subscribeWishlist(user.uid, setIds);
  }, [user]);

  useEffect(() => {
    if (!ids.length) return setProducts([]), setLoading(false);
    setLoading(true);
    Promise.all(ids.map(getProduct)).then((list) => setProducts(list.filter(Boolean))).finally(() => setLoading(false));
  }, [ids]);

  if (!user) {
    return (
      <div className="max-w-lg mx-auto px-4 py-24 text-center">
        <h1 className="font-display font-bold text-2xl mb-3">Log in to view your wishlist</h1>
        <Link to="/login" className="btn-primary">Log In</Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="font-display font-bold text-3xl mb-6">Your Wishlist</h1>
      {loading ? <Loader /> : (
        <ProductGrid products={products} wishlist={ids} onToggleWishlist={(pid) => toggleWishlist(user.uid, pid, ids).then(setIds)} />
      )}
    </div>
  );
}
