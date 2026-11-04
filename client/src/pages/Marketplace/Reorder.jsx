
import React, { useMemo, useState } from 'react';
import {
  getAllOrders,
  getAllProducts,
  getUserCart,
  saveUserCart,
} from './marketplaceStorage';
import './Reorder.css';

const getBuyerKey = (profile) =>
  String(profile?.email ?? profile?.userEmail ?? profile?.id ?? '')
    .trim()
    .toLowerCase();

const getProductId = (item) =>
  String(
    item?.productId ??
    item?.product?.id ??
    item?.id ??
    ''
  );

const getProductName = (item) =>
  item?.productName ??
  item?.name ??
  item?.product?.name ??
  'Product';

const getOrderItems = (order) =>
  Array.isArray(order?.items) ? order.items : [];

const getOrderDate = (order) => {
  const date = new Date(order?.createdAt ?? order?.orderDate ?? '');
  return Number.isNaN(date.getTime())
    ? 'Date unavailable'
    : date.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
};

export default function Reorder({ profile, onBack }) {
  const buyerKey = getBuyerKey(profile);

  const [orders] = useState(() => {
    try {
      const allOrders = getAllOrders();
      return Array.isArray(allOrders) ? allOrders : [];
    } catch (error) {
      console.error('Unable to load previous orders:', error);
      return [];
    }
  });

  const [products] = useState(() => {
    try {
      const allProducts = getAllProducts();
      return Array.isArray(allProducts) ? allProducts : [];
    } catch (error) {
      console.error('Unable to load marketplace products:', error);
      return [];
    }
  });

  const [search, setSearch] = useState('');
  const [message, setMessage] = useState('');

  const buyerOrders = useMemo(() => {
    return orders
      .filter((order) => {
        const orderBuyer = String(
          order?.buyerKey ??
          order?.buyerEmail ??
          order?.customerEmail ??
          ''
        ).trim().toLowerCase();

        return orderBuyer === buyerKey;
      })
      .sort(
        (a, b) =>
          new Date(b?.createdAt ?? b?.orderDate ?? 0).getTime() -
          new Date(a?.createdAt ?? a?.orderDate ?? 0).getTime()
      );
  }, [orders, buyerKey]);

  const filteredOrders = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return buyerOrders;

    return buyerOrders.filter((order) => {
      const searchable = [
        order?.orderNumber,
        order?.id,
        ...getOrderItems(order).map(getProductName),
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return searchable.includes(query);
    });
  }, [buyerOrders, search]);

  const addOrderToCart = (order) => {
    try {
      const orderItems = getOrderItems(order);

      if (orderItems.length === 0) {
        setMessage('This order does not contain any products.');
        return;
      }

      const cart = getUserCart(buyerKey);
      const currentCart = Array.isArray(cart) ? [...cart] : [];

      let addedCount = 0;
      let unavailableCount = 0;

      orderItems.forEach((item) => {
        const productId = getProductId(item);

        const availableProduct = products.find(
          (product) =>
            String(product?.id ?? product?.productId ?? product?._id ?? '') ===
            productId
        );

        if (!availableProduct || availableProduct?.isAvailable === false) {
          unavailableCount += 1;
          return;
        }

        const quantity = Math.max(
          1,
          Number(item?.quantity ?? item?.qty ?? 1)
        );

        const existingIndex = currentCart.findIndex(
          (cartItem) =>
            String(
              cartItem?.productId ??
              cartItem?.product?.id ??
              cartItem?.id ??
              ''
            ) === productId
        );

        if (existingIndex >= 0) {
          const existingQuantity = Number(
            currentCart[existingIndex]?.quantity ?? 1
          );

          currentCart[existingIndex] = {
            ...currentCart[existingIndex],
            quantity: existingQuantity + quantity,
          };
        } else {
          currentCart.push({
            ...availableProduct,
            productId,
            quantity,
          });
        }

        addedCount += 1;
      });

      if (addedCount > 0) {
        saveUserCart(buyerKey, currentCart);
      }

      if (addedCount > 0 && unavailableCount === 0) {
        setMessage(`${addedCount} product(s) added to your cart.`);
      } else if (addedCount > 0) {
        setMessage(
          `${addedCount} product(s) added. ${unavailableCount} unavailable product(s) skipped.`
        );
      } else {
        setMessage('No products from this order are currently available.');
      }
    } catch (error) {
      console.error('Unable to reorder products:', error);
      setMessage('Unable to add products to cart. Please try again.');
    }
  };

  return (
    <div className="reorder-page">
      <div className="reorder-header">
        <div>
          <span className="reorder-eyebrow">QUICK REPURCHASE</span>
          <h2>Reorder Products</h2>
          <p>Find products from your previous orders and add them again.</p>
        </div>

        <button
          type="button"
          className="reorder-back-btn"
          onClick={onBack}
        >
          ← Back to Dashboard
        </button>
      </div>

      <div className="reorder-summary">
        <div>
          <span>Previous Orders</span>
          <strong>{buyerOrders.length}</strong>
        </div>

        <div>
          <span>Available Products</span>
          <strong>{products.length}</strong>
        </div>
      </div>

      <div className="reorder-toolbar">
        <input
          type="search"
          placeholder="Search by order number or product..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          aria-label="Search previous orders"
        />
      </div>

      {message && (
        <div className="reorder-message" role="status">
          <span>{message}</span>
          <button
            type="button"
            onClick={() => setMessage('')}
            aria-label="Dismiss message"
          >
            ×
          </button>
        </div>
      )}

      {filteredOrders.length === 0 ? (
        <div className="reorder-empty">
          <div className="reorder-empty-icon">🛒</div>
          <h3>
            {buyerOrders.length === 0
              ? 'No previous orders found'
              : 'No matching orders'}
          </h3>
          <p>
            {buyerOrders.length === 0
              ? 'Your completed and previous purchases will appear here.'
              : 'Try searching with another order number or product name.'}
          </p>
        </div>
      ) : (
        <div className="reorder-list">
          {filteredOrders.map((order, index) => {
            const items = getOrderItems(order);
            const orderId =
              order?.orderNumber ??
              order?.id ??
              `ORDER-${index + 1}`;

            const total =
              Number(order?.totalAmount ?? order?.total ?? 0);

            return (
              <article
                className="reorder-card"
                key={order?.id ?? orderId}
              >
                <div className="reorder-card-header">
                  <div>
                    <span className="reorder-order-label">ORDER</span>
                    <h3>{orderId}</h3>
                    <p>{getOrderDate(order)}</p>
                  </div>

                  <span className="reorder-order-status">
                    {order?.status || 'Placed'}
                  </span>
                </div>

                <div className="reorder-items">
                  {items.map((item, itemIndex) => {
                    const productId = getProductId(item);
                    const product = products.find(
                      (entry) =>
                        String(
                          entry?.id ??
                          entry?.productId ??
                          entry?._id ??
                          ''
                        ) === productId
                    );

                    return (
                      <div
                        className="reorder-item"
                        key={`${productId}-${itemIndex}`}
                      >
                        <div>
                          <strong>{getProductName(item)}</strong>
                          <span>
                            Quantity: {Number(item?.quantity ?? item?.qty ?? 1)}
                          </span>
                        </div>

                        <span
                          className={
                            product && product?.isAvailable !== false
                              ? 'reorder-availability available'
                              : 'reorder-availability unavailable'
                          }
                        >
                          {product && product?.isAvailable !== false
                            ? 'Available'
                            : 'Unavailable'}
                        </span>
                      </div>
                    );
                  })}
                </div>

                <div className="reorder-card-footer">
                  <div>
                    <span>Order Total</span>
                    <strong>₹{total.toLocaleString('en-IN')}</strong>
                  </div>

                  <button
                    type="button"
                    className="reorder-primary-btn"
                    onClick={() => addOrderToCart(order)}
                    disabled={items.length === 0}
                  >
                    Reorder Items →
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
