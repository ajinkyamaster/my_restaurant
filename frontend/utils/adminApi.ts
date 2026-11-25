import { request } from "./http";

const ADMIN_API = "/api/admin";

const get = (endpoint: string) => request(ADMIN_API, endpoint);

const post = (endpoint: string, data?: unknown) =>
  request(ADMIN_API, endpoint, {
    method: "POST",
    body: data === undefined ? undefined : JSON.stringify(data),
  });

// Auth
export const adminLogin = (username: string, password: string) =>
  post("/login", { username, password });
export const adminLogout = () => post("/logout");
export const fetchAdminSession = () => get("/session");

// Dashboard
export const fetchDashboard = () => get("/dashboard");

// Menu
export const fetchAdminMenu = () => get("/menu");
export const addMenuItem = (name: string, price: number) =>
  post("/menu", { name, price });
export const updateMenuItem = (id: string, name: string, price: number) =>
  post("/menu/update", { id, name, price });
export const deleteMenuItem = (id: string) => post("/menu/delete", { id });

// Tables
export const fetchAdminTables = () => get("/tables");
export const addTable = (tableNumber: number, capacity: number) =>
  post("/tables", { tableNumber, capacity });
export const updateTable = (
  id: string,
  tableNumber: number,
  capacity: number,
  isVacant: boolean
) => post("/tables/update", { id, tableNumber, capacity, isVacant });
export const deleteTable = (id: string) => post("/tables/delete", { id });

// Bookings
export const fetchAdminBookings = () => get("/bookings");

// Managers
export const fetchManagers = () => get("/managers");
export const createManager = (username: string, password: string) =>
  post("/managers/create", { username, password });
export const vacateManager = (username: string) =>
  post("/managers/vacate", { username });
export const createAdmin = (username: string, password: string) =>
  post("/admins/create", { username, password });

// Reset
export const endOfDayReset = () => post("/reset");
