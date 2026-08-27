import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiArrowRight, FiTruck, FiShield, FiStar, FiGrid, FiZap } from 'react-icons/fi';
import { listProducts } from '../../services/productService';
import { getSiteContent, DEFAULT_SITE_CONTENT, buildProductWhatsAppLink } from '../../services/siteContentService';
import ProductGrid from '../../components/product/ProductGrid';
import Loader from '../../components/common/Loader';

const CATEGORY_SHORTCUTS = [
  { label: 'All Products', icon: FiGrid, to: '/products' },
];

export default function Home() {
  const [featured, setFeatured] = useState([]);
  const [siteContent, setSiteContent] = useState(DEFAULT_SITE_CONTENT);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      listProducts({ sort: 'rating', pageSize: 12 }),
      getSiteContent(),
    ]).then(([prodRes, contentRes]) => {
      setFeatured(prodRes.docs);
      if (contentRes) setSiteContent(contentRes);
    }).finally(() => setLoading(false));
  }, []);

  const heroDeals = siteContent.heroDeals?.length ? siteContent.heroDeals : DEFAULT_SITE_CONTENT.heroDeals;

  return (
    <div className="space-y-8 pb-16">
      {/* 1. Category Ribbon */}
      <section className="bg-white dark:bg-brand-surface border-b border-gray-200 dark:border-brand-border py-2.5">
        <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 flex flex-wrap items-center justify-center sm:justify-between gap-1.5 sm:gap-3">
          {CATEGORY_SHORTCUTS.map((cat) => {
            const Icon = cat.icon;
            return (
              <Link
                key={cat.label}
                to={cat.to}
                className="flex items-center gap-1.5 sm:gap-2.5 px-2.5 py-1.5 sm:px-4 sm:py-2 rounded-full text-[11px] sm:text-xs font-semibold tracking-wide shrink-0
                           bg-gray-100 dark:bg-brand-charcoal hover:bg-brand-green-500 hover:text-brand-black dark:hover:bg-brand-green-500 dark:hover:text-brand-black
                           transition-colors border border-transparent hover:border-brand-green-500"
              >
                <Icon size={13} className="shrink-0" />
                <span>{cat.label}</span>
              </Link>
            );
          })}
          <Link
            to="/macro-calculator"
            className="flex items-center gap-1.5 sm:gap-2 px-2.5 py-1.5 sm:px-4 sm:py-2 rounded-full text-[11px] sm:text-xs font-bold tracking-wide shrink-0
                       bg-brand-green-500/15 text-brand-green-500 border border-brand-green-500/30 hover:bg-brand-green-500 hover:text-brand-black transition-colors"
          >
            📊 Macro Engine
          </Link>
        </div>
      </section>

      {/* Dynamic Main Website Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-brand-black via-brand-surface to-brand-charcoal border border-brand-border p-8 md:p-12 grid lg:grid-cols-2 gap-8 items-center shadow-card">
          <div className="space-y-4 z-10 order-2 lg:order-1">
            <span className="inline-block px-3 py-1 rounded-full text-xs font-extrabold tracking-widest uppercase bg-brand-green-500/20 text-brand-green-500 border border-brand-green-500/30">
              {siteContent.brandTagline || 'RB_PROTEIN — ELITE NUTRITION'}
            </span>
            <h1 className="font-display font-extrabold text-3xl sm:text-5xl leading-tight text-white">
              {siteContent.heroTitle}
            </h1>
            <p className="text-sm sm:text-base text-gray-300 max-w-xl leading-relaxed">
              {siteContent.heroSubtitle}
            </p>
            <div className="pt-2">
              <Link to="/products" className="btn-primary py-3.5 px-8 text-base font-bold shadow-glow inline-flex items-center gap-2">
                {siteContent.heroCtaText || 'Explore All Products'} <FiArrowRight size={18} />
              </Link>
            </div>
          </div>
          <div className="relative h-64 sm:h-80 w-full rounded-2xl overflow-hidden bg-brand-charcoal border border-brand-border/60 order-1 lg:order-2">
            <img
              src={siteContent.heroImage || '/images/rb_protein_tub.jpg'}
              alt="Website Banner"
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* Feature Cards — Single Row on Mobile */}
      <section className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 pt-2">
        <div className="grid grid-cols-3 gap-2 sm:gap-6">
          {heroDeals.map((deal) => (
            <div
              key={deal.id}
              className="group relative rounded-xl sm:rounded-2xl overflow-hidden bg-white dark:bg-brand-surface border border-gray-200 dark:border-brand-border p-2 sm:p-5 flex flex-col justify-between hover:shadow-card transition-all"
            >
              <div>
                <div className="flex flex-wrap items-center justify-between gap-1 mb-2">
                  <span className="text-[8px] sm:text-[10px] font-extrabold tracking-wider bg-brand-green-500 text-brand-black px-1 py-0.5 sm:px-2.5 sm:py-1 rounded-md uppercase line-clamp-1">
                    {deal.badge}
                  </span>
                  {deal.discount && (
                    <span className="text-[8px] sm:text-xs font-bold text-red-500 bg-red-500/10 px-1 py-0.5 rounded-full border border-red-500/20">
                      {deal.discount}
                    </span>
                  )}
                </div>

                <Link to="/products" className="block aspect-square w-full rounded-lg sm:rounded-xl overflow-hidden bg-brand-black/40 mb-2 sm:mb-4">
                  <img
                    src={deal.image}
                    alt={deal.title}
                    className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </Link>

                <h3 className="font-display font-bold text-xs sm:text-lg leading-tight line-clamp-1 group-hover:text-brand-green-500 transition-colors">
                  {deal.title}
                </h3>
                <p className="text-[9px] sm:text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-1">{deal.tagline}</p>
              </div>

              <div className="mt-2 sm:mt-4 pt-1 flex flex-wrap items-center justify-between gap-1">
                <div>
                  <span className="font-display font-extrabold text-xs sm:text-xl text-gray-900 dark:text-white">₹{deal.price}</span>
                  {deal.mrp > deal.price && (
                    <span className="text-[9px] sm:text-xs text-gray-400 line-through ml-1 hidden sm:inline">₹{deal.mrp}</span>
                  )}
                </div>

                <a
                  href={buildProductWhatsAppLink({
                    name: deal.title,
                    price: deal.price,
                    id: deal.id,
                    image: deal.image,
                    phone: siteContent.whatsappNumber,
                  })}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary text-[9px] sm:text-xs py-1 px-2 sm:py-2 sm:px-4 !rounded-full shadow-none hover:shadow-glow inline-flex items-center justify-center font-bold shrink-0"
                >
                  <span className="sm:hidden">DM</span>
                  <span className="hidden sm:inline">DM for Order</span>
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Dynamic Announcement Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl bg-gradient-to-r from-brand-surface via-brand-charcoal to-brand-surface border border-brand-green-500/30 p-6 flex flex-col md:flex-row items-center justify-between gap-6 shadow-glow">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-brand-green-500 text-brand-black grid place-items-center shrink-0 shadow-glow">
              <FiZap size={24} />
            </div>
            <div>
              <span className="text-[11px] uppercase tracking-widest font-bold text-brand-green-400">STORE ANNOUNCEMENT</span>
              <h2 className="font-display font-bold text-xl sm:text-2xl">{siteContent.announcementText}</h2>
            </div>
          </div>
          <Link to="/products" className="btn-primary whitespace-nowrap text-sm">
            Explore Deals <FiArrowRight className="ml-1" />
          </Link>
        </div>
      </section>

      {/* Main Product Catalog Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        <div className="flex items-center justify-between mb-6 pb-3 border-b border-gray-200 dark:border-brand-border">
          <div>
            <h2 className="font-display font-bold text-3xl">Trending Products</h2>
            <p className="text-gray-500 text-sm mt-0.5">Explore peak-performance nutrition & high-protein essentials.</p>
          </div>
          <Link to="/products" className="text-brand-green-500 hover:text-brand-green-400 text-sm font-semibold flex items-center gap-1">
            View All <FiArrowRight size={14} />
          </Link>
        </div>

        {loading ? <Loader /> : <ProductGrid products={featured} />}
      </section>

      {/* Category Showcase Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <h2 className="font-display font-bold text-2xl mb-6">Shop by Category</h2>
        <div className="grid sm:grid-cols-3 gap-6">
          {[
            {
              title: 'Whey & Isolate Proteins',
              subtitle: '25g+ pure protein per scoop for instant recovery',
              category: 'protein',
              image: '/images/rb_protein_tub.jpg',
            },
            {
              title: 'High Protein Rolled Oats',
              subtitle: 'Complex carbs & natural fiber for clean power',
              category: 'oats',
              image: '/images/rb_oats_bag.jpg',
            },
            {
              title: 'Shakers & Training Gear',
              subtitle: 'Insulated stainless steel & workout accessories',
              category: 'accessories',
              image: '/images/rb_shaker_bottle.jpg',
            },
          ].map((cat) => (
            <Link
              key={cat.category}
              to={`/products?category=${cat.category}`}
              className="group relative rounded-2xl overflow-hidden border border-gray-200 dark:border-brand-border bg-brand-surface aspect-[4/3] flex flex-col justify-end p-6"
            >
              <img
                src={cat.image}
                alt={cat.title}
                className="absolute inset-0 h-full w-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-60 group-hover:opacity-80"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-brand-black via-brand-black/60 to-transparent" />
              <div className="relative z-10">
                <h3 className="font-display font-bold text-xl text-white group-hover:text-brand-green-500 transition-colors">
                  {cat.title}
                </h3>
                <p className="text-xs text-gray-300 mt-1">{cat.subtitle}</p>
                <span className="inline-flex items-center text-xs font-semibold text-brand-green-400 mt-3 group-hover:translate-x-1 transition-transform">
                  Browse Category <FiArrowRight className="ml-1" size={12} />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Trust Strip */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[
            { icon: FiTruck, title: 'Pan-India Express Shipping', desc: 'Fast delivery in 2-5 business days' },
            { icon: FiShield, title: '100% Authentic & Lab Tested', desc: 'Third-party verified batch certificates' },
            { icon: FiStar, title: 'Top Rated by Athletes', desc: 'Over 5,000+ verified customer reviews' },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="flex items-center gap-4 p-5 card">
              <div className="h-11 w-11 rounded-full bg-brand-green-500/10 text-brand-green-500 grid place-items-center shrink-0">
                <Icon size={20} />
              </div>
              <div>
                <p className="font-semibold text-sm">{title}</p>
                <p className="text-xs text-gray-500">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
