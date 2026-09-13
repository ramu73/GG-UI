import React, { useState } from 'react';
import { MessageCircle, MapPin, Sparkles, Check, ChevronDown } from 'lucide-react';
import { PRODUCTS } from '../data/products';
import '../styles/ProductCatalog.css';

export default function ProductCatalog({
  activeCategory,
  onCategoryChange,
  searchQuery,
  translations,
  whatsappNumber = "+919876543210"
}) {
  // Store selected variant per product ID
  const [selectedVariants, setSelectedVariants] = useState(() => {
    const initial = {};
    PRODUCTS.forEach((p) => {
      initial[p.id] = p.defaultVariant;
    });
    return initial;
  });

  const handleVariantChange = (productId, variant) => {
    setSelectedVariants((prev) => ({ ...prev, [productId]: variant }));
  };

  // Filter products by category and search query
  const filteredProducts = PRODUCTS.filter((product) => {
    const matchesCategory =
      activeCategory === 'all' ? true : product.category === activeCategory;

    const matchesSearch = searchQuery
      ? product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.scientificName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.nutrition.some((n) => n.toLowerCase().includes(searchQuery.toLowerCase()))
      : true;

    return matchesCategory && matchesSearch;
  });

  // Construct direct WhatsApp order link
  const createWhatsAppOrderLink = (product) => {
    const variant = selectedVariants[product.id] || product.defaultVariant;
    const price = product.pricing[variant];
    const message = encodeURIComponent(
      `Hello Godavari Grown! 🍄\nI would like to order:\n- Product: ${product.name}\n- Pack Size / Variant: ${variant}\n- Price: ₹${price}\n- Region: ${product.deliveryRegion}\n\nPlease share availability and payment details.`
    );
    return `https://wa.me/${whatsappNumber.replace(/[^0-9]/g, '')}?text=${message}`;
  };

  return (
    <section id="products" className="products-section">
      <div className="container">
        {/* Section Header */}
        <div className="section-header">
          <span className="section-tag">Pure Harvest Collection</span>
          <h2>Farm-Fresh Mushrooms & Wellness Superfoods</h2>
          <p>
            Cultivated without synthetic pesticides. Delivered fresh within 24 hours in East & West Godavari, with pan-India courier shipping for DIY grow kits and medicinal extracts.
          </p>
        </div>

        {/* Category Filter Tabs */}
        <div className="category-tabs">
          <button
            className={`category-tab-btn ${activeCategory === 'all' ? 'active' : ''}`}
            onClick={() => onCategoryChange('all')}
          >
            {translations.allCategories}
          </button>
          <button
            className={`category-tab-btn ${activeCategory === 'fresh' ? 'active' : ''}`}
            onClick={() => onCategoryChange('fresh')}
          >
            {translations.freshCategory} (Local 24h)
          </button>
          <button
            className={`category-tab-btn ${activeCategory === 'kits' ? 'active' : ''}`}
            onClick={() => onCategoryChange('kits')}
          >
            {translations.kitsCategory}
          </button>
          <button
            className={`category-tab-btn ${activeCategory === 'medicinal' ? 'active' : ''}`}
            onClick={() => onCategoryChange('medicinal')}
          >
            {translations.medicinalCategory}
          </button>
          <button
            className={`category-tab-btn ${activeCategory === 'value-added' ? 'active' : ''}`}
            onClick={() => onCategoryChange('value-added')}
          >
            {translations.valueAddedCategory}
          </button>
        </div>

        {/* Search Results Notice */}
        {searchQuery && (
          <div style={{ textAlign: 'center', marginBottom: '24px', color: 'var(--text-muted)' }}>
            Showing search results for: <strong>"{searchQuery}"</strong> ({filteredProducts.length} items found)
          </div>
        )}

        {/* Products Grid */}
        {filteredProducts.length > 0 ? (
          <div className="products-grid">
            {filteredProducts.map((product) => {
              const currentVariant = selectedVariants[product.id] || product.defaultVariant;
              const currentPrice = product.pricing[currentVariant];

              return (
                <div key={product.id} className="product-card">
                  {/* Image & Badges */}
                  <div className="product-image-container">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="product-img"
                      loading="lazy"
                    />
                    <div className="product-badge-overlay">
                      <span className="badge-pill badge-green">
                        {product.badge}
                      </span>
                    </div>
                    <div className="product-region-tag">
                      <MapPin size={13} />
                      <span>{product.deliveryRegion}</span>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="product-details">
                    <h3 className="product-title">{product.name}</h3>
                    <div className="product-scientific">{product.scientificName}</div>
                    <p className="product-desc">{product.description}</p>

                    {/* Nutrition pills */}
                    <div className="product-nutrition-pills">
                      {product.nutrition.slice(0, 3).map((item, idx) => (
                        <span key={idx} className="nutrition-pill">
                          {item}
                        </span>
                      ))}
                    </div>

                    {/* Pricing and Variant selector */}
                    <div className="product-pricing-box">
                      <div className="variant-selector-row">
                        <select
                          className="variant-select"
                          value={currentVariant}
                          onChange={(e) => handleVariantChange(product.id, e.target.value)}
                        >
                          {Object.keys(product.pricing).map((variant) => (
                            <option key={variant} value={variant}>
                              {variant}
                            </option>
                          ))}
                        </select>

                        <div className="product-price">₹{currentPrice}</div>
                      </div>

                      {/* Direct WhatsApp Order */}
                      <a
                        href={createWhatsAppOrderLink(product)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-whatsapp"
                      >
                        <MessageCircle size={16} />
                        <span>{translations.addToWhatsApp}</span>
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="no-results-box">
            <h3 style={{ marginBottom: '8px' }}>No mushrooms found</h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: '18px' }}>
              We couldn't find any varieties matching "{searchQuery}". Try searching for "Milky", "Oyster", "Grow Kit", or "Lion's Mane".
            </p>
            <button className="btn-secondary" onClick={() => onCategoryChange('all')}>
              View All Products
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
