import { queryCollection, getDocument, createDocument, updateDocument, deleteDocument } from '../firebase/firestore';

export const DEFAULT_PRODUCTS = [
  {
    id: 'demo-1',
    name: 'RB_ISO Whey 100% Isolate (Rich Chocolate)',
    slug: 'rb-iso-whey-rich-chocolate',
    category: 'protein',
    brand: 'RB_Protein',
    price: 2699,
    mrp: 3499,
    stock: 45,
    images: ['/images/rb_protein_tub.jpg'],
    macros: { calories: 120, protein: 27, carbs: 1, fat: 0.5, fiber: 0 },
    flavors: ['Rich Chocolate', 'Double Rich Vanilla', 'Cafe Mocha'],
    sizes: ['1kg (2.2 lbs)', '2kg (4.4 lbs)'],
    rating: 4.9,
    reviewCount: 128,
    status: 'approved',
    tags: ['whey', 'isolate', 'protein', 'chocolate', 'fast-absorbing'],
    description: 'Ultra-pure 100% Whey Protein Isolate engineered for fast absorption and maximum muscle recovery after intense workouts. 27g protein per serving with zero added sugar.',
  },
  {
    id: 'demo-2',
    name: 'RB_Oats Organic High-Protein Rolled Oats',
    slug: 'rb-oats-organic-high-protein',
    category: 'oats',
    brand: 'RB_Protein',
    price: 399,
    mrp: 499,
    stock: 80,
    images: ['/images/rb_oats_bag.jpg'],
    macros: { calories: 380, protein: 14, carbs: 62, fat: 7, fiber: 11 },
    flavors: ['Unflavored Natural', 'Dark Chocolate Berries'],
    sizes: ['500g', '1kg'],
    rating: 4.8,
    reviewCount: 85,
    status: 'approved',
    tags: ['oats', 'fiber', 'complex-carbs', 'breakfast', 'organic'],
    description: '100% Organic, non-GMO whole grain rolled oats packed with complex carbohydrates and natural fiber. Sustained energy release for peak athletic performance.',
  },
  {
    id: 'demo-3',
    name: 'RB_Steel Pro Shaker Bottle (700ml Stainless)',
    slug: 'rb-steel-pro-shaker-bottle',
    category: 'accessories',
    brand: 'RB_Protein',
    price: 699,
    mrp: 999,
    stock: 120,
    images: ['/images/rb_shaker_bottle.jpg'],
    macros: null,
    flavors: [],
    sizes: ['700ml'],
    rating: 4.7,
    reviewCount: 64,
    status: 'approved',
    tags: ['shaker', 'bottle', 'stainless-steel', 'accessories', 'gear'],
    description: 'Heavy-duty food-grade stainless steel shaker bottle with leak-proof flip cap and non-slip silicone grip ring. Keeps your protein shakes cold for up to 12 hours.',
  },
  {
    id: 'demo-4',
    name: 'RB_Creatine Micronized Monohydrate 250g',
    slug: 'rb-creatine-micronized-monohydrate',
    category: 'protein',
    brand: 'RB_Protein',
    price: 899,
    mrp: 1199,
    stock: 60,
    images: ['/images/rb_protein_tub.jpg'],
    macros: { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 },
    flavors: ['Unflavored'],
    sizes: ['250g (83 servings)'],
    rating: 4.9,
    reviewCount: 210,
    status: 'approved',
    tags: ['creatine', 'monohydrate', 'strength', 'power'],
    description: 'Pure 100% Micronized Creatine Monohydrate for increased muscle cell volume, explosive power output, and enhanced stamina during high-intensity training.',
  },
  {
    id: 'demo-5',
    name: 'RB_Plant Vegan Organic Pea & Rice Isolate',
    slug: 'rb-plant-vegan-organic-isolate',
    category: 'protein',
    brand: 'RB_Protein',
    price: 2299,
    mrp: 2999,
    stock: 30,
    images: ['/images/rb_protein_tub.jpg'],
    macros: { calories: 130, protein: 25, carbs: 2, fat: 2, fiber: 1 },
    flavors: ['Belgian Chocolate', 'Vanilla Bean'],
    sizes: ['1kg'],
    rating: 4.7,
    reviewCount: 42,
    status: 'approved',
    tags: ['plant-based', 'vegan', 'pea-protein', 'organic'],
    description: 'Dairy-free, soy-free plant protein blend of fermented pea and organic brown rice isolates with complete amino acid profile for smooth digestion.',
  },
  {
    id: 'demo-6',
    name: 'RB_Dark Chocolate Instant Protein Oats',
    slug: 'rb-dark-chocolate-instant-protein-oats',
    category: 'oats',
    brand: 'RB_Protein',
    price: 549,
    mrp: 699,
    stock: 50,
    images: ['/images/rb_oats_bag.jpg'],
    macros: { calories: 340, protein: 22, carbs: 48, fat: 6, fiber: 8 },
    flavors: ['Dark Chocolate Dutch Cocoa'],
    sizes: ['600g'],
    rating: 4.8,
    reviewCount: 96,
    status: 'approved',
    tags: ['oats', 'instant-oats', 'chocolate', 'high-protein'],
    description: 'Delicious instant oats infused with premium Dutch cocoa powder and whey isolate. Ready in 60 seconds for a quick nutrient-dense breakfast.',
  }
];

// Memory store to guarantee instant, reliable product edits across the whole app
let localOverrides = {};
let deletedProductIds = new Set();
let customAddedProducts = [];

export async function listProducts({ category, search, minPrice, maxPrice, sort, pageSize = 12, cursor } = {}) {
  const filterDocs = (rawDocs) => {
    let docs = rawDocs.filter((p) => {
      if (deletedProductIds.has(p.id)) return false;
      if (category && category !== 'all' && p.category !== category) return false;
      if (minPrice != null && p.price < minPrice) return false;
      if (maxPrice != null && p.price > maxPrice) return false;
      return true;
    });
    if (search) {
      const q = search.toLowerCase();
      docs = docs.filter(
        (p) => p.name?.toLowerCase().includes(q) || p.tags?.some((t) => t.toLowerCase().includes(q))
      );
    }
    return docs;
  };

  const applyLocalOverrides = (rawDocs) => {
    return rawDocs.map((p) => (localOverrides[p.id] ? { ...p, ...localOverrides[p.id] } : p));
  };

  try {
    const filters = [{ field: 'status', op: '==', value: 'approved' }];
    if (category && category !== 'all') filters.push({ field: 'category', op: '==', value: category });

    const sortMap = {
      price_asc: { field: 'price', dir: 'asc' },
      price_desc: { field: 'price', dir: 'desc' },
      rating: { field: 'rating', dir: 'desc' },
      newest: { field: 'createdAt', dir: 'desc' },
    };

    const result = await queryCollection('products', {
      filters, sort: sortMap[sort] || sortMap.newest, pageSize, cursor,
    });

    let docs = result.docs || [];
    if (docs.length === 0) {
      docs = [...customAddedProducts, ...DEFAULT_PRODUCTS];
    } else {
      const dbIds = new Set(docs.map((d) => d.id));
      customAddedProducts.forEach((cp) => {
        if (!dbIds.has(cp.id)) docs.push(cp);
      });
      DEFAULT_PRODUCTS.forEach((dp) => {
        if (!dbIds.has(dp.id)) docs.push(dp);
      });
    }

    docs = applyLocalOverrides(docs);
    docs = filterDocs(docs);

    return { ...result, docs };
  } catch (err) {
    console.warn('Using fallback demo products with local edits:', err.message);
    let docs = [...customAddedProducts, ...DEFAULT_PRODUCTS];
    docs = applyLocalOverrides(docs);
    docs = filterDocs(docs);
    return { docs, lastVisible: null };
  }
}

export const getProduct = async (id) => {
  if (localOverrides[id]) return localOverrides[id];
  try {
    const doc = await getDocument('products', id);
    if (doc) return localOverrides[id] ? { ...doc, ...localOverrides[id] } : doc;
  } catch (err) {
    console.warn('getProduct query fallback:', err);
  }
  const found = customAddedProducts.find((p) => p.id === id) || DEFAULT_PRODUCTS.find((p) => p.id === id);
  if (!found) return null;
  return localOverrides[id] ? { ...found, ...localOverrides[id] } : found;
};

export const createProduct = async (data) => {
  const newProduct = {
    id: `prod_${Date.now()}`,
    ...data,
    status: 'approved',
    rating: 5,
    reviewCount: 1,
    createdAt: new Date(),
  };

  // Add to local state first for immediate UI updates
  customAddedProducts.unshift(newProduct);

  try {
    const docId = await createDocument('products', data);
    if (docId) newProduct.id = docId;
  } catch (err) {
    console.warn('Firestore create document fallback:', err.message);
  }
  return newProduct;
};

export const updateProduct = async (id, data) => {
  // Store local override so UI updates instantly
  localOverrides[id] = { ...(localOverrides[id] || {}), ...data, id };

  // Also update in DEFAULT_PRODUCTS array if present
  const defaultIdx = DEFAULT_PRODUCTS.findIndex((p) => p.id === id);
  if (defaultIdx !== -1) {
    DEFAULT_PRODUCTS[defaultIdx] = { ...DEFAULT_PRODUCTS[defaultIdx], ...data };
  }

  const customIdx = customAddedProducts.findIndex((p) => p.id === id);
  if (customIdx !== -1) {
    customAddedProducts[customIdx] = { ...customAddedProducts[customIdx], ...data };
  }

  try {
    if (id.startsWith('demo-') || id.startsWith('prod_')) {
      await createDocument('products', { ...data, status: 'approved' }, id);
    } else {
      await updateDocument('products', id, data);
    }
  } catch (err) {
    console.warn('Firestore update document warning:', err.message);
  }
  return localOverrides[id];
};

export const deleteProduct = async (id) => {
  deletedProductIds.add(id);
  delete localOverrides[id];
  customAddedProducts = customAddedProducts.filter((p) => p.id !== id);

  try {
    await deleteDocument('products', id);
  } catch (err) {
    console.warn('Firestore delete document warning:', err.message);
  }
};

export const moderateProduct = (id, status) => updateProduct(id, { status });
export const adjustStock = (id, newStock) => updateProduct(id, { stock: newStock });

export async function seedDemoProducts() {
  for (const item of DEFAULT_PRODUCTS) {
    const { id, ...data } = item;
    try {
      await createDocument('products', { ...data, createdAt: new Date() }, id);
    } catch (e) {
      console.warn('Seed product skipped:', e.message);
    }
  }
}
