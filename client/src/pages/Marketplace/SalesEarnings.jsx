
import React from 'react';
import { getAllOrders } from './marketplaceStorage';

const SalesEarnings = ({ userKey }) => {
  const normalizedEmail = userKey?.trim().toLowerCase();

  const farmerItems = getAllOrders().flatMap((order) => {
    const items = (order.items || [])
      .filter(
        (item) =>
          item.farmerEmail?.trim().toLowerCase() === normalizedEmail
      )
      .map((item) => ({
        ...item,
        orderNumber: order.orderNumber || order.id,
        orderDate: order.createdAt,
        status: item.status || 'Pending',
      }));

    return items;
  });

  const getItemValue = (item) =>
    Number(item.price || 0) * Number(item.quantity || 0);

  const acceptedItems = farmerItems.filter(
    (item) => item.status === 'Accepted' || item.status === 'Delivered'
  );

  const pendingItems = farmerItems.filter(
    (item) => item.status === 'Pending'
  );

  const rejectedItems = farmerItems.filter(
    (item) => item.status === 'Rejected'
  );

  const acceptedValue = acceptedItems.reduce(
    (total, item) => total + getItemValue(item),
    0
  );

  const pendingValue = pendingItems.reduce(
    (total, item) => total + getItemValue(item),
    0
  );

  const rejectedValue = rejectedItems.reduce(
    (total, item) => total + getItemValue(item),
    0
  );

  const acceptedQuantity = acceptedItems.reduce(
    (total, item) => total + Number(item.quantity || 0),
    0
  );

  const recentSales = [...farmerItems]
    .sort(
      (a, b) =>
        new Date(b.orderDate || 0) - new Date(a.orderDate || 0)
    )
    .slice(0, 10);

  const formatCurrency = (value) =>
    `₹${value.toLocaleString('en-IN')}`;

  return (
    <div className="container-fluid py-3">
      <div className="mb-4">
        <h4 className="mb-1">Sales & Earnings</h4>
        <p className="text-muted mb-0">
          Track your accepted sales and marketplace order values.
        </p>
      </div>

      <div className="row g-3 mb-4">
        <div className="col-12 col-md-6 col-xl-3">
          <div className="card h-100 shadow-sm">
            <div className="card-body">
              <p className="text-muted mb-2">Accepted Sales Value</p>
              <h4 className="mb-0">{formatCurrency(acceptedValue)}</h4>
            </div>
          </div>
        </div>

        <div className="col-12 col-md-6 col-xl-3">
          <div className="card h-100 shadow-sm">
            <div className="card-body">
              <p className="text-muted mb-2">Pending Order Value</p>
              <h4 className="mb-0">{formatCurrency(pendingValue)}</h4>
            </div>
          </div>
        </div>

        <div className="col-12 col-md-6 col-xl-3">
          <div className="card h-100 shadow-sm">
            <div className="card-body">
              <p className="text-muted mb-2">Rejected Order Value</p>
              <h4 className="mb-0">{formatCurrency(rejectedValue)}</h4>
            </div>
          </div>
        </div>

        <div className="col-12 col-md-6 col-xl-3">
          <div className="card h-100 shadow-sm">
            <div className="card-body">
              <p className="text-muted mb-2">Accepted Quantity</p>
              <h4 className="mb-0">{acceptedQuantity}</h4>
              <small className="text-muted">Product units</small>
            </div>
          </div>
        </div>
      </div>

      <div className="card shadow-sm">
        <div className="card-body">
          <h5 className="mb-3">Recent Sales & Orders</h5>

          {recentSales.length === 0 ? (
            <div className="text-center py-5">
              <i className="fas fa-chart-line fa-2x text-muted mb-3"></i>
              <h6>No sales records yet</h6>
              <p className="text-muted mb-0">
                Your marketplace order activity will appear here.
              </p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table align-middle">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Product</th>
                    <th>Quantity</th>
                    <th>Order Value</th>
                    <th>Date</th>
                    <th>Status</th>
                  </tr>
                </thead>

                <tbody>
                  {recentSales.map((item, index) => (
                    <tr key={`${item.orderNumber}-${item.id || item.name}-${index}`}>
                      <td>{item.orderNumber}</td>
                      <td>{item.name || 'Product'}</td>
                      <td>{item.quantity || 0}</td>
                      <td>{formatCurrency(getItemValue(item))}</td>
                      <td>
                        {item.orderDate
                          ? new Date(item.orderDate).toLocaleDateString('en-IN')
                          : '—'}
                      </td>
                      <td>
                        <span className="badge bg-secondary">
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <p className="text-muted small mt-3">
        Note: Accepted Sales Value is based on accepted and delivered
        order items. It does not represent payment received or settled.
      </p>
    </div>
  );
};

export default SalesEarnings;
