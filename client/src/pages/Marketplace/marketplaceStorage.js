
const PRODUCT_STORAGE_KEY = 'agrosphere_marketplace_all_products';
const ORDER_STORAGE_KEY = 'agrosphere_marketplace_orders';
const CART_STORAGE_KEY = 'agrosphere_marketplace_carts';

// Read products from shared storage
export const getAllProducts = () => {
  try {
    return JSON.parse(
      localStorage.getItem(PRODUCT_STORAGE_KEY) || '[]'
    );
  } catch {
    return [];
  }
};

// Save shared products
export const saveAllProducts = (products) => {
  localStorage.setItem(
    PRODUCT_STORAGE_KEY,
    JSON.stringify(products)
  );
};

// Read all marketplace orders
export const getAllOrders = () => {
  try {
    return JSON.parse(
      localStorage.getItem(ORDER_STORAGE_KEY) || '[]'
    );
  } catch {
    return [];
  }
};

// Save marketplace orders
export const saveAllOrders = (orders) => {
  localStorage.setItem(
    ORDER_STORAGE_KEY,
    JSON.stringify(orders)
  );
};

// Read cart for a particular user
export const getUserCart = (userKey) => {
  try {
    const carts = JSON.parse(
      localStorage.getItem(CART_STORAGE_KEY) || '{}'
    );

    return carts[userKey] || [];
  } catch {
    return [];
  }
};

// Save cart for a particular user
export const saveUserCart = (userKey, cart) => {
  const carts = JSON.parse(
    localStorage.getItem(CART_STORAGE_KEY) || '{}'
  );

  carts[userKey] = cart;

  localStorage.setItem(
    CART_STORAGE_KEY,
    JSON.stringify(carts)
  );
};


// Update individual farmer's order items
export const updateFarmerOrderStatus = (orderId, farmerEmail, newStatus) => {
  const allowedStatuses = ['Accepted', 'Rejected', 'Delivered'];

  if (!allowedStatuses.includes(newStatus)) {
    throw new Error('Invalid order status');
  }

  const orders = getAllOrders();

  const updatedOrders = orders.map((order) => {
    if (order.id !== orderId) {
      return order;
    }

    const updatedItems = (order.items || []).map((item) => {
      const isSameFarmer =
        item.farmerEmail?.trim().toLowerCase() ===
        farmerEmail?.trim().toLowerCase();

      // Only update this farmer's pending items
      if (isSameFarmer && item.status === 'Pending') {
        return {
          ...item,
          status: newStatus,
        };
      }

      return item;
    });

    const statuses = updatedItems.map((item) => item.status || 'Pending');

    let overallStatus = 'Pending';

    if (statuses.length > 0 && statuses.every((s) => s === 'Delivered')) {
      overallStatus = 'Delivered';
    } else if (statuses.every((s) => s === 'Accepted')) {
      overallStatus = 'Accepted';
    } else if (statuses.every((s) => s === 'Rejected')) {
      overallStatus = 'Rejected';
    } else if (statuses.some((s) => s !== 'Pending')) {
      overallStatus = 'Partially Accepted';
    }

    return {
      ...order,
      items: updatedItems,
      status: overallStatus,
    };
  });

  saveAllOrders(updatedOrders);

  return updatedOrders;
};
