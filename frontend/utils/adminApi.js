const ADMIN_API = "http://localhost:5000/api/admin";

async function request(endpoint, options = {}) {
  const { headers, ...rest } = options;
  const res = await fetch(`${ADMIN_API}${endpoint}`, {
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

// Auth
export const adminLogin = (username, password) =>
  post("/login", { username, password });
export const adminLogout = () => post("/logout");
export const fetchAdminSession = () => request("/session");

// Dashboard
export const fetchDashboard = () => request("/dashboard");

// Menu
export const fetchAdminMenu = () => request("/menu");
export const addMenuItem = (name, price) => post("/menu", { name, price });
export const updateMenuItem = (id, name, price) =>
  post("/menu/update", { id, name, price });
export const deleteMenuItem = (id) => post("/menu/delete", { id });

// Tables
export const fetchAdminTables = () => request("/tables");
export const addTable = (tableNumber, capacity) =>
  post("/tables", { tableNumber, capacity });
export const updateTable = (id, tableNumber, capacity, isVacant) =>
  post("/tables/update", { id, tableNumber, capacity, isVacant });
export const deleteTable = (id) => post("/tables/delete", { id });

// Bookings
export const fetchAdminBookings = () => request("/bookings");

// Managers
export const fetchManagers = () => request("/managers");
export const createManager = (username, password) =>
  post("/managers/create", { username, password });
export const vacateManager = (username) =>
  post("/managers/vacate", { username });
export const createAdmin = (username, password) =>
  post("/admins/create", { username, password });

// Reset
export const endOfDayReset = () => post("/reset");

// AI Analysis
export const fetchAiAnalysis = () => request("/ai-analysis");
