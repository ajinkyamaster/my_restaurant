import { request } from "./http";

const API = "/api";

const get = (endpoint: string) => request(API, endpoint);

const post = (endpoint: string, data?: unknown) =>
  request(API, endpoint, {
    method: "POST",
    body: data === undefined ? undefined : JSON.stringify(data),
  });

// Menu
export const fetchMenu = () => get("/menu");

// Session
export const fetchSession = () => get("/session");
export const endSession = () => post("/endSession");

// Cart — prices are resolved server-side from the menu, never sent by the client.
export const fetchCart = () => get("/cart");
export const addToCart = (menuItemId: string, quantity: number) =>
  post("/cart/add", { menuItemId, quantity });
export const removeFromCart = (menuItemId: string) =>
  post("/cart/remove", { menuItemId });
export const updateCartItem = (menuItemId: string, quantity: number) =>
  post("/cart/update", { menuItemId, quantity });

// Orders
export const fetchOrders = () => get("/orders");

// Payments
export const fetchPaymentSummary = () => get("/payments");
export const fetchMyPayments = () => get("/myPayments");
export const processCheckout = () => post("/checkout");

// Tables & Booking
export const fetchTables = () => get("/tables");
export const bookTable = (name: string, tableNumber: number) =>
  post("/bookTable", { name, tableNumber });
