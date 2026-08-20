import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { FiUploadCloud, FiLayout, FiType, FiCheck, FiNavigation, FiInfo, FiZap, FiTag, FiShoppingBag } from 'react-icons/fi';
import { getSiteContent, updateSiteContent, DEFAULT_SITE_CONTENT } from '../../services/siteContentService';
import { uploadFile } from '../../firebase/storage';
import Loader from '../../components/common/Loader';

export default function SiteContentManagement() {
  const [content, setContent] = useState(DEFAULT_SITE_CONTENT);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingHero, setUploadingHero] = useState(false);

  useEffect(() => {
    (async () => {
      const data = await getSiteContent();
      setContent(data);
      setLoading(false);
    })();
  }, []);

  const handleHeroImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingHero(true);

    const reader = new FileReader();
    reader.onload = async () => {
      const base64Data = reader.result;
      try {
        const path = `site/${Date.now()}_${file.name}`;
        const url = await uploadFile(path, file);
        setContent((prev) => ({ ...prev, heroImage: url }));
        toast.success('Hero image uploaded to Cloud Storage!');
      } catch (err) {
        console.warn('Firebase Storage upload fallback to Base64:', err.message);
        setContent((prev) => ({ ...prev, heroImage: base64Data }));
        toast.success('Device image saved!');
      } finally {
        setUploadingHero(false);
      }
    };
    reader.onerror = () => {
      toast.error('Failed to read image file');
      setUploadingHero(false);
    };
    reader.readAsDataURL(file);
  };

  const handleDealFieldChange = (index, field, value) => {
    setContent((prev) => {
      const deals = [...(prev.heroDeals || DEFAULT_SITE_CONTENT.heroDeals)];
      deals[index] = { ...deals[index], [field]: value };
      
      // Auto-calculate discount string if price & mrp change
      if (field === 'price' || field === 'mrp') {
        const p = Number(field === 'price' ? value : deals[index].price);
        const m = Number(field === 'mrp' ? value : deals[index].mrp);
        if (m > 0 && m > p) {
          deals[index].discount = `${Math.round(((m - p) / m) * 100)}% OFF`;
        }
      }
      return { ...prev, heroDeals: deals };
    });
  };

  const handleDealImageUpload = (index, e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async () => {
      const base64Data = reader.result;
      try {
        const path = `site/deal_${index}_${Date.now()}_${file.name}`;
        const url = await uploadFile(path, file);
        handleDealFieldChange(index, 'image', url);
        toast.success(`Deal ${index + 1} image uploaded!`);
      } catch (err) {
        handleDealFieldChange(index, 'image', base64Data);
        toast.success(`Deal ${index + 1} image saved!`);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateSiteContent(content);
      toast.success('Website content, Top Seller, Hot Deal & Trending Gear cards updated!');
    } catch (err) {
      toast.error('Failed to save website content: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loader label="Loading website settings..." />;

  const deals = content.heroDeals?.length === 3 ? content.heroDeals : DEFAULT_SITE_CONTENT.heroDeals;

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* Header Bar */}
      <div>
        <h1 className="font-display font-bold text-3xl">Website Content & Design Manager</h1>
        <p className="text-gray-500 text-sm mt-1">
          Customize website text, hero banner images, top sellers, hot deals, and trending gear showcase cards.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* 1. Top Seller, Hot Deal, Trending Gear Management */}
        <div className="card p-6 space-y-6 shadow-card border border-gray-200 dark:border-brand-border">
          <div className="flex items-center gap-2 pb-3 border-b border-gray-200 dark:border-brand-border text-brand-green-500 font-bold">
            <FiZap size={18} />
            <h2 className="text-base">Top Seller, Hot Deal & Trending Gear Featured Cards</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {deals.map((deal, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-gray-50 dark:bg-brand-surface/70 border border-gray-200 dark:border-brand-border space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-brand-green-500">
                    Card #{idx + 1} ({deal.badge || 'DEAL'})
                  </span>
                </div>

                {/* Deal Image Upload & Preview */}
                <div>
                  <label className="block text-[10px] uppercase font-bold text-gray-500 mb-1">Card Image</label>
                  <div className="flex items-center gap-2">
                    <div className="h-14 w-14 rounded-xl overflow-hidden bg-brand-charcoal border border-brand-border shrink-0">
                      <img src={deal.image || '/images/rb_protein_tub.jpg'} alt="Preview" className="h-full w-full object-cover" />
                    </div>
                    <label className="btn-outline text-[10px] py-1.5 px-2 flex items-center justify-center gap-1 cursor-pointer font-semibold flex-1">
                      <FiUploadCloud size={13} />
                      <span>Upload Image</span>
                      <input type="file" accept="image/*" onChange={(e) => handleDealImageUpload(idx, e)} className="hidden" />
                    </label>
                  </div>
                  <input
                    type="text"
                    placeholder="Image URL"
                    value={deal.image || ''}
                    onChange={(e) => handleDealFieldChange(idx, 'image', e.target.value)}
                    className="w-full mt-1.5 px-2.5 py-1.5 text-[11px] rounded-lg border border-gray-300 dark:border-brand-border bg-transparent focus:border-brand-green-500 focus:outline-none"
                  />
                </div>

                {/* Badge Text */}
                <div>
                  <label className="block text-[11px] font-semibold text-gray-400 mb-1">Badge Tag</label>
                  <input
                    type="text"
                    placeholder="TOP SELLER"
                    value={deal.badge || ''}
                    onChange={(e) => handleDealFieldChange(idx, 'badge', e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs font-bold text-brand-green-500 uppercase rounded-xl border border-gray-300 dark:border-brand-border bg-transparent focus:border-brand-green-500 focus:outline-none"
                  />
                </div>

                {/* Product Title */}
                <div>
                  <label className="block text-[11px] font-semibold text-gray-400 mb-1">Product Title</label>
                  <input
                    type="text"
                    placeholder="RB_ISO Whey..."
                    value={deal.title || ''}
                    onChange={(e) => handleDealFieldChange(idx, 'title', e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs font-bold rounded-xl border border-gray-300 dark:border-brand-border bg-transparent focus:border-brand-green-500 focus:outline-none"
                  />
                </div>

                {/* Tagline / Subtitle */}
                <div>
                  <label className="block text-[11px] font-semibold text-gray-400 mb-1">Subtitle / Tagline</label>
                  <input
                    type="text"
                    placeholder="27g Protein · 0g Sugar"
                    value={deal.tagline || ''}
                    onChange={(e) => handleDealFieldChange(idx, 'tagline', e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs rounded-xl border border-gray-300 dark:border-brand-border bg-transparent focus:border-brand-green-500 focus:outline-none"
                  />
                </div>

                {/* Price & MRP */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-semibold text-gray-400 mb-1">Price (₹)</label>
                    <input
                      type="number"
                      placeholder="2699"
                      value={deal.price || ''}
                      onChange={(e) => handleDealFieldChange(idx, 'price', e.target.value)}
                      className="w-full px-2 py-1.5 text-xs font-bold text-brand-green-500 rounded-xl border border-gray-300 dark:border-brand-border bg-transparent focus:border-brand-green-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-gray-400 mb-1">MRP (₹)</label>
                    <input
                      type="number"
                      placeholder="3499"
                      value={deal.mrp || ''}
                      onChange={(e) => handleDealFieldChange(idx, 'mrp', e.target.value)}
                      className="w-full px-2 py-1.5 text-xs rounded-xl border border-gray-300 dark:border-brand-border bg-transparent focus:border-brand-green-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Discount Badge */}
                <div>
                  <label className="block text-[10px] font-semibold text-gray-400 mb-1">Discount Tag</label>
                  <input
                    type="text"
                    placeholder="23% OFF"
                    value={deal.discount || ''}
                    onChange={(e) => handleDealFieldChange(idx, 'discount', e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs font-semibold text-red-400 rounded-xl border border-gray-300 dark:border-brand-border bg-transparent focus:border-brand-green-500 focus:outline-none"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 2. Navbar & Brand Settings */}
        <div className="card p-6 space-y-4 shadow-card border border-gray-200 dark:border-brand-border">
          <div className="flex items-center gap-2 pb-3 border-b border-gray-200 dark:border-brand-border text-brand-green-500 font-bold">
            <FiNavigation size={18} />
            <h2 className="text-base">Navbar & Brand Logo Customization</h2>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Brand Name / Title</label>
              <input
                type="text"
                value={content.brandName}
                onChange={(e) => setContent({ ...content, brandName: e.target.value })}
                className="w-full px-4 py-2.5 text-sm font-extrabold rounded-xl border border-gray-300 dark:border-brand-border bg-transparent focus:border-brand-green-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Logo Badge Abbreviation</label>
              <input
                type="text"
                value={content.logoBadgeText}
                onChange={(e) => setContent({ ...content, logoBadgeText: e.target.value })}
                className="w-full px-4 py-2.5 text-sm font-bold text-brand-green-500 rounded-xl border border-gray-300 dark:border-brand-border bg-transparent focus:border-brand-green-500 focus:outline-none uppercase"
              />
            </div>
          </div>
        </div>

        {/* 3. Homepage Hero Banner Section */}
        <div className="card p-6 space-y-4 shadow-card border border-gray-200 dark:border-brand-border">
          <div className="flex items-center gap-2 pb-3 border-b border-gray-200 dark:border-brand-border text-brand-green-500 font-bold">
            <FiLayout size={18} />
            <h2 className="text-base">Homepage Hero Banner Section</h2>
          </div>

          {/* Hero Image Upload & Preview */}
          <div>
            <label className="block text-xs uppercase font-bold tracking-wider text-gray-500 mb-2">
              Hero Banner Image
            </label>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="h-28 w-40 rounded-xl overflow-hidden bg-gray-100 dark:bg-brand-charcoal border border-gray-300 dark:border-brand-border shrink-0">
                <img src={content.heroImage || '/images/rb_protein_tub.jpg'} alt="Hero Preview" className="h-full w-full object-cover" />
              </div>
              <div className="space-y-2 flex-1 w-full sm:w-auto">
                <label className="btn-outline text-xs py-2 px-4 flex items-center justify-center gap-2 cursor-pointer font-semibold w-full sm:w-auto">
                  <FiUploadCloud size={16} />
                  {uploadingHero ? 'Uploading Image…' : 'Upload Hero Image from Device'}
                  <input type="file" accept="image/*" onChange={handleHeroImageUpload} className="hidden" />
                </label>
                <div>
                  <label className="block text-[11px] font-semibold text-gray-500 mb-1">Image URL</label>
                  <input
                    type="text"
                    value={content.heroImage}
                    onChange={(e) => setContent({ ...content, heroImage: e.target.value })}
                    placeholder="/images/rb_protein_tub.jpg or https://..."
                    className="w-full px-3 py-2 text-xs rounded-xl border border-gray-300 dark:border-brand-border bg-transparent focus:border-brand-green-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Hero Main Headline */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Main Hero Headline Text</label>
            <input
              type="text"
              value={content.heroTitle}
              onChange={(e) => setContent({ ...content, heroTitle: e.target.value })}
              className="w-full px-4 py-2.5 text-base font-extrabold rounded-xl border border-gray-300 dark:border-brand-border bg-transparent focus:border-brand-green-500 focus:outline-none"
            />
          </div>

          {/* Hero Subtitle Text */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Hero Subtitle Paragraph Text</label>
            <textarea
              rows={3}
              value={content.heroSubtitle}
              onChange={(e) => setContent({ ...content, heroSubtitle: e.target.value })}
              className="w-full px-4 py-2.5 text-xs rounded-xl border border-gray-300 dark:border-brand-border bg-transparent focus:border-brand-green-500 focus:outline-none leading-relaxed"
            />
          </div>

          {/* Hero Button CTA Text */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Hero Button Call-to-Action Text</label>
            <input
              type="text"
              value={content.heroCtaText}
              onChange={(e) => setContent({ ...content, heroCtaText: e.target.value })}
              className="w-full px-4 py-2.5 text-sm font-bold text-brand-green-500 rounded-xl border border-gray-300 dark:border-brand-border bg-transparent focus:border-brand-green-500 focus:outline-none"
            />
          </div>
        </div>

        {/* 4. Announcement Bar & Tagline Section */}
        <div className="card p-6 space-y-4 shadow-card border border-gray-200 dark:border-brand-border">
          <div className="flex items-center gap-2 pb-3 border-b border-gray-200 dark:border-brand-border text-yellow-500 font-bold">
            <FiType size={18} />
            <h2 className="text-base">Top Announcement Bar & Store Taglines</h2>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Top Announcement Bar Banner Text</label>
            <input
              type="text"
              value={content.announcementText}
              onChange={(e) => setContent({ ...content, announcementText: e.target.value })}
              className="w-full px-4 py-2.5 text-xs font-bold text-yellow-500 rounded-xl border border-gray-300 dark:border-brand-border bg-transparent focus:border-brand-green-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Brand Tagline</label>
            <input
              type="text"
              value={content.brandTagline}
              onChange={(e) => setContent({ ...content, brandTagline: e.target.value })}
              className="w-full px-4 py-2.5 text-xs font-semibold rounded-xl border border-gray-300 dark:border-brand-border bg-transparent focus:border-brand-green-500 focus:outline-none"
            />
          </div>
        </div>

        {/* 5. Footer Customization Section */}
        <div className="card p-6 space-y-4 shadow-card border border-gray-200 dark:border-brand-border">
          <div className="flex items-center gap-2 pb-3 border-b border-gray-200 dark:border-brand-border text-blue-400 font-bold">
            <FiInfo size={18} />
            <h2 className="text-base">Footer Customization & Contact Information</h2>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Footer Brand Description Text</label>
            <textarea
              rows={2}
              value={content.footerDescription}
              onChange={(e) => setContent({ ...content, footerDescription: e.target.value })}
              className="w-full px-4 py-2.5 text-xs rounded-xl border border-gray-300 dark:border-brand-border bg-transparent focus:border-brand-green-500 focus:outline-none leading-relaxed"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Support Email</label>
              <input
                type="email"
                value={content.footerContactEmail || ''}
                onChange={(e) => setContent({ ...content, footerContactEmail: e.target.value })}
                className="w-full px-4 py-2 text-xs rounded-xl border border-gray-300 dark:border-brand-border bg-transparent focus:border-brand-green-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Support Phone</label>
              <input
                type="text"
                value={content.footerContactPhone || ''}
                onChange={(e) => setContent({ ...content, footerContactPhone: e.target.value })}
                className="w-full px-4 py-2 text-xs rounded-xl border border-gray-300 dark:border-brand-border bg-transparent focus:border-brand-green-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-brand-green-500 mb-1">Order WhatsApp (DM for Order)</label>
              <input
                type="text"
                value={content.whatsappNumber || ''}
                onChange={(e) => setContent({ ...content, whatsappNumber: e.target.value })}
                placeholder="e.g. 917972940127"
                className="w-full px-4 py-2 text-xs font-bold text-brand-green-500 rounded-xl border border-brand-green-500/40 dark:border-brand-green-500/40 bg-transparent focus:border-brand-green-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Social Media Links */}
          <div className="pt-2 border-t border-gray-200 dark:border-brand-border">
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">
              Social Media Handles & Links
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-gray-400 mb-1">Instagram URL</label>
                <input
                  type="text"
                  placeholder="https://instagram.com/yourhandle"
                  value={content.instagramUrl || ''}
                  onChange={(e) => setContent({ ...content, instagramUrl: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs rounded-xl border border-gray-300 dark:border-brand-border bg-transparent focus:border-brand-green-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-gray-400 mb-1">Twitter / X URL</label>
                <input
                  type="text"
                  placeholder="https://twitter.com/yourhandle"
                  value={content.twitterUrl || ''}
                  onChange={(e) => setContent({ ...content, twitterUrl: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs rounded-xl border border-gray-300 dark:border-brand-border bg-transparent focus:border-brand-green-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-gray-400 mb-1">YouTube URL</label>
                <input
                  type="text"
                  placeholder="https://youtube.com/@yourchannel"
                  value={content.youtubeUrl || ''}
                  onChange={(e) => setContent({ ...content, youtubeUrl: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs rounded-xl border border-gray-300 dark:border-brand-border bg-transparent focus:border-brand-green-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-gray-400 mb-1">Facebook URL</label>
                <input
                  type="text"
                  placeholder="https://facebook.com/yourpage"
                  value={content.facebookUrl || ''}
                  onChange={(e) => setContent({ ...content, facebookUrl: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs rounded-xl border border-gray-300 dark:border-brand-border bg-transparent focus:border-brand-green-500 focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <button
          disabled={saving}
          type="submit"
          className="btn-primary w-full py-3.5 text-base font-bold flex items-center justify-center gap-2 shadow-glow"
        >
          <FiCheck size={18} />
          {saving ? 'Saving Website Content…' : 'Save Website Text & Featured Cards'}
        </button>
      </form>
    </div>
  );
}
