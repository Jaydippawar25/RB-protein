import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiInstagram, FiTwitter, FiYoutube, FiFacebook, FiMail, FiPhone } from 'react-icons/fi';
import { getSiteContent, DEFAULT_SITE_CONTENT } from '../../services/siteContentService';

export default function Footer() {
  const [siteContent, setSiteContent] = useState(DEFAULT_SITE_CONTENT);

  useEffect(() => {
    getSiteContent().then((data) => {
      if (data) setSiteContent(data);
    });
  }, []);

  const socialLinks = [
    { id: 'instagram', icon: FiInstagram, url: siteContent.instagramUrl, label: 'Instagram' },
    { id: 'twitter', icon: FiTwitter, url: siteContent.twitterUrl, label: 'Twitter / X' },
    { id: 'youtube', icon: FiYoutube, url: siteContent.youtubeUrl, label: 'YouTube' },
    { id: 'facebook', icon: FiFacebook, url: siteContent.facebookUrl, label: 'Facebook' },
  ].filter((s) => Boolean(s.url));

  return (
    <footer className="mt-24 border-t border-gray-200 dark:border-brand-border bg-gray-50 dark:bg-brand-charcoal">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-2 md:grid-cols-4 gap-8">
        <div className="col-span-2 space-y-3">
          <div className="font-display font-bold text-xl">
            {siteContent.brandName || 'RB_PROTEIN'}
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm leading-relaxed">
            {siteContent.footerDescription}
          </p>
          <div className="space-y-1 text-xs text-gray-400 pt-1">
            {siteContent.footerContactEmail && (
              <p className="flex items-center gap-2">
                <FiMail size={14} className="text-brand-green-500" />
                <span>{siteContent.footerContactEmail}</span>
              </p>
            )}
            {siteContent.footerContactPhone && (
              <p className="flex items-center gap-2">
                <FiPhone size={14} className="text-brand-green-500" />
                <span>{siteContent.footerContactPhone}</span>
              </p>
            )}
          </div>
          {socialLinks.length > 0 && (
            <div className="flex items-center gap-2.5 pt-2">
              {socialLinks.map(({ id, icon: Icon, url, label }) => (
                <a
                  key={id}
                  href={url.startsWith('http') ? url : `https://${url}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="h-8 w-8 grid place-items-center rounded-full bg-gray-200 dark:bg-brand-surface border border-gray-300 dark:border-brand-border text-gray-600 dark:text-gray-300 hover:text-brand-black hover:bg-brand-green-500 dark:hover:bg-brand-green-500 dark:hover:text-brand-black transition-all hover:scale-110"
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          )}
        </div>

        <div>
          <h4 className="text-xs uppercase tracking-widest text-gray-400 mb-3 font-bold">Shop Navigation</h4>
          <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300 font-medium">
            <li><Link to="/products" className="hover:text-brand-green-500">All Products</Link></li>
            <li><Link to="/products?category=protein" className="hover:text-brand-green-500">Whey Protein</Link></li>
            <li><Link to="/products?category=oats" className="hover:text-brand-green-500">Protein Oats</Link></li>
            <li><Link to="/macro-calculator" className="hover:text-brand-green-500">Macro Calculator</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-xs uppercase tracking-widest text-gray-400 mb-3 font-bold">Customer Account</h4>
          <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300 font-medium">
            <li><Link to="/orders" className="hover:text-brand-green-500">My Orders</Link></li>
            <li><Link to="/wishlist" className="hover:text-brand-green-500">Wishlist</Link></li>
            <li><Link to="/profile" className="hover:text-brand-green-500">My Profile</Link></li>
            <li><Link to="/login" className="hover:text-brand-green-500">Login / Account</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-gray-200 dark:border-brand-border py-4 text-center text-xs text-gray-400">
        © {new Date().getFullYear()} RB_Protein.developed by JAYDIP.7972940127
      </div>
    </footer>
  );
}
