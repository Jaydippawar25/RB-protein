import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { FiChevronLeft, FiChevronRight, FiStar, FiHeart, FiCalendar } from 'react-icons/fi';
import { buildProductWhatsAppLink } from '../../services/siteContentService';

// Safe alias fallback to prevent any ReferenceError if <Calendar /> or <FiCalendar /> is rendered
const Calendar = FiCalendar;

export default function HorizontalProductSlider({ title, subtitle, products = [], wishlist = [], onToggleWishlist }) {
  const sliderRef = useRef(null);

  const scroll = (direction) => {
    if (sliderRef.current) {
      const scrollAmount = direction === 'left' ? -300 : 300;
      sliderRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  if (!products || products.length === 0) return null;

  return (
    <div className="space-y-4">
      {/* Slider Header Bar */}
      <div className="flex items-end justify-between px-1">
        <div>
          {title && <h2 className="font-display font-bold text-2xl text-gray-900 dark:text-white">{title}</h2>}
          {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => scroll('left')}
            className="h-9 w-9 grid place-items-center rounded-full bg-white dark:bg-brand-surface border border-gray-200 dark:border-brand-border hover:border-brand-green-500 hover:text-brand-green-500 transition-colors shadow-sm"
            aria-label="Scroll left"
          >
            <FiChevronLeft size={18} />
          </button>
          <button
            onClick={() => scroll('right')}
            className="h-9 w-9 grid place-items-center rounded-full bg-white dark:bg-brand-surface border border-gray-200 dark:border-brand-border hover:border-brand-green-500 hover:text-brand-green-500 transition-colors shadow-sm"
            aria-label="Scroll right"
          >
            <FiChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* Horizontal Scroll Track */}
      <div
        ref={sliderRef}
        className="flex items-stretch gap-4 sm:gap-6 overflow-x-auto no-scrollbar scroll-smooth py-2 px-1"
      >
        {products.map((product) => {
          const discount = product.mrp > product.price ? Math.round(((product.mrp - product.price) / product.mrp) * 100) : 0;
          const isWishlisted = wishlist.includes(product.id);

          return (
            <div
              key={product.id}
              className="w-60 sm:w-72 shrink-0 group relative rounded-2xl border border-gray-200 dark:border-brand-border bg-white dark:bg-brand-surface overflow-hidden hover:shadow-card transition-all flex flex-col justify-between"
            >
              <div>
                {/* Wishlist Button */}
                <button
                  onClick={() => onToggleWishlist?.(product.id)}
                  className={`absolute top-2.5 right-2.5 z-10 h-8 w-8 grid place-items-center rounded-full backdrop-blur bg-white/80 dark:bg-brand-black/60
                    ${isWishlisted ? 'text-brand-green-500' : 'text-gray-500'} hover:text-brand-green-500`}
                  aria-label="Toggle wishlist"
                >
                  <FiHeart size={15} fill={isWishlisted ? 'currentColor' : 'none'} />
                </button>

                {/* Discount Badge */}
                {discount > 0 && (
                  <span className="absolute top-2.5 left-2.5 z-10 text-[10px] sm:text-[11px] font-extrabold bg-brand-green-500 text-brand-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                    -{discount}%
                  </span>
                )}

                {/* Product Image */}
                <Link to={`/products/${product.id}`} className="block aspect-square bg-gray-100 dark:bg-brand-charcoal overflow-hidden">
                  <img
                    src={product.images?.[0] || 'https://placehold.co/400x400/141613/FF6B00?text=RB'}
                    alt={product.name}
                    className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </Link>

                {/* Info Content */}
                <div className="p-3 sm:p-4 space-y-1.5">
                  <p className="text-[10px] sm:text-xs uppercase tracking-widest text-brand-green-600 dark:text-brand-green-400 font-bold">
                    {product.category}
                  </p>
                  <Link to={`/products/${product.id}`}>
                    <h3 className="font-semibold text-xs sm:text-sm leading-snug line-clamp-2 hover:text-brand-green-500">
                      {product.name}
                    </h3>
                  </Link>

                  {/* Expiry Date / Batch Badge if present */}
                  {product.expiryDate && (
                    <div className="flex items-center gap-1 text-[11px] text-gray-400 pt-0.5">
                      <Calendar size={13} className="text-brand-green-500 shrink-0" />
                      <span>Exp: {product.expiryDate}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-1 text-[11px] text-gray-500 pt-0.5">
                    <FiStar className="text-yellow-500" fill="currentColor" size={12} />
                    <span className="font-semibold text-gray-300">{product.rating?.toFixed(1) || 'New'}</span>
                    <span className="text-gray-400">({product.reviewCount || 0})</span>
                  </div>
                </div>
              </div>

              {/* Price & Order Action */}
              <div className="p-3 sm:p-4 pt-0 flex flex-wrap items-center justify-between gap-1.5">
                <div>
                  <span className="font-display font-extrabold text-base sm:text-lg">₹{product.price}</span>
                  {discount > 0 && <span className="text-[11px] text-gray-400 line-through ml-1.5">₹{product.mrp}</span>}
                </div>
                <a
                  href={buildProductWhatsAppLink({
                    name: product.name,
                    price: product.price,
                    id: product.id,
                    image: product.images?.[0],
                  })}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full bg-brand-green-500 text-brand-black text-[11px] sm:text-xs font-bold hover:bg-brand-green-400 transition-colors flex items-center gap-1 shrink-0"
                >
                  DM for Order
                </a>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
export { Calendar };
