
import React, { useState } from 'react';
import {
  getAllProducts,
  saveAllProducts
} from './marketplaceStorage.js';
import './FarmerProducts.css';

const PRODUCT_CATEGORIES = [
  'Vegetables',
  'Fruits',
  'Grains & Cereals',
  'Pulses',
  'Spices',
  'Oilseeds',
  'Other'
];

export default function FarmerProducts({ profile }) {
  const farmerEmail =
    profile?.email?.trim().toLowerCase() || 'guest';

  const storageKey =
    `agrosphere_marketplace_products_${farmerEmail}`;

  const [products, setProducts] = useState(() => {
    try {
      const ownProducts = JSON.parse(
        localStorage.getItem(storageKey) || '[]'
      );

      const sharedProducts = getAllProducts();

      const existingIds = new Set(
        sharedProducts.map(product => product.id)
      );

      const newProducts = ownProducts
        .filter(product => !existingIds.has(product.id))
        .map(product => ({
          ...product,
          farmerEmail
        }));

      if (newProducts.length > 0) {
        saveAllProducts([
          ...sharedProducts,
          ...newProducts
        ]);
      }

      return getAllProducts().filter(
        product => product.farmerEmail === farmerEmail
      );
    } catch {
      return [];
    }
  });

  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    category: '',
    description: '',
    price: '',
    quantity: '',
    imageUrl: ''
  });

  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Product image upload
  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/webp'
    ];

    if (!allowedTypes.includes(file.type)) {
      setError('Please upload JPG, PNG or WEBP image.');
      e.target.value = '';
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setError('Image size must be less than 2 MB.');
      e.target.value = '';
      return;
    }

    const reader = new FileReader();

    reader.onloadend = () => {
      setFormData(prev => ({
        ...prev,
        imageUrl: reader.result
      }));

      setError('');
    };

    reader.onerror = () => {
      setError('Unable to read image. Please try again.');
    };

    reader.readAsDataURL(file);
  };

  // Remove selected image
  const handleRemoveImage = () => {
    setFormData(prev => ({
      ...prev,
      imageUrl: ''
    }));
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      name: '',
      category: '',
      description: '',
      price: '',
      quantity: '',
      imageUrl: ''
    });

    setError('');
  };

  // Save product
  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (
      Number(formData.price) <= 0 ||
      Number(formData.quantity) <= 0
    ) {
      setError(
        'Price and quantity must be greater than zero.'
      );
      return;
    }

    const newProduct = {
      id: crypto.randomUUID(),
      ...formData,
      price: Number(formData.price),
      quantity: Number(formData.quantity),
      farmerName: profile?.fullName || 'Marketplace Farmer',
      farmerEmail,
      location: profile?.location || '',
      createdAt: new Date().toISOString()
    };

    const sharedProducts = getAllProducts();

    const updatedSharedProducts = [
      newProduct,
      ...sharedProducts
    ];

    saveAllProducts(updatedSharedProducts);

    const updatedOwnProducts = [
      newProduct,
      ...products
    ];

    localStorage.setItem(
      storageKey,
      JSON.stringify(updatedOwnProducts)
    );

    setProducts(updatedOwnProducts);

    resetForm();
    setShowForm(false);
  };

  // Delete product
  const handleDelete = (id) => {
    const confirmed = window.confirm(
      'Are you sure you want to delete this product?'
    );

    if (!confirmed) return;

    const updatedProducts = products.filter(
      product => product.id !== id
    );

    const sharedProducts = getAllProducts().filter(
      product => !(
        product.id === id &&
        product.farmerEmail === farmerEmail
      )
    );

    saveAllProducts(sharedProducts);

    localStorage.setItem(
      storageKey,
      JSON.stringify(updatedProducts)
    );

    setProducts(updatedProducts);
  };

  return (
    <section className="container py-4 farmer-products-page">

      {/* Page Header */}
      <div className="farmer-products-header">
        <div>
          <span className="farmer-products-eyebrow">
            FARMER INVENTORY
          </span>

          <h3>My Products</h3>

          <p className="mb-0">
            Manage your agricultural product listings.
          </p>
        </div>

        <button
          type="button"
          className="farmer-add-product-btn"
          onClick={() => {
            setShowForm(!showForm);
            setError('');
          }}
        >
          <i className="fas fa-plus me-2"></i>
          Add Product
        </button>
      </div>

      {/* Add Product Form */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="farmer-product-form"
        >
          <div className="farmer-product-form-header">
            <h5>
              <i className="fas fa-seedling me-2"></i>
              Add New Product
            </h5>

            <p>
              Provide product details to list your fresh
              agricultural produce.
            </p>
          </div>

          <div className="row g-3">

            <div className="col-md-6">
              <label className="form-label">
                Product Name *
              </label>

              <input
                type="text"
                className="form-control"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Fresh Tomatoes"
                required
              />
            </div>

            <div className="col-md-6">
              <label className="form-label">
                Category *
              </label>

              <select
                className="form-select"
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
              >
                <option value="">Select category</option>

                {PRODUCT_CATEGORIES.map(category => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-md-6">
              <label className="form-label">
                Price per KG (₹) *
              </label>

              <input
                type="number"
                min="0.01"
                step="0.01"
                className="form-control"
                name="price"
                value={formData.price}
                onChange={handleChange}
                placeholder="Enter selling price"
                required
              />
            </div>

            <div className="col-md-6">
              <label className="form-label">
                Available Quantity (KG) *
              </label>

              <input
                type="number"
                min="0.01"
                step="0.01"
                className="form-control"
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                placeholder="Enter available stock"
                required
              />
            </div>

            <div className="col-12">
              <label className="form-label">
                Product Description
              </label>

              <textarea
                className="form-control"
                name="description"
                rows="3"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe quality, freshness and other details..."
              />
            </div>

            {/* Image Upload */}
            <div className="col-12">
              <label className="form-label">
                Product Image
                <span className="text-secondary ms-2">
                  (Optional)
                </span>
              </label>

              {!formData.imageUrl ? (
                <label className="farmer-image-upload">
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    onChange={handleImageUpload}
                    hidden
                  />

                  <i className="fas fa-cloud-arrow-up"></i>

                  <strong>
                    Click to upload product image
                  </strong>

                  <span>
                    PNG, JPG or WEBP (Maximum 2 MB)
                  </span>
                </label>
              ) : (
                <div className="farmer-upload-preview">
                  <img
                    src={formData.imageUrl}
                    alt="Product preview"
                  />

                  <div>
                    <strong>Image selected</strong>

                    <p className="mb-2">
                      Your product image is ready.
                    </p>

                    <button
                      type="button"
                      onClick={handleRemoveImage}
                    >
                      <i className="fas fa-trash me-2"></i>
                      Remove Image
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>

          {error && (
            <p className="farmer-product-error">
              <i className="fas fa-circle-exclamation me-2"></i>
              {error}
            </p>
          )}

          <div className="farmer-product-form-actions">
            <button
              type="submit"
              className="farmer-save-product-btn"
            >
              <i className="fas fa-check me-2"></i>
              Save Product
            </button>

            <button
              type="button"
              className="farmer-cancel-product-btn"
              onClick={() => {
                setShowForm(false);
                resetForm();
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Product Listings */}
      <div className="row g-4">

        {products.length === 0 ? (
          <div className="col-12">
            <div className="farmer-products-empty">
              <i className="fas fa-box-open"></i>

              <h5>No Products Listed Yet</h5>

              <p>
                Add your first agricultural product to get started.
              </p>

              <button
                type="button"
                className="farmer-add-product-btn"
                onClick={() => setShowForm(true)}
              >
                <i className="fas fa-plus me-2"></i>
                Add Your First Product
              </button>
            </div>
          </div>
        ) : (
          products.map(product => (
            <div
              className="col-lg-4 col-md-6"
              key={product.id}
            >
              <article className="farmer-product-card">

                {/* Product Image */}
                {product.imageUrl ? (
                  <div className="farmer-product-image-wrapper">
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="farmer-product-card-image"
                    />
                  </div>
                ) : (
                  <div className="farmer-product-image-placeholder">
                    <i className="fas fa-seedling"></i>
                    <span>No product image</span>
                  </div>
                )}

                {/* Product Information */}
                <div className="farmer-product-card-content">

                  <div className="farmer-product-card-top">
                    <span className="farmer-product-category">
                      {product.category}
                    </span>

                    <span className="farmer-product-stock">
                      <i className="fas fa-circle"></i>
                      Available
                    </span>
                  </div>

                  <h5>{product.name}</h5>

                  <p className="farmer-product-description">
                    {product.description ||
                      'No description provided.'}
                  </p>

                  {/* Price and Quantity */}
                  <div className="farmer-product-price-row">

                    <div>
                      <span className="farmer-product-info-label">
                        Selling Price
                      </span>

                      <h4 className="farmer-product-price">
                        ₹{Number(product.price).toLocaleString('en-IN')}
                        <small> / KG</small>
                      </h4>
                    </div>

                    <div className="farmer-product-stock-info">
                      <span className="farmer-product-info-label">
                        Available Stock
                      </span>

                      <h6 className="farmer-product-quantity">
                        {product.quantity} KG
                      </h6>
                    </div>

                  </div>

                  {/* Location */}
                  <div className="farmer-product-location">
                    <i className="fas fa-location-dot"></i>

                    <span>
                      {product.location ||
                        'Location not specified'}
                    </span>
                  </div>

                  {/* Delete */}
                  <button
                    type="button"
                    className="farmer-product-delete-btn"
                    onClick={() => handleDelete(product.id)}
                  >
                    <i className="fas fa-trash me-2"></i>
                    Delete Product
                  </button>

                </div>
              </article>
            </div>
          ))
        )}

      </div>

    </section>
  );
}
