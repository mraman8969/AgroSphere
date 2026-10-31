
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
