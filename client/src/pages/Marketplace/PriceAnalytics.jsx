
import React, { useMemo, useState } from 'react';
import { getAllProducts } from './marketplaceStorage';
import './PriceAnalytics.css';

const PriceAnalytics = ({ profile }) => {
  const [selectedPeriod, setSelectedPeriod] = useState('30');

  const farmerEmail = profile?.email?.trim().toLowerCase();

  const products = useMemo(() => {
    return getAllProducts().filter(
      (product) =>
        product.farmerEmail?.trim().toLowerCase() === farmerEmail
    );
  }, [farmerEmail]);

  const analytics = useMemo(() => {
    return products.map((product) => {
      const price = Number(product.price) || 0;
      const marketPrice = Number(product.marketPrice) || 0;

      return {
        ...product,
        currentPrice: price,
        marketPrice,
        difference: marketPrice > 0 ? price - marketPrice : 0,
        differencePercent:
          marketPrice > 0
            ? ((price - marketPrice) / marketPrice) * 100
            : 0,
      };
    });
  }, [products]);

  const averagePrice = analytics.length
    ? analytics.reduce((sum, item) => sum + item.currentPrice, 0) /
      analytics.length
    : 0;

  const aboveMarket = analytics.filter(
    (item) => item.marketPrice > 0 && item.currentPrice > item.marketPrice
  ).length;

  const belowMarket = analytics.filter(
    (item) => item.marketPrice > 0 && item.currentPrice < item.marketPrice
  ).length;

  const formatCurrency = (value) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2,
    }).format(value);

  return (
    <section className="price-analytics-page">
      <div className="price-analytics-header">
        <div>
          <span className="price-analytics-eyebrow">FARMER INSIGHTS</span>
          <h2>Price Analytics</h2>
          <p>
            Understand your product pricing and compare it with available
            market reference prices.
          </p>
        </div>

        <select
          value={selectedPeriod}
          onChange={(event) => setSelectedPeriod(event.target.value)}
          aria-label="Select analytics period"
        >
          <option value="7">Last 7 days</option>
          <option value="30">Last 30 days</option>
          <option value="90">Last 90 days</option>
        </select>
      </div>

      <div className="price-analytics-stats">
        <article className="price-analytics-stat">
          <span>Total Products</span>
          <strong>{analytics.length}</strong>
        </article>

        <article className="price-analytics-stat">
          <span>Average Listed Price</span>
          <strong>{formatCurrency(averagePrice)}</strong>
        </article>

        <article className="price-analytics-stat">
          <span>Above Market Reference</span>
          <strong>{aboveMarket}</strong>
        </article>

        <article className="price-analytics-stat">
          <span>Below Market Reference</span>
          <strong>{belowMarket}</strong>
        </article>
      </div>

      <div className="price-analytics-panel">
        <div className="price-analytics-panel-header">
          <div>
            <h3>Product Price Comparison</h3>
            <p>Compare your listed prices with available reference prices.</p>
          </div>
        </div>

        {analytics.length === 0 ? (
          <div className="price-analytics-empty">
            <h4>No products available</h4>
            <p>
              Add products to your marketplace inventory to view pricing
              information here.
            </p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="price-analytics-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Your Price</th>
                  <th>Market Reference</th>
                  <th>Difference</th>
                  <th>Comparison</th>
                </tr>
              </thead>

              <tbody>
                {analytics.map((product) => (
                  <tr key={product.id}>
                    <td>
                      <strong>{product.name || product.productName}</strong>
                      <small>{product.category || 'Uncategorized'}</small>
                    </td>

                    <td>{formatCurrency(product.currentPrice)}</td>

                    <td>
                      {product.marketPrice > 0
                        ? formatCurrency(product.marketPrice)
                        : 'Not available'}
                    </td>

                    <td>
                      {product.marketPrice > 0
                        ? `${product.difference >= 0 ? '+' : ''}${formatCurrency(
                            product.difference
                          )}`
                        : '—'}
                    </td>

                    <td>
                      {product.marketPrice <= 0 ? (
                        <span className="price-status neutral">No reference</span>
                      ) : product.difference > 0 ? (
                        <span className="price-status above">Above market</span>
                      ) : product.difference < 0 ? (
                        <span className="price-status below">Below market</span>
                      ) : (
                        <span className="price-status neutral">At market</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="price-analytics-note">
        <strong>Note:</strong> This initial version compares listed prices only
        when a product has a valid <code>marketPrice</code> field. It does not
        yet contain historical price trends or live mandi market data.
        The selected period is a UI filter placeholder for future integration.
      </div>
    </section>
  );
};

export default PriceAnalytics;
