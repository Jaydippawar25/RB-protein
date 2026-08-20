import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FiStar, FiHeart } from 'react-icons/fi';
import { getProduct } from '../../services/productService';
import { buildProductWhatsAppLink } from '../../services/siteContentService';
import { useAuth } from '../../context/AuthContext';
import { subscribeWishlist, toggleWishlist } from '../../services/wishlistService';
import Loader from '../../components/common/Loader';

export default function ProductDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [flavor, setFlavor] = useState(null);
  const [wishlist, setWishlist] = useState([]);

  useEffect(() => {
    setLoading(true);
    getProduct(id).then((p) => { setProduct(p); setFlavor(p?.flavors?.[0] || null); }).finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!user) return;
    return subscribeWishlist(user.uid, setWishlist);
  }, [user]);

  if (loading) return <Loader full />;
  if (!product) return <div className="max-w-3xl mx-auto py-24 text-center">Product not found.</div>;

  const isWishlisted = wishlist.includes(product.id);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 grid lg:grid-cols-2 gap-8 sm:gap-12">
      <div className="aspect-square rounded-2xl overflow-hidden bg-gray-100 dark:bg-brand-charcoal border border-gray-200 dark:border-brand-border">
        <img src={product.images?.[0] || 'https://placehold.co/700x700/141613/FF6B00?text=RB'} alt={product.name} className="h-full w-full object-cover" />
      </div>

      <div className="space-y-4">
        <div>
          <p className="text-xs uppercase tracking-widest text-brand-green-500 font-bold mb-1">{product.category}</p>
          <h1 className="font-display font-extrabold text-2xl sm:text-4xl text-gray-900 dark:text-white leading-tight">{product.name}</h1>
          <div className="flex items-center gap-1.5 text-xs sm:text-sm text-gray-500 mt-2">
            <FiStar className="text-yellow-500" fill="currentColor" size={14} />
            <span className="font-semibold text-gray-300">{product.rating?.toFixed(1) || 'New'}</span>
            <span className="text-gray-400">({product.reviewCount || 0} reviews)</span>
          </div>
        </div>

        <div>
          <p className="font-display font-extrabold text-2xl sm:text-3xl text-gray-900 dark:text-white">
            ₹{product.price}
            {product.mrp > product.price && (
              <span className="text-sm sm:text-base text-gray-400 line-through ml-2.5 font-normal">₹{product.mrp}</span>
            )}
          </p>
        </div>

        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{product.description}</p>

        {product.macros && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
            {Object.entries(product.macros).map(([k, v]) => (
              <div key={k} className="card p-2.5 sm:p-3 text-center border border-gray-200 dark:border-brand-border">
                <p className="font-display font-extrabold text-base sm:text-lg text-brand-green-500">{v}{k !== 'calories' ? 'g' : ''}</p>
                <p className="text-[10px] uppercase font-semibold text-gray-400">{k}</p>
              </div>
            ))}
          </div>
        )}

        {product.flavors?.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs sm:text-sm font-semibold">Select Flavor</p>
            <div className="flex flex-wrap gap-2">
              {product.flavors.map((f) => (
                <button
                  key={f}
                  onClick={() => setFlavor(f)}
                  className={`px-3 py-1.5 text-xs sm:text-sm rounded-full border transition-all ${
                    flavor === f
                      ? 'bg-brand-green-500 text-brand-black border-brand-green-500 font-extrabold shadow-glow'
                      : 'border-gray-300 dark:border-brand-border font-medium hover:border-brand-green-500/50'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
          <div className="flex items-center justify-between sm:justify-center gap-3 border border-gray-300 dark:border-brand-border rounded-full px-4 py-2 bg-white dark:bg-brand-surface">
            <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="px-2 font-extrabold text-lg text-gray-400 hover:text-brand-green-500">−</button>
            <span className="w-8 text-center font-bold text-sm">{qty}</span>
            <button onClick={() => setQty((q) => q + 1)} className="px-2 font-extrabold text-lg text-gray-400 hover:text-brand-green-500">+</button>
          </div>

          <div className="flex items-center gap-2 flex-1">
            <a
              href={buildProductWhatsAppLink({
                name: product.name,
                price: product.price,
                id: product.id,
                image: product.images?.[0],
                flavor,
                qty,
              })}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary flex-1 py-3 text-sm font-bold flex items-center justify-center gap-2 shadow-glow"
            >
              DM for Order
            </a>
            <button
              onClick={async () => {
                if (!user) return toast.error('Log in to save items');
                setWishlist(await toggleWishlist(user.uid, product.id, wishlist));
              }}
              className={`h-11 w-11 grid place-items-center rounded-full border shrink-0 transition-colors ${
                isWishlisted ? 'text-brand-green-500 border-brand-green-500 bg-brand-green-500/10' : 'border-gray-300 dark:border-brand-border hover:border-brand-green-500'
              }`}
            >
              <FiHeart fill={isWishlisted ? 'currentColor' : 'none'} size={18} />
            </button>
          </div>
        </div>

        {product.stock <= 5 && product.stock > 0 && (
          <p className="text-xs sm:text-sm font-semibold text-orange-500 mt-2">Only {product.stock} left in stock — order soon.</p>
        )}
        {product.stock === 0 && <p className="text-xs sm:text-sm font-semibold text-red-500 mt-2">Out of stock</p>}
      </div>
    </div>
  );
}
