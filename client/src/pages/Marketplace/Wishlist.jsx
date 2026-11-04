
import React, { useEffect, useMemo, useState } from 'react';
import { getAllProducts } from './marketplaceStorage';
import './Wishlist.css';

const WISHLIST_PREFIX = 'agrosphere_marketplace_wishlist_';

const getProductId = (product) =>
  String(product?.id ?? product?.productId ?? product?._id ?? '');

const getBuyerKey = (profile) =>
  String(profile?.email ?? profile?.userEmail ?? profile?.id ?? 'guest')
    .trim()
    .toLowerCase();

const getProductName = (product) =>
  product?.name ?? product?.productName ?? product?.title ?? 'Unnamed Product';

const getProductPrice = (product) =>
  Number(product?.price ?? product?.sellingPrice ?? 0);

const getProductImage = (product) =>
  product?.imageUrl ?? product?.image ?? product?.imageURL ?? '';

export default function Wishlist({ profile, onBack }) {
  const buyerKey = getBuyerKey(profile);
  const storageKey = `${WISHLIST_PREFIX}${buyerKey}`;

  const [products, setProducts] = useState([]);
  const [wishlistIds, setWishlistIds] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey) || '[]');
      return Array.isArray(saved) ? saved.map(String) : [];
    } catch {
      return [];
    }
  });
  const [search, setSearch] = useState('');

  useEffect(() => {
    try {
      const allProducts = getAllProducts();
      setProducts(Array.isArray(allProducts) ? allProducts : []);
    } catch (error) {
      console.error('Unable to load marketplace products:', error);
      setProducts([]);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(wishlistIds));
  }, [storageKey, wishlistIds]);

  const wishlistProducts = useMemo(() => {
    return products.filter((product) =>
      wishlistIds.includes(getProductId(product))
    );
  }, [products, wishlistIds]);

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return wishlistProducts;

    return wishlistProducts.filter((product) => {
      const searchableText = [
        getProductName(product),
        product?.category,
        product?.farmerName,
        product?.farmer?.name,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return searchableText.includes(query);
    });
  }, [wishlistProducts, search]);

  const removeFromWishlist = (productId) => {
    setWishlistIds((current) =>
      current.filter((id) => id !== String(productId))
    );
  };

  const clearWishlist = () => {
    if (window.confirm('Are you sure you want to clear your wishlist?')) {
      setWishlistIds([]);
    }
  };

  return (
    <div className="wishlist-page">
      <div className="wishlist-header">
        <div>
          <span className="wishlist-eyebrow">YOUR COLLECTION</span>
          <h2>My Wishlist</h2>
          <p>Keep your favourite farm products saved in one place.</p>
        </div>

        <div className="wishlist-header-actions">
          <button
            type="button"
            className="wishlist-back-btn"
            onClick={onBack}
          >
            ← Back to Dashboard
          </button>

          {wishlistProducts.length > 0 && (
            <button
              type="button"
              className="wishlist-clear-btn"
              onClick={clearWishlist}
            >
              Clear Wishlist
            </button>
          )}
        </div>
      </div>

      <div className="wishlist-stats">
        <div className="wishlist-stat-card">
          <span>Saved Products</span>
          <strong>{wishlistProducts.length}</strong>
        </div>
      </div>

      <div className="wishlist-toolbar">
        <input
          type="search"
          placeholder="Search saved products..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          aria-label="Search wishlist"
        />
      </div>

      {filteredProducts.length === 0 ? (
        <div className="wishlist-empty">
          <div className="wishlist-empty-icon">♡</div>
          <h3>
            {wishlistProducts.length === 0
              ? 'Your wishlist is empty'
              : 'No matching products found'}
          </h3>
          <p>
            {wishlistProducts.length === 0
              ? 'Explore the marketplace and save products you like.'
              : 'Try searching with a different product name or category.'}
          </p>

          {wishlistProducts.length === 0 && (
            <button
              type="button"
              className="wishlist-primary-btn"
              onClick={onBack}
            >
              Explore Marketplace
            </button>
          )}
        </div>
      ) : (
        <div className="wishlist-grid">
          {filteredProducts.map((product) => {
            const productId = getProductId(product);
            const image = getProductImage(product);

            return (
              <article className="wishlist-product-card" key={productId}>
                <div className="wishlist-product-image">
                  {image ? (
                    <img src={image} alt={getProductName(product)} />
                  ) : (
                    <div className="wishlist-image-placeholder">
                      🌾
                    </div>
                  )}

                  <span className="wishlist-heart">♥</span>
                </div>

                <div className="wishlist-product-info">
                  <span className="wishlist-category">
                    {product?.category || 'Farm Product'}
                  </span>

                  <h3>{getProductName(product)}</h3>

                  <p className="wishlist-farmer">
                    Farmer: {product?.farmerName || product?.farmer?.name || 'Local Farmer'}
                  </p>

                  <div className="wishlist-product-footer">
                    <strong>
                      ₹{getProductPrice(product).toLocaleString('en-IN')}
                    </strong>

                    <button
                      type="button"
                      className="wishlist-remove-btn"
                      onClick={() => removeFromWishlist(productId)}
                      aria-label={`Remove ${getProductName(product)} from wishlist`}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
