import { CATEGORIES } from '../../utils/constants';

export default function ProductFilters({ filters, onChange }) {
  const set = (patch) => onChange({ ...filters, ...patch });

  return (
    <aside className="w-full lg:w-64 shrink-0 space-y-6">
      <div>
        <h4 className="text-xs uppercase tracking-widest text-gray-400 mb-3">Category</h4>
        <div className="space-y-1">
          {CATEGORIES.map((c) => (
            <button
              key={c.id}
              onClick={() => set({ category: c.id })}
              className={`block w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                filters.category === c.id
                  ? 'bg-brand-green-500 text-brand-black font-semibold'
                  : 'hover:bg-gray-100 dark:hover:bg-brand-surface text-gray-600 dark:text-gray-300'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h4 className="text-xs uppercase tracking-widest text-gray-400 mb-3">Price Range</h4>
        <div className="flex items-center gap-2">
          <input type="number" placeholder="Min" value={filters.minPrice || ''}
            onChange={(e) => set({ minPrice: e.target.value ? Number(e.target.value) : null })}
            className="w-full px-2 py-1.5 text-sm rounded-lg border border-gray-300 dark:border-brand-border bg-transparent" />
          <span className="text-gray-400">—</span>
          <input type="number" placeholder="Max" value={filters.maxPrice || ''}
            onChange={(e) => set({ maxPrice: e.target.value ? Number(e.target.value) : null })}
            className="w-full px-2 py-1.5 text-sm rounded-lg border border-gray-300 dark:border-brand-border bg-transparent" />
        </div>
      </div>

      <div>
        <h4 className="text-xs uppercase tracking-widest text-gray-400 mb-3">Sort By</h4>
        <select value={filters.sort || 'newest'} onChange={(e) => set({ sort: e.target.value })}
          className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-brand-border bg-transparent">
          <option value="newest">Newest</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
          <option value="rating">Top Rated</option>
        </select>
      </div>
    </aside>
  );
}
