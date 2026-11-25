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
const AI_SERVICE_TOKEN = process.env.AI_SERVICE_TOKEN || "";
const COST_RATIO = (() => {
  const raw = Number(process.env.RESTAURANT_COST_RATIO);
  return Number.isFinite(raw) && raw > 0 && raw < 1 ? raw : 0.65;
})();

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;
const TREND_WEEKS = 5;

/** Bucket stored orders into the current week plus the four before it. */
function weeklyBuckets(orders, now = Date.now()) {
  const buckets = Array.from({ length: TREND_WEEKS }, (_, index) => {
    const end = now - index * WEEK_MS;
    return { index, start: end - WEEK_MS, end, revenue: 0, orders: 0 };
  });

  for (const order of orders) {
    const time = order && order.orderedAt ? new Date(order.orderedAt).getTime() : NaN;
    if (!Number.isFinite(time)) continue;
    const bucket = buckets.find((entry) => time > entry.start && time <= entry.end);
    if (!bucket) continue;
    bucket.revenue += Number(order.grandTotal) || 0;
    bucket.orders += 1;
  }

  return buckets;
}

const round2 = (value) => Math.round(value * 100) / 100;

/** Per-order costs are not recorded, so expenses are estimated at COST_RATIO. */
function summarizeWeek(bucket) {
  const revenue = round2(bucket.revenue);
  const expense = round2(revenue * COST_RATIO);
  return {
    revenue,
    orders: bucket.orders,
    avgOrderValue: bucket.orders ? round2(revenue / bucket.orders) : 0,
    expense,
    profit: round2(revenue - expense)
  };
}

router.get("/ai-analysis", async (req, res) => {
  // Real sales replace the hard-coded 275000/350/785 constants: the panel used
  // to forecast on a fictional week regardless of what the restaurant sold.
  const orders = await ordersModel.getAllOrders();
  const buckets = weeklyBuckets(orders);

  const current = summarizeWeek(buckets[0]);
  const past = buckets.slice(1).reverse();
  const history = past.map((bucket, index) => {
    const week = summarizeWeek(bucket);
    return {
      week: `W-${past.length - index}`,
      revenue: week.revenue,
      total_expense: week.expense
    };
  });

  const currentWeekData = {
    week_revenue: current.revenue,
    week_orders: current.orders,
    avg_order_value: current.avgOrderValue,
    total_expense: current.expense,
    profit: current.profit,
    off_days: 0
  };

  const basis = `Computed from ${orders.length} stored orders. Off-days are not tracked and expenses are estimated at ${Math.round(
    COST_RATIO * 100
  )}% of revenue.`;

  if (current.orders === 0) {
    return res.json({
      available: false,
      history,
      currentWeek: currentWeekData,
      prediction: { revenue: 0, profit: 0 },
      trend: "unknown",
      insights: ["No orders in the last 7 days — the forecast needs at least one week of sales."],
      basis
    });
  }

  try {
    const headers = { "Content-Type": "application/json" };
    if (AI_SERVICE_TOKEN) headers["X-AI-Token"] = AI_SERVICE_TOKEN;

    const aiResponse = await fetch(`${AI_SERVICE_URL}/predict`, {
      method: "POST",
      headers,
      body: JSON.stringify(currentWeekData),
      signal: AbortSignal.timeout(AI_TIMEOUT_MS)
    });

    if (!aiResponse.ok) throw new Error(`AI service responded ${aiResponse.status}`);
    const aiData = await aiResponse.json();

    const predictedRevenue = Number(aiData.predicted_revenue);
    const predictedProfit = Number(aiData.predicted_profit);
    if (!Number.isFinite(predictedRevenue) || !Number.isFinite(predictedProfit)) {
      throw new Error("AI service returned an unexpected payload");
    }

    // The panel compares against "up"/"down"; the service used to return
    // "upward"/"downward", which made the badge permanently yellow.
    const trend =
      aiData.trend === "upward" ? "up" : aiData.trend === "downward" ? "down" : aiData.trend;

    // Insights are rendered as text. Cap count and length so a compromised or
    // buggy AI service cannot push unbounded data into the dashboard.
    const insights = Array.isArray(aiData.insights)
      ? aiData.insights
          .filter((line) => typeof line === "string")
          .slice(0, 5)
          .map((line) => line.slice(0, 200))
      : [];

    res.json({
      available: true,
      history,
      currentWeek: currentWeekData,
      prediction: { revenue: Math.round(predictedRevenue), profit: Math.round(predictedProfit) },
      trend,
      insights,
      basis
    });
  } catch (err) {
    console.error("AI analysis unavailable:", err.message);
    res.json({
      available: false,
      history,
      currentWeek: currentWeekData,
      prediction: { revenue: 0, profit: 0 },
      trend: "unknown",
      insights: ["AI service is unavailable — no prediction was generated."],
      basis
    });
  }
});

module.exports = router;
