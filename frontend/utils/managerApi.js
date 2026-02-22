const BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
const MANAGER_API = `${BASE}/api/manager`;

async function request(endpoint, options = {}) {
  const { headers, ...rest } = options;
  const res = await fetch(`${MANAGER_API}${endpoint}`, {
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
export const managerLogin = (username, password) =>
  post("/login", { username, password });
export const managerLogout = () => post("/logout");
export const fetchManagerSession = () => request("/session");

// Dashboard (orders)
export const fetchManagerOrders = () => request("/orders");

// Accept order
export const acceptOrder = (orderId) =>
  post("/acceptOrder", { orderId });
