
import React, { useMemo, useState } from 'react';
import {
  getAllProducts,
  getUserCart,
  saveUserCart
} from './marketplaceStorage';

const BuyerProducts = ({ userKey, onBack }) => {
  const [products] = useState(() => getAllProducts());
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [cart, setCart] = useState(() => getUserCart(userKey));

  // Buyer-specific wishlist storage
  const wishlistKey = `agrosphere_marketplace_wishlist_${userKey}`;

  const [wishlist, setWishlist] = useState(() => {
    try {
      const savedWishlist = localStorage.getItem(wishlistKey);
      return savedWishlist ? JSON.parse(savedWishlist) : [];
    } catch {
      return [];
    }
  });

  const categories = [
    'All',
    ...new Set(
      products.map(product => product.category).filter(Boolean)
    )
  ];

  // Search and category filtering
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesSearch =
        product.name?.toLowerCase().includes(search.toLowerCase()) ||
        product.farmerName?.toLowerCase().includes(search.toLowerCase());

      const matchesCategory =
        category === 'All' || product.category === category;

      return matchesSearch && matchesCategory;
    });
  }, [products, search, category]);

  // Add product to cart
  const addToCart = (product) => {
    const existingItem = cart.find(
      item => item.productId === product.id
    );

    let updatedCart;

    if (existingItem) {
      updatedCart = cart.map(item =>
        item.productId === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      );
    } else {
      updatedCart = [
        ...cart,
        {
          productId: product.id,
          name: product.name,
          price: Number(product.price),
          quantity: 1,
          farmerName: product.farmerName,
          farmerEmail: product.farmerEmail,
          imageUrl: product.imageUrl || ''
        }
      ];
    }

    setCart(updatedCart);
    saveUserCart(userKey, updatedCart);
  };

  // Add or remove product from wishlist
  const toggleWishlist = (product) => {
    const productId = product.id;

    const updatedWishlist = wishlist.includes(productId)
      ? wishlist.filter(id => id !== productId)
      : [...wishlist, productId];

    setWishlist(updatedWishlist);

    localStorage.setItem(
      wishlistKey,
      JSON.stringify(updatedWishlist)
    );
  };

  return (
    <main className="marketplace-dashboard">
      <div className="container py-4">

        {/* Header */}
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
          <div>
            <h3>Browse Products</h3>
            <p className="text-secondary mb-0">
              Discover fresh products directly from farmers and FPOs.
            </p>
          </div>

          <button
            type="button"
            className="btn-dark-glass-secondary"
            onClick={onBack}
          >
            <i className="fas fa-arrow-left me-2"></i>
            Back to Dashboard
          </button>
        </div>

        {/* Search and Category Filter */}
        <div className="row g-3 mb-4">
          <div className="col-md-8">
            <input
              type="search"
              className="form-control"
              placeholder="Search products or farmers..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          <div className="col-md-4">
            <select
              className="form-select"
              value={category}
              onChange={e => setCategory(e.target.value)}
            >
              {categories.map(item => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Product Count and Wishlist Count */}
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
          <h5 className="mb-0">Available Products</h5>

          <div className="d-flex gap-3">
            <span className="text-secondary">
              {filteredProducts.length} products found
            </span>

            <span className="text-danger">
              <i className="fas fa-heart me-1"></i>
              {wishlist.length} Saved
            </span>
          </div>
        </div>

        {/* Products */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-5">
            <i className="fas fa-box-open fa-3x text-secondary mb-3"></i>

            <h5>No products found</h5>

            <p className="text-secondary">
              Try another search or category.
            </p>
          </div>
        ) : (
          <div className="row g-4">
            {filteredProducts.map(product => {
              const isWishlisted = wishlist.includes(product.id);

              return (
                <div
                  className="col-sm-6 col-lg-4 col-xl-3"
                  key={product.id}
                >
                  <div className="card h-100 shadow-sm position-relative">

                    {/* Product Image */}
                    {product.imageUrl ? (
                      <img
                        src={product.imageUrl}
                        className="card-img-top"
                        alt={product.name}
                        style={{
                          height: '180px',
                          objectFit: 'cover'
                        }}
                      />
                    ) : (
                      <div
                        className="d-flex align-items-center justify-content-center bg-light"
                        style={{ height: '180px' }}
                      >
                        <i className="fas fa-seedling fa-3x text-success"></i>
                      </div>
                    )}

                    {/* Wishlist Button */}
                    <button
                      type="button"
                      onClick={() => toggleWishlist(product)}
                      className="btn btn-light shadow-sm position-absolute"
                      style={{
                        top: '10px',
                        right: '10px',
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: 'none'
                      }}
                      title={
                        isWishlisted
                          ? 'Remove from Wishlist'
                          : 'Add to Wishlist'
                      }
                      aria-label={
                        isWishlisted
                          ? `Remove ${product.name} from wishlist`
                          : `Add ${product.name} to wishlist`
                      }
                    >
                      <i
                        className={
                          isWishlisted
                            ? 'fas fa-heart text-danger'
                            : 'far fa-heart text-secondary'
                        }
                      ></i>
                    </button>

                    {/* Product Details */}
                    <div className="card-body d-flex flex-column">

                      <span className="badge bg-success align-self-start mb-2">
                        {product.category}
                      </span>

                      <h5 className="card-title">
                        {product.name}
                      </h5>

                      <p className="text-secondary small">
                        {product.description}
                      </p>

                      <p className="mb-1">
                        <strong>
                          ₹{Number(product.price).toLocaleString('en-IN')}
                        </strong>

                        <span className="text-secondary">
                          {' '} / kg
                        </span>
                      </p>

                      <p className="small text-secondary mb-1">
                        Available: {product.quantity} kg
                      </p>

                      <p className="small text-secondary mb-3">
                        Farmer: {product.farmerName}
                      </p>

                      {/* Add to Cart */}
                      <button
                        type="button"
                        className="btn btn-success mt-auto"
                        disabled={Number(product.quantity) <= 0}
                        onClick={() => addToCart(product)}
                      >
                        <i className="fas fa-cart-plus me-2"></i>
                        Add to Cart
                      </button>

                      {/* Wishlist Status */}
                      <button
                        type="button"
                        className="btn btn-link text-decoration-none mt-2 p-1"
                        onClick={() => toggleWishlist(product)}
                      >
                        <i
                          className={
                            isWishlisted
                              ? 'fas fa-heart text-danger me-2'
                              : 'far fa-heart me-2'
                          }
                        ></i>

                        {isWishlisted
                          ? 'Remove from Wishlist'
                          : 'Add to Wishlist'}
                      </button>

                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </main>
  );
};

export default BuyerProducts;
