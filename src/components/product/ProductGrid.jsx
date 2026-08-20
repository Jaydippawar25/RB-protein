import ProductCard from './ProductCard';

export default function ProductGrid({ products, wishlist = [], onToggleWishlist }) {
  if (!products?.length) {
    return (
      <div className="py-24 text-center text-gray-500">
        <p className="text-lg font-medium">No products match your filters.</p>
        <p className="text-sm mt-1">Try widening your search or clearing filters.</p>
      </div>
    );
  }
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
      {products.map((p) => (
        <ProductCard key={p.id} product={p} isWishlisted={wishlist.includes(p.id)} onToggleWishlist={onToggleWishlist} />
      ))}
    </div>
  );
}
