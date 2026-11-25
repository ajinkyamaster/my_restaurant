const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");

const adminModel = require("../../models/admin");
const menuModel = require("../../models/menu");
const tablesModel = require("../../models/tables");
const bookingsModel = require("../../models/bookings");
const ordersModel = require("../../models/orders");
const managerModel = require("../../models/manager");
const tableSessions = require("../../models/tableSessions");

const { resolveUser, requireRole } = require("../../middleware/auth");
const { startStaffSession, endStaffSession } = require("../../auth/staffAuth");
const validate = require("../../utils/validate");
const { AuthError, NotFoundError, ConflictError } = require("../../utils/errors");

const AI_SERVICE_URL = (process.env.AI_SERVICE_URL || "http://localhost:8000").replace(/\/+$/, "");
const AI_TIMEOUT_MS = 3000;

// ─── Auth ────────────────────────────────────────────────

router.post("/login", async (req, res) => {
  const username = validate.username(req.body && req.body.username);
  const password = validate.loginPassword(req.body && req.body.password);

  const admin = await adminModel.findAdminByUsername(username);
  if (!admin) throw new AuthError("Invalid credentials");

  const valid = await bcrypt.compare(password, admin.password);
  if (!valid) throw new AuthError("Invalid credentials");

  await startStaffSession(res, {
    id: admin._id,
    role: "admin",
    username: admin.username,
    tokenVersion: admin.tokenVersion || 0
  });

  res.json({ success: true, admin: { username: admin.username } });
});

router.get("/session", async (req, res) => {
  const user = await resolveUser(req);
  if (user && user.role === "admin") {
    return res.json({ authenticated: true, admin: { id: user.id, username: user.username } });
  }
  res.json({ authenticated: false });
});

router.post("/logout", async (req, res) => {
  await endStaffSession(req, res);
  res.json({ success: true });
});

// ─── Guard middleware for everything below ───────────────
router.use(requireRole("admin"));

// ─── Dashboard ───────────────────────────────────────────
router.get("/dashboard", async (req, res) => {
  const [tables, menuItems, bookings, orders, managers] = await Promise.all([
    tablesModel.getAllTables(),
    menuModel.getAllMenuItems(),
    bookingsModel.getAllBookings(),
    ordersModel.getAllOrders(),
    managerModel.getAllManagers()
  ]);

  const occupiedTables = tables.filter((t) => !t.isVacant).length;

  // Orders store `grandTotal`. Reading a non-existent `totalAmount` reported ₹0.
  const totalRevenue = orders.reduce((sum, order) => sum + (Number(order.grandTotal) || 0), 0);

  res.json({
    admin: { id: req.user.id, username: req.user.username },
    stats: {
      totalTables: tables.length,
      occupiedTables,
      totalMenuItems: menuItems.length,
      totalBookings: bookings.length,
      totalOrders: orders.length,
      totalManagers: managers.length,
      totalRevenue: Math.round(totalRevenue * 100) / 100
    }
  });
});

// ─── Menu ────────────────────────────────────────────────
router.get("/menu", async (req, res) => {
  const menuItems = await menuModel.getAllMenuItems();
  res.json({ menuItems });
});

router.post("/menu", async (req, res) => {
  const name = validate.str(req.body && req.body.name, { field: "name", min: 1, max: 80 });
  const price = validate.money(req.body && req.body.price, { field: "price", min: 0.01 });

  await menuModel.addMenuItem(name, price);
  res.json({ success: true });
});

router.post("/menu/update", async (req, res) => {
  const id = validate.objectId(req.body && req.body.id);
  const name = validate.str(req.body && req.body.name, { field: "name", min: 1, max: 80 });
  const price = validate.money(req.body && req.body.price, { field: "price", min: 0.01 });

  const result = await menuModel.updateMenuItem(id, name, price);
  if (result.matchedCount === 0) throw new NotFoundError("Menu item not found");

  res.json({ success: true });
});

router.post("/menu/delete", async (req, res) => {
  const id = validate.objectId(req.body && req.body.id);

  const result = await menuModel.deleteMenuItem(id);
  if (result.deletedCount === 0) throw new NotFoundError("Menu item not found");

  res.json({ success: true });
});

// ─── Tables ──────────────────────────────────────────────
router.get("/tables", async (req, res) => {
  const tables = await tablesModel.getAllTables();
  res.json({ tables });
});

router.post("/tables", async (req, res) => {
  const tableNumber = validate.int(req.body && req.body.tableNumber, {
    field: "tableNumber",
    min: 1,
    max: 9999
  });
  const capacity = validate.int(req.body && req.body.capacity, {
    field: "capacity",
    min: 1,
    max: 100
  });

  const existing = await tablesModel.getAllTables();
  if (existing.some((t) => t.tableNumber === tableNumber)) {
    throw new ConflictError(`Table ${tableNumber} already exists`);
  }

  await tablesModel.addTable({ tableNumber, capacity });
  res.json({ success: true });
});

router.post("/tables/update", async (req, res) => {
  const id = validate.objectId(req.body && req.body.id);
  const tableNumber = validate.int(req.body && req.body.tableNumber, {
    field: "tableNumber",
    min: 1,
    max: 9999
  });
  const capacity = validate.int(req.body && req.body.capacity, {
    field: "capacity",
    min: 1,
    max: 100
  });
  const isVacant = validate.boolean(req.body && req.body.isVacant, { field: "isVacant" });

  const result = await tablesModel.updateTable(id, tableNumber, capacity, isVacant);
  if (result.matchedCount === 0) throw new NotFoundError("Table not found");

  res.json({ success: true });
});

router.post("/tables/delete", async (req, res) => {
  const id = validate.objectId(req.body && req.body.id);

  const result = await tablesModel.deleteTable(id);
  if (result.deletedCount === 0) throw new NotFoundError("Table not found");

  res.json({ success: true });
});

// ─── Bookings ────────────────────────────────────────────
router.get("/bookings", async (req, res) => {
  const bookings = await bookingsModel.getAllBookings();
  const tables = await tablesModel.getAllTables();
  const occupied = new Set(
    tables.filter((t) => !t.isVacant).map((t) => t.tableNumber)
  );

  const bookingsWithStatus = bookings.map((booking) => ({
    ...booking,
    status: occupied.has(booking.tableNumber) ? "Booking Active" : "Booking Expired"
  }));

  res.json({ bookings: bookingsWithStatus });
});

// ─── Managers ────────────────────────────────────────────
router.get("/managers", async (req, res) => {
  const managers = await managerModel.getAllManagers();
  res.json({ managers });
});

router.post("/managers/create", async (req, res) => {
  const username = validate.username(req.body && req.body.username);
  const password = validate.password(req.body && req.body.password);

  const existing = await managerModel.findManagerByUsername(username);
  if (existing) throw new ConflictError("Manager already exists");

  await managerModel.createManager(username, password);
  res.json({ success: true });
});

router.post("/managers/vacate", async (req, res) => {
  const username = validate.username(req.body && req.body.username);

  const manager = await managerModel.findManagerByUsername(username);
  if (!manager) throw new NotFoundError("Manager not found");

  // Deleting the record revokes their tokens: the auth middleware re-loads the
  // manager by id on every request and fails closed.
  await managerModel.vacateManager(username);
  res.json({ success: true });
});

router.post("/admins/create", async (req, res) => {
  const username = validate.username(req.body && req.body.username);
  const password = validate.password(req.body && req.body.password);

  const existing = await adminModel.findAdminByUsername(username);
  if (existing) throw new ConflictError("Admin already exists");

  await adminModel.createAdmin({ username, password });
  res.json({ success: true });
});

// ─── Reset ───────────────────────────────────────────────
router.post("/reset", async (req, res) => {
  await bookingsModel.clearAllBookings();
  await tablesModel.markAllTablesVacant();
  await ordersModel.clearAllOrders();
  // Drop open dine-in sessions too, otherwise a stale customer session keeps
  // ordering into the "new day" and can vacate a table someone else just took.
  await tableSessions.clearAll();
  res.json({ success: true });
});

// ─── AI Analysis ─────────────────────────────────────────
router.get("/ai-analysis", async (req, res) => {
  const currentWeekData = {
    week_revenue: 275000,
    week_orders: 350,
    avg_order_value: 785,
    total_expense: 175000,
    profit: 100000,
    off_days: 0
  };

  const history = [
    { week: "W-1", revenue: 275000, total_expense: 200000 },
    { week: "W-2", revenue: 270000, total_expense: 280000 },
    { week: "W-3", revenue: 300000, total_expense: 200000 },
    { week: "W-4", revenue: 280000, total_expense: 220000 }
  ];

  try {
    const aiResponse = await fetch(`${AI_SERVICE_URL}/predict`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(currentWeekData),
      signal: AbortSignal.timeout(AI_TIMEOUT_MS)
    });

    if (!aiResponse.ok) throw new Error(`AI service responded ${aiResponse.status}`);
    const aiData = await aiResponse.json();

    // The panel compares against "up"/"down"; the service used to return
    // "upward"/"downward", which made the badge permanently yellow.
    const trend =
      aiData.trend === "upward" ? "up" : aiData.trend === "downward" ? "down" : aiData.trend;

    res.json({
      available: true,
      history,
      currentWeek: currentWeekData,
      prediction: { revenue: aiData.predicted_revenue, profit: aiData.predicted_profit },
      trend,
      insights: Array.isArray(aiData.insights) ? aiData.insights : []
    });
  } catch (err) {
    console.error("AI analysis unavailable:", err.message);
    res.json({
      available: false,
      history,
      currentWeek: currentWeekData,
      prediction: { revenue: 0, profit: 0 },
      trend: "unknown",
      insights: ["AI service is unavailable — no prediction was generated."]
    });
  }
});

module.exports = router;
