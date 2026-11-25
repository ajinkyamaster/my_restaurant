import { request } from "./http";

const MANAGER_API = "/api/manager";

const get = (endpoint: string) => request(MANAGER_API, endpoint);

const post = (endpoint: string, data?: unknown) =>
  request(MANAGER_API, endpoint, {
    method: "POST",
    body: data === undefined ? undefined : JSON.stringify(data),
  });

// Auth
export const managerLogin = (username: string, password: string) =>
  post("/login", { username, password });
export const managerLogout = () => post("/logout");
export const fetchManagerSession = () => get("/session");

// Dashboard (orders)
export const fetchManagerOrders = () => get("/orders");

// Accept order
export const acceptOrder = (orderId: string) => post("/acceptOrder", { orderId });
