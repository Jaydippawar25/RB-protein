import { Link } from 'react-router-dom';
import { FiHeart, FiStar } from 'react-icons/fi';
import { buildProductWhatsAppLink } from '../../services/siteContentService';

export default function ProductCard({ product, isWishlisted, onToggleWishlist }) {
  const discount = product.mrp > product.price ? Math.round(((product.mrp - product.price) / product.mrp) * 100) : 0;
  const whatsappUrl = buildProductWhatsAppLink({
    name: product.name,
    price: product.price,
    id: product.id,
    image: product.images?.[0],
  });

  return (
    <div className="group relative rounded-2xl border border-gray-200 dark:border-brand-border bg-white dark:bg-brand-surface overflow-hidden hover:shadow-card transition-shadow flex flex-col justify-between">
      <div>
        <button
          onClick={() => onToggleWishlist?.(product.id)}
          className={`absolute top-2.5 right-2.5 z-10 h-8 w-8 grid place-items-center rounded-full backdrop-blur bg-white/80 dark:bg-brand-black/60
            ${isWishlisted ? 'text-brand-green-500' : 'text-gray-500'} hover:text-brand-green-500`}
          aria-label="Toggle wishlist"
        >
          <FiHeart size={15} fill={isWishlisted ? 'currentColor' : 'none'} />
        </button>

        {discount > 0 && (
          <span className="absolute top-2.5 left-2.5 z-10 text-[10px] sm:text-[11px] font-extrabold bg-brand-green-500 text-brand-black px-2 py-0.5 rounded-full uppercase tracking-wider">
            -{discount}%
          </span>
        )}

        <Link to={`/products/${product.id}`} className="block aspect-square bg-gray-100 dark:bg-brand-charcoal overflow-hidden">
          <img
            src={product.images?.[0] || 'https://placehold.co/400x400/141613/FF6B00?text=RB'}
            alt={product.name}
            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </Link>

        <div className="p-3 sm:p-4 space-y-1">
          <p className="text-[10px] sm:text-xs uppercase tracking-widest text-brand-green-600 dark:text-brand-green-400 font-bold">
            {product.category}
          </p>
          <Link to={`/products/${product.id}`}>
            <h3 className="font-semibold text-xs sm:text-sm leading-snug line-clamp-2 hover:text-brand-green-500">
              {product.name}
            </h3>
          </Link>

          {product.macros?.protein != null && (
            <p className="text-[11px] text-gray-500 dark:text-gray-400">
              {product.macros.protein}g protein / serving
            </p>
          )}

          <div className="flex items-center gap-1 text-[11px] text-gray-500 pt-0.5">
            <FiStar className="text-yellow-500" fill="currentColor" size={12} />
            <span className="font-semibold text-gray-300">{product.rating?.toFixed(1) || 'New'}</span>
            <span className="text-gray-500">({product.reviewCount || 0})</span>
          </div>
        </div>
      </div>

      <div className="p-3 sm:p-4 pt-0 flex flex-wrap items-center justify-between gap-1.5">
        <div>
          <span className="font-display font-extrabold text-base sm:text-lg">₹{product.price}</span>
          {discount > 0 && <span className="text-[11px] text-gray-400 line-through ml-1.5">₹{product.mrp}</span>}
        </div>
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full bg-brand-green-500 text-brand-black text-[11px] sm:text-xs font-bold hover:bg-brand-green-400 transition-colors flex items-center gap-1 shrink-0"
        >
          DM for Order
        </a>
      </div>
    </div>
  );
}
