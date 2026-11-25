const BASE = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000").replace(/\/+$/, "");
const API = `${BASE}/api`;

async function request(endpoint, options = {}) {
  const { headers, ...rest } = options;
  const res = await fetch(`${API}${endpoint}`, {
    credentials: "include",
    ...rest,
    headers: { "Content-Type": "application/json", ...headers },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed (${res.status})`);
  }

  return res.json();
}

function post(endpoint, data) {
  return request(endpoint, { method: "POST", body: JSON.stringify(data) });
}

// Menu
export const fetchMenu = () => request("/menu");

// Session
export const fetchSession = () => request("/session");
export const endSession = () => post("/endSession");

// Cart
export const fetchCart = () => request("/cart");
export const addToCart = (item, quantity, price) =>
  post("/cart/add", { item, quantity, price });
export const removeFromCart = (item) => post("/cart/remove", { item });
export const updateCartItem = (item, quantity, price) =>
  post("/cart/update", { item, quantity, price });

// Orders
export const fetchOrders = () => request("/orders");

// Payments
export const fetchPaymentSummary = () => request("/payments");
export const fetchMyPayments = () => request("/myPayments");
export const processCheckout = () => post("/checkout");

// Tables & Booking
export const fetchTables = () => request("/tables");
export const bookTable = (name, tableNumber) =>
  post("/bookTable", { name, tableNumber });
