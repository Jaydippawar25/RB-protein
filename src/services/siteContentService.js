import { doc, setDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { getDocument } from '../firebase/firestore';

export const DEFAULT_SITE_CONTENT = {
  // Navbar & Brand Settings
  brandName: 'RB_PROTEIN',
  logoBadgeText: 'RB',
  navProductLabel: 'All Products',
  navMacroLabel: 'Macro Calculator',

  // Hero Section
  heroTitle: 'PURE POWER. UNCOMPROMISED QUALITY.',
  heroSubtitle: 'Scientifically formulated 100% Whey Protein Isolates, organic oats, and elite athletic supplements engineered for rapid muscle recovery.',
  heroImage: '/images/rb_protein_tub.jpg',
  heroCtaText: 'Explore All Products',

  // Announcement Bar & Tagline
  announcementText: '⚡ FREE EXPRESS SHIPPING ACROSS INDIA ON ALL ORDERS',
  brandTagline: 'RB_PROTEIN — ELITE ATHLETIC NUTRITION',

  // 3 Featured Deal Cards (Top Seller, Hot Deal, Trending Gear)
  heroDeals: [
    {
      id: 'deal-1',
      badge: 'TOP SELLER',
      title: 'RB_ISO Whey 100% Isolate',
      tagline: '27g Protein · 0g Added Sugar',
      price: 2699,
      mrp: 3499,
      discount: '23% OFF',
      image: '/images/rb_protein_tub.jpg',
    },
    {
      id: 'deal-2',
      badge: 'HOT DEAL',
      title: 'RB_Oats Organic High-Protein Oats',
      tagline: '14g Protein · 11g Dietary Fiber',
      price: 399,
      mrp: 499,
      discount: '20% OFF',
      image: '/images/rb_oats_bag.jpg',
    },
    {
      id: 'deal-3',
      badge: 'TRENDING GEAR',
      title: 'RB_Steel Pro 700ml Shaker Bottle',
      tagline: 'Stainless Steel · Insulated Grip',
      price: 699,
      mrp: 999,
      discount: '30% OFF',
      image: '/images/rb_shaker_bottle.jpg',
    },
  ],

  // Footer Settings & Social Media Links
  footerDescription: 'Clean-label protein and oats, dosed and tested for people who actually train.',
  footerContactEmail: 'support@rbprotein.com',
  footerContactPhone: '+91 7972940127',
  whatsappNumber: '917972940127',
  footerCopyrightText: '© 2026 RB_Protein. Website developed by JAYDIP.7972940127',
  instagramUrl: 'https://instagram.com',
  twitterUrl: 'https://twitter.com',
  youtubeUrl: 'https://youtube.com',
  facebookUrl: 'https://facebook.com',
};

let memoryContent = { ...DEFAULT_SITE_CONTENT };

export function formatWhatsAppLink(phone, messageText = '') {
  const num = (phone || memoryContent.whatsappNumber || memoryContent.footerContactPhone || '917972940127').replace(/\D/g, '');
  const cleanPhone = num.length === 10 ? `91${num}` : (num || '917972940127');
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(messageText)}`;
}

export function buildProductWhatsAppLink({ name, price, id, image, flavor, qty = 1, phone = null }) {
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const productLink = id ? `${origin}/products/${id}` : `${origin}/products`;

  let imageUrl = '';
  if (image) {
    if (image.startsWith('http://') || image.startsWith('https://') || image.startsWith('data:')) {
      imageUrl = image;
    } else {
      imageUrl = `${origin}${image.startsWith('/') ? '' : '/'}${image}`;
    }
  }

  const lines = [
    `Hi! I would like to order:`,
    `📦 *Product:* ${name || 'Item'}`,
    flavor ? `🍦 *Flavor:* ${flavor}` : null,
    qty > 1 ? `🔢 *Quantity:* ${qty}` : null,
    `💰 *Price:* ₹${price}${qty > 1 ? ` (Total: ₹${price * qty})` : ''}`,
    productLink ? `🔗 *Product Link:* ${productLink}` : null,
    imageUrl && !imageUrl.startsWith('data:') ? `🖼️ *Product Image:* ${imageUrl}` : null,
  ].filter(Boolean).join('\n');

  return formatWhatsAppLink(phone, lines);
}


export async function getSiteContent() {
  try {
    const snap = await getDocument('settings', 'siteContent');
    if (snap) {
      memoryContent = {
        ...DEFAULT_SITE_CONTENT,
        ...snap,
        heroDeals: snap.heroDeals?.length ? snap.heroDeals : DEFAULT_SITE_CONTENT.heroDeals,
      };
      return memoryContent;
    }
  } catch (err) {
    console.warn('Using default site content fallback:', err.message);
  }
  return memoryContent;
}

export async function updateSiteContent(newContent) {
  memoryContent = { ...memoryContent, ...newContent };
  try {
    const ref = doc(db, 'settings', 'siteContent');
    await setDoc(ref, memoryContent, { merge: true });
  } catch (err) {
    console.warn('Firestore site content update warning:', err.message);
  }
  return memoryContent;
}
