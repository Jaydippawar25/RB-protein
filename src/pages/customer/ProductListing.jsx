import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProductGrid from '../../components/product/ProductGrid';
import Loader from '../../components/common/Loader';
import { listProducts } from '../../services/productService';
import { subscribeWishlist, toggleWishlist } from '../../services/wishlistService';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

export default function ProductListing() {
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [wishlist, setWishlist] = useState([]);

  const filters = {
    category: searchParams.get('category') || 'all',
    search: searchParams.get('search') || '',
    sort: searchParams.get('sort') || 'newest',
    minPrice: searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : null,
    maxPrice: searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : null,
  };

  useEffect(() => {
    setLoading(true);
    listProducts({ ...filters, pageSize: 24 })
      .then((r) => setProducts(r.docs))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  useEffect(() => {
    if (!user) return setWishlist([]);
    return subscribeWishlist(user.uid, setWishlist);
  }, [user]);

  const handleWishlist = async (productId) => {
    if (!user) return toast.error('Log in to save items to your wishlist');
    const next = await toggleWishlist(user.uid, productId, wishlist);
    setWishlist(next);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="w-full">
        {loading ? <Loader /> : <ProductGrid products={products} wishlist={wishlist} onToggleWishlist={handleWishlist} />}
      </div>
    </div>
  );
}
