
import React, { useState } from 'react';
import {
  getAllProducts,
  saveAllProducts
} from './marketplaceStorage.js';

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
  const storageKey = `agrosphere_marketplace_products_${profile?.email?.trim().toLowerCase() || 'guest'}`;

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
        farmerEmail: profile?.email?.trim().toLowerCase() || 'guest'
      }));

    if (newProducts.length > 0) {
      saveAllProducts([...sharedProducts, ...newProducts]);
    }

    return getAllProducts().filter(
      product =>
        product.farmerEmail ===
        (profile?.email?.trim().toLowerCase() || 'guest')
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

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (Number(formData.price) <= 0 || Number(formData.quantity) <= 0) {
      setError('Price and quantity must be greater than zero.');
      return;
    }

    const newProduct = {
      id: crypto.randomUUID(),
      ...formData,
      price: Number(formData.price),
      quantity: Number(formData.quantity),
      farmerName: profile?.fullName || 'Marketplace Farmer',
      location: profile?.location || '',
      createdAt: new Date().toISOString()
    };

const productWithOwner = {
  ...newProduct,
  farmerEmail: profile?.email?.trim().toLowerCase() || 'guest'
};

const sharedProducts = getAllProducts();

const updatedProducts = [
  productWithOwner,
  ...sharedProducts
];

saveAllProducts(updatedProducts);

const ownProducts = [
  productWithOwner,
  ...products
];

localStorage.setItem(
  storageKey,
  JSON.stringify(ownProducts)
);

setProducts(ownProducts);

    setFormData({
      name: '',
      category: '',
      description: '',
      price: '',
      quantity: '',
      imageUrl: ''
    });

    setShowForm(false);
  };

const handleDelete = (id) => {
  const updatedProducts = products.filter(
    product => product.id !== id
  );

  const sharedProducts = getAllProducts().filter(
    product =>
      !(
        product.id === id &&
        product.farmerEmail ===
          (profile?.email?.trim().toLowerCase() || 'guest')
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
    <section className="container py-4">

      <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
        <div>
          <h3>My Products</h3>
          <p className="text-secondary mb-0">
            Manage your agricultural product listings.
          </p>
        </div>

        <button
          type="button"
          className="glass-btn-submit"
          onClick={() => setShowForm(!showForm)}
        >
          <i className="fas fa-plus me-2"></i>
          Add Product
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="glass-card p-4 mb-4"
        >
          <h5 className="mb-3">Add New Product</h5>

          <div className="row g-3">

            <div className="col-md-6">
              <label className="form-label">Product Name *</label>
              <input
                className="form-control"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Fresh Tomatoes"
                required
              />
            </div>

            <div className="col-md-6">
              <label className="form-label">Category *</label>
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
              <label className="form-label">Price per KG (₹) *</label>
              <input
                type="number"
                min="0.01"
                step="0.01"
                className="form-control"
                name="price"
                value={formData.price}
                onChange={handleChange}
                required
              />
            </div>

            <div className="col-md-6">
              <label className="form-label">Available Quantity (KG) *</label>
              <input
                type="number"
                min="0.01"
                step="0.01"
                className="form-control"
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                required
              />
            </div>

            <div className="col-12">
              <label className="form-label">Description</label>
              <textarea
                className="form-control"
                name="description"
                rows="3"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe your product..."
              />
            </div>

            <div className="col-12">
              <label className="form-label">Product Image URL (Optional)</label>
              <input
                type="url"
                className="form-control"
                name="imageUrl"
                value={formData.imageUrl}
                onChange={handleChange}
                placeholder="https://example.com/image.jpg"
              />
            </div>

          </div>

          {error && (
            <p className="text-danger mt-3 mb-0">{error}</p>
          )}

          <div className="d-flex gap-2 mt-4">
            <button type="submit" className="glass-btn-submit">
              Save Product
            </button>

            <button
              type="button"
              className="btn-dark-glass-secondary"
              onClick={() => {
                setShowForm(false);
                setError('');
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="row g-4">
        {products.length === 0 ? (
          <div className="col-12">
            <div className="glass-card p-5 text-center">
              <i className="fas fa-box-open fa-3x mb-3"></i>
              <h5>No Products Listed Yet</h5>
              <p className="text-secondary mb-0">
                Add your first agricultural product to get started.
              </p>
            </div>
          </div>
        ) : (
          products.map(product => (
            <div className="col-lg-4 col-md-6" key={product.id}>
              <div className="glass-card h-100 p-3">

                {product.imageUrl && (
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    style={{
                      width: '100%',
                      height: '180px',
                      objectFit: 'cover',
                      borderRadius: '12px'
                    }}
                  />
                )}

                <div className="mt-3">
                  <span className="badge bg-success mb-2">
                    {product.category}
                  </span>

                  <h5>{product.name}</h5>

                  <p className="text-secondary">
                    {product.description || 'No description provided.'}
                  </p>

                  <h5>₹{product.price} / KG</h5>

                  <p className="mb-2">
                    Available: {product.quantity} KG
                  </p>

                  <p className="text-secondary small">
                    {product.location}
                  </p>

                  <button
                    type="button"
                    className="btn btn-outline-danger btn-sm"
                    onClick={() => handleDelete(product.id)}
                  >
                    <i className="fas fa-trash me-1"></i>
                    Delete
                  </button>
                </div>

              </div>
            </div>
          ))
        )}
      </div>

    </section>
  );
}
