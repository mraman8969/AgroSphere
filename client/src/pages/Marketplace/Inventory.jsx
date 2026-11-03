
import React, { useState } from 'react';
import {
  getAllProducts,
  saveAllProducts
} from './marketplaceStorage';

import './Inventory.css';

const LOW_STOCK_LIMIT = 10;

export default function Inventory({ profile }) {
  const farmerEmail =
    profile?.email?.trim().toLowerCase() || 'guest';

  const [products, setProducts] = useState(() =>
    getAllProducts().filter(
      (product) =>
        product.farmerEmail?.trim().toLowerCase() === farmerEmail
    )
  );

  const [quantities, setQuantities] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [stockFilter, setStockFilter] = useState('All');
  const [message, setMessage] = useState('');

  const totalProducts = products.length;

  const totalStock = products.reduce(
    (total, product) =>
      total + Math.max(0, Number(product.quantity) || 0),
    0
  );

  const lowStockProducts = products.filter(
    (product) =>
      Number(product.quantity) > 0 &&
      Number(product.quantity) <= LOW_STOCK_LIMIT
  );

  const outOfStockProducts = products.filter(
    (product) => Number(product.quantity) <= 0
  );

  const handleQuantityChange = (productId, value) => {
    setQuantities((prev) => ({
      ...prev,
      [productId]: value
    }));

    setMessage('');
  };

  const handleSaveStock = (productId) => {
    const rawQuantity = quantities[productId];

    if (
      rawQuantity === undefined ||
      rawQuantity === '' ||
      !Number.isFinite(Number(rawQuantity)) ||
      Number(rawQuantity) < 0
    ) {
      setMessage('Please enter a valid stock quantity.');
      return;
    }

    const newQuantity = Number(rawQuantity);

    const allProducts = getAllProducts();

    const updatedAllProducts = allProducts.map((product) => {
      if (
        product.id === productId &&
        product.farmerEmail?.trim().toLowerCase() === farmerEmail
      ) {
        return {
          ...product,
          quantity: newQuantity
        };
      }

      return product;
    });

    saveAllProducts(updatedAllProducts);

    const updatedFarmerProducts = updatedAllProducts.filter(
      (product) =>
        product.farmerEmail?.trim().toLowerCase() === farmerEmail
    );

    setProducts(updatedFarmerProducts);

    setQuantities((prev) => {
      const updated = { ...prev };
      delete updated[productId];
      return updated;
    });

    setMessage('Stock quantity updated successfully.');
  };

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category?.toLowerCase().includes(searchTerm.toLowerCase());

    const quantity = Number(product.quantity) || 0;

    const matchesFilter =
      stockFilter === 'All' ||
      (stockFilter === 'Available' && quantity > LOW_STOCK_LIMIT) ||
      (stockFilter === 'Low Stock' &&
        quantity > 0 &&
        quantity <= LOW_STOCK_LIMIT) ||
      (stockFilter === 'Out of Stock' && quantity <= 0);

    return matchesSearch && matchesFilter;
  });

  const getStockStatus = (quantity) => {
    const stock = Number(quantity) || 0;

    if (stock <= 0) {
      return {
        label: 'Out of Stock',
        className: 'inventory-status-out'
      };
    }

    if (stock <= LOW_STOCK_LIMIT) {
      return {
        label: 'Low Stock',
        className: 'inventory-status-low'
      };
    }

    return {
      label: 'Available',
      className: 'inventory-status-available'
    };
  };

  return (
    <section className="container-fluid py-3 inventory-page">

      <div className="inventory-header mb-4">
        <div>
          <span className="inventory-eyebrow">
            AGROSPHERE MARKETPLACE
          </span>

          <h3>Inventory Management</h3>

          <p className="mb-0">
            Monitor and update your available agricultural stock.
          </p>
        </div>
      </div>

      <div className="row g-3 mb-4">

        <div className="col-12 col-md-4">
          <div className="inventory-stat-card">
            <div className="inventory-stat-icon">
              <i className="fas fa-boxes-stacked"></i>
            </div>

            <div>
              <span>Total Products</span>
              <h4>{totalProducts}</h4>
            </div>
          </div>
        </div>

        <div className="col-12 col-md-4">
          <div className="inventory-stat-card">
            <div className="inventory-stat-icon">
              <i className="fas fa-warehouse"></i>
            </div>

            <div>
              <span>Total Available Stock</span>
              <h4>{totalStock.toLocaleString('en-IN')} KG</h4>
            </div>
          </div>
        </div>

        <div className="col-12 col-md-4">
          <div className="inventory-stat-card">
            <div className="inventory-stat-icon">
              <i className="fas fa-triangle-exclamation"></i>
            </div>

            <div>
              <span>Stock Alerts</span>
              <h4>{lowStockProducts.length + outOfStockProducts.length}</h4>
            </div>
          </div>
        </div>

      </div>

      <div className="inventory-alerts mb-4">

        <div className="inventory-alert-low">
          <i className="fas fa-exclamation-circle"></i>

          <div>
            <strong>{lowStockProducts.length} Low Stock Products</strong>
            <p className="mb-0">
              Products with 1–{LOW_STOCK_LIMIT} KG remaining.
            </p>
          </div>
        </div>

        <div className="inventory-alert-out">
          <i className="fas fa-circle-xmark"></i>

          <div>
            <strong>{outOfStockProducts.length} Out of Stock Products</strong>
            <p className="mb-0">
              Products with zero available quantity.
            </p>
          </div>
        </div>

      </div>

      <div className="inventory-table-card">

        <div className="inventory-toolbar">

          <div>
            <h5 className="mb-1">Product Inventory</h5>
            <p className="mb-0">
              Update the available quantity of your products.
            </p>
          </div>

          <input
            type="search"
            className="form-control inventory-search"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

        </div>

        <div className="inventory-filters">
          {['All', 'Available', 'Low Stock', 'Out of Stock'].map(
            (filter) => (
              <button
                key={filter}
                type="button"
                className={`inventory-filter-btn ${
                  stockFilter === filter ? 'active' : ''
                }`}
                onClick={() => setStockFilter(filter)}
              >
                {filter}
              </button>
            )
          )}
        </div>

        {message && (
          <div className="inventory-message" role="status">
            {message}
          </div>
        )}

        {filteredProducts.length === 0 ? (
          <div className="inventory-empty">
            <i className="fas fa-box-open"></i>

            <h6>No products found</h6>

            <p>
              Add products from My Products or change your search/filter.
            </p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table inventory-table align-middle">

              <thead>
                <tr>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Current Stock</th>
                  <th>Stock Status</th>
                  <th>Update Stock (KG)</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {filteredProducts.map((product) => {
                  const status = getStockStatus(product.quantity);

                  return (
                    <tr key={product.id}>

                      <td>
                        <strong>{product.name}</strong>
                      </td>

                      <td>{product.category || '—'}</td>

                      <td>
                        ₹{Number(product.price || 0).toLocaleString('en-IN')}
                      </td>

                      <td>
                        <strong>
                          {Number(product.quantity) || 0} KG
                        </strong>
                      </td>

                      <td>
                        <span className={`inventory-status ${status.className}`}>
                          {status.label}
                        </span>
                      </td>

                      <td>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          className="form-control inventory-quantity-input"
                          placeholder="Enter quantity"
                          value={
                            quantities[product.id] ??
                            String(Number(product.quantity) || 0)
                          }
                          onChange={(e) =>
                            handleQuantityChange(product.id, e.target.value)
                          }
                        />
                      </td>

                      <td>
                        <button
                          type="button"
                          className="inventory-save-btn"
                          onClick={() => handleSaveStock(product.id)}
                        >
                          <i className="fas fa-save me-1"></i>
                          Save
                        </button>
                      </td>

                    </tr>
                  );
                })}
              </tbody>

            </table>
          </div>
        )}

      </div>

      <p className="inventory-note mt-3">
        Low stock threshold: {LOW_STOCK_LIMIT} KG. Stock changes update
        the shared marketplace product record.
      </p>

    </section>
  );
}
