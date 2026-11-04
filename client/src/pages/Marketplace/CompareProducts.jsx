
import React, { useMemo, useState } from 'react';
import { getAllProducts } from './marketplaceStorage';
import './CompareProducts.css';

const getProductId = (product) =>
  String(product?.id ?? product?.productId ?? product?._id ?? '');

const getProductName = (product) =>
  product?.name ?? product?.productName ?? product?.title ?? 'Unnamed Product';

const getPrice = (product) =>
  Number(product?.price ?? product?.sellingPrice ?? 0);

const getFarmerName = (product) =>
  product?.farmerName ?? product?.farmer?.name ?? 'Not specified';

const getStock = (product) =>
  product?.stock ?? product?.quantity ?? product?.availableQuantity;

const getDescription = (product) =>
  product?.description ?? product?.details ?? 'No description available';

const getImage = (product) =>
  product?.imageUrl ?? product?.image ?? product?.imageURL ?? '';

export default function CompareProducts({ profile, onBack }) {
  const [products] = useState(() => {
    try {
      const result = getAllProducts();
      return Array.isArray(result) ? result : [];
    } catch (error) {
      console.error('Unable to load products:', error);
      return [];
    }
  });

  const [selectedIds, setSelectedIds] = useState([]);
  const [search, setSearch] = useState('');

  const selectedProducts = useMemo(
    () =>
      selectedIds
        .map((id) => products.find((product) => getProductId(product) === id))
        .filter(Boolean),
    [products, selectedIds]
  );

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return products;

    return products.filter((product) => {
      const searchable = [
        getProductName(product),
        product?.category,
        getFarmerName(product),
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return searchable.includes(query);
    });
  }, [products, search]);

  const toggleProduct = (product) => {
    const id = getProductId(product);

    if (!id) return;

    setSelectedIds((current) => {
      if (current.includes(id)) {
        return current.filter((item) => item !== id);
      }

      if (current.length >= 3) {
        window.alert('You can compare a maximum of 3 products.');
        return current;
      }

      return [...current, id];
    });
  };

  const clearSelection = () => setSelectedIds([]);

  const comparisonRows = [
    {
      label: 'Price',
      render: (product) => (
        <strong className="compare-price">
          ₹{getPrice(product).toLocaleString('en-IN')}
        </strong>
      ),
    },
    {
      label: 'Category',
      render: (product) => product?.category || 'Not specified',
    },
    {
      label: 'Farmer',
      render: getFarmerName,
    },
    {
      label: 'Availability',
      render: (product) => {
        const stock = getStock(product);

        if (stock === undefined || stock === null || stock === '') {
          return 'Not specified';
        }

        return `${stock} ${product?.unit || 'units'}`;
      },
    },
    {
      label: 'Description',
      render: getDescription,
    },
  ];

  return (
    <div className="compare-products-page">
      <div className="compare-header">
        <div>
          <span className="compare-eyebrow">SMART BUYING DECISION</span>
          <h2>Compare Products</h2>
          <p>Compare farm products side by side before making a purchase.</p>
        </div>

        <button
          type="button"
          className="compare-back-btn"
          onClick={onBack}
        >
          ← Back to Dashboard
        </button>
      </div>

      <div className="compare-summary">
        <div>
          <span>Selected Products</span>
          <strong>{selectedProducts.length}/3</strong>
        </div>

        <button
          type="button"
          className="compare-clear-btn"
          onClick={clearSelection}
          disabled={selectedIds.length === 0}
        >
          Clear Selection
        </button>
      </div>

      <div className="compare-selection-panel">
        <div className="compare-section-heading">
          <div>
            <h3>Select Products</h3>
            <p>Choose up to three products to compare.</p>
          </div>
        </div>

        <input
          type="search"
          className="compare-search"
          placeholder="Search products by name, category or farmer..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          aria-label="Search products"
        />

        {filteredProducts.length === 0 ? (
          <div className="compare-empty">
            <h4>No products found</h4>
            <p>Try another search term.</p>
          </div>
        ) : (
          <div className="compare-product-picker">
            {filteredProducts.map((product) => {
              const id = getProductId(product);
              const selected = selectedIds.includes(id);
              const image = getImage(product);

              return (
                <button
                  type="button"
                  key={id}
                  className={`compare-picker-card ${selected ? 'selected' : ''}`}
                  onClick={() => toggleProduct(product)}
                  aria-pressed={selected}
                  disabled={!selected && selectedIds.length >= 3}
                >
                  <div className="compare-picker-image">
                    {image ? (
                      <img src={image} alt={getProductName(product)} />
                    ) : (
                      <span>🌾</span>
                    )}
                  </div>

                  <div className="compare-picker-info">
                    <strong>{getProductName(product)}</strong>
                    <span>{product?.category || 'Farm Product'}</span>
                    <b>₹{getPrice(product).toLocaleString('en-IN')}</b>
                  </div>

                  <span className="compare-select-indicator">
                    {selected ? '✓ Selected' : '+ Add'}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div className="compare-results">
        <div className="compare-section-heading">
          <div>
            <h3>Product Comparison</h3>
            <p>Review the selected products side by side.</p>
          </div>
        </div>

        {selectedProducts.length === 0 ? (
          <div className="compare-empty">
            <div className="compare-empty-icon">⚖️</div>
            <h4>No products selected yet</h4>
            <p>Select products above to start comparing.</p>
          </div>
        ) : (
          <div className="compare-table-wrapper">
            <table className="compare-table">
              <thead>
                <tr>
                  <th>Features</th>

                  {selectedProducts.map((product) => (
                    <th key={getProductId(product)}>
                      <div className="compare-table-product">
                        {getImage(product) ? (
                          <img
                            src={getImage(product)}
                            alt={getProductName(product)}
                          />
                        ) : (
                          <span className="compare-table-placeholder">
                            🌾
                          </span>
                        )}

                        <strong>{getProductName(product)}</strong>

                        <button
                          type="button"
                          onClick={() => toggleProduct(product)}
                          aria-label={`Remove ${getProductName(product)}`}
                        >
                          Remove
                        </button>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {comparisonRows.map((row) => (
                  <tr key={row.label}>
                    <th scope="row">{row.label}</th>

                    {selectedProducts.map((product) => (
                      <td key={getProductId(product)}>
                        {row.render(product)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
