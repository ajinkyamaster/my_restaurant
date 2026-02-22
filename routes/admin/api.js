const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");

const adminModel = require("../../models/admin");
const menuModel = require("../../models/menu");
const tablesModel = require("../../models/tables");
const bookingsModel = require("../../models/bookings");
const ordersModel = require("../../models/orders");
const managerModel = require("../../models/manager");

// ─── Auth ────────────────────────────────────────────────

router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const admin = await adminModel.findAdminByUsername(username);
    if (!admin) return res.status(401).json({ error: "Invalid credentials" });

    const valid = await bcrypt.compare(password, admin.password);
    if (!valid) return res.status(401).json({ error: "Invalid credentials" });

    req.session.admin = true;
    req.session.adminUser = { id: admin._id, username: admin.username };
    res.json({ success: true, admin: { username: admin.username } });
  } catch (err) {
    console.error("Admin API login error:", err);
    res.status(500).json({ error: "Login failed" });
  }
});

router.get("/session", (req, res) => {
  if (req.session && req.session.admin === true) {
    return res.json({ authenticated: true, admin: req.session.adminUser });
  }
  res.json({ authenticated: false });
});

router.post("/logout", (req, res) => {
  req.session.admin = false;
  req.session.adminUser = null;
  res.json({ success: true });
});

// ─── Guard middleware for everything below ───────────────
router.use((req, res, next) => {
  if (req.session && req.session.admin === true) return next();
  res.status(403).json({ error: "Not authenticated" });
});

// ─── Dashboard ───────────────────────────────────────────
router.get("/dashboard", async (req, res) => {
  try {
    const [tables, menuItems, bookings, orders, managers] = await Promise.all([
      tablesModel.getAllTables(),
      menuModel.getAllMenuItems(),
      bookingsModel.getAllBookings(),
      ordersModel.getAllOrders(),
      managerModel.getAllManagers(),
    ]);
    const occupiedTables = tables.filter((t) => !t.isVacant).length;
    const totalRevenue = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
    res.json({
      admin: req.session.adminUser,
      stats: {
        totalTables: tables.length,
        occupiedTables,
        totalMenuItems: menuItems.length,
        totalBookings: bookings.length,
        totalOrders: orders.length,
        totalManagers: managers.length,
        totalRevenue,
      },
    });
  } catch (err) {
    console.error("Dashboard API error:", err);
    res.status(500).json({ error: "Failed to load dashboard" });
  }
});

// ─── Menu ────────────────────────────────────────────────
router.get("/menu", async (req, res) => {
  try {
    const menuItems = await menuModel.getAllMenuItems();
    res.json({ menuItems });
  } catch (err) {
    res.status(500).json({ error: "Failed to load menu" });
  }
});

router.post("/menu", async (req, res) => {
  try {
    const { name, price } = req.body;
    await menuModel.addMenuItem(name, parseFloat(price));
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to add menu item" });
  }
});

router.post("/menu/update", async (req, res) => {
  try {
    const { id, name, price } = req.body;
    await menuModel.updateMenuItem(id, name, parseFloat(price));
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to update menu item" });
  }
});

router.post("/menu/delete", async (req, res) => {
  try {
    const { id } = req.body;
    await menuModel.deleteMenuItem(id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete menu item" });
  }
});

// ─── Tables ──────────────────────────────────────────────
router.get("/tables", async (req, res) => {
  try {
    const tables = await tablesModel.getAllTables();
    res.json({ tables });
  } catch (err) {
    res.status(500).json({ error: "Failed to load tables" });
  }
});

router.post("/tables", async (req, res) => {
  try {
    const { tableNumber, capacity } = req.body;
    await tablesModel.addTable({ tableNumber: parseInt(tableNumber), capacity: parseInt(capacity) });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to add table" });
  }
});

router.post("/tables/update", async (req, res) => {
  try {
    const { id, tableNumber, capacity, isVacant } = req.body;
    await tablesModel.updateTable(id, parseInt(tableNumber), parseInt(capacity), isVacant);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to update table" });
  }
});

router.post("/tables/delete", async (req, res) => {
  try {
    const { id } = req.body;
    await tablesModel.deleteTable(id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete table" });
  }
});

// ─── Bookings ────────────────────────────────────────────
router.get("/bookings", async (req, res) => {
  try {
    const bookings = await bookingsModel.getAllBookings();
    const bookingsWithStatus = await Promise.all(
      bookings.map(async (b) => {
        const vacantTable = await tablesModel.getTableByTableNumber(b.tableNumber);
        return { ...b, status: vacantTable ? "Booking Expired" : "Booking Active" };
      })
    );
    res.json({ bookings: bookingsWithStatus });
  } catch (err) {
    res.status(500).json({ error: "Failed to load bookings" });
  }
});

// ─── Managers ────────────────────────────────────────────
router.get("/managers", async (req, res) => {
  try {
    const managers = await managerModel.getAllManagers();
    const safe = managers.map(({ password, ...m }) => m);
    res.json({ managers: safe });
  } catch (err) {
    res.status(500).json({ error: "Failed to load managers" });
  }
});

router.post("/managers/create", async (req, res) => {
  try {
    const { username, password } = req.body;
    const existing = await managerModel.findManagerByUsername(username);
    if (existing) return res.status(409).json({ error: "Manager already exists" });
    await managerModel.createManager(username, password);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to create manager" });
  }
});

router.post("/managers/vacate", async (req, res) => {
  try {
    const { username } = req.body;
    const mgr = await managerModel.findManagerByUsername(username);
    if (!mgr) return res.status(404).json({ error: "Manager not found" });
    await managerModel.vacateManager(username);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to vacate manager" });
  }
});

router.post("/admins/create", async (req, res) => {
  try {
    const { username, password } = req.body;
    const existing = await adminModel.findAdminByUsername(username);
    if (existing) return res.status(409).json({ error: "Admin already exists" });
    await adminModel.createAdmin({ username, password });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to create admin" });
  }
});

// ─── Reset ───────────────────────────────────────────────
router.post("/reset", async (req, res) => {
  try {
    await bookingsModel.clearAllBookings();
    await tablesModel.markAllTablesVacant();
    await ordersModel.clearAllOrders();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Reset failed" });
  }
});

// ─── AI Analysis ─────────────────────────────────────────
router.get("/ai-analysis", async (req, res) => {
  try {
    const currentWeekData = {
      week_revenue: 275000,
      week_orders: 350,
      avg_order_value: 785,
      total_expense: 175000,
      profit: 100000,
      off_days: 0,
    };

    const aiResponse = await fetch("http://localhost:8000/predict", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(currentWeekData),
    });

    if (!aiResponse.ok) throw new Error("AI service unavailable");
    const aiData = await aiResponse.json();

    const history = [
      { week: "W-1", revenue: 275000, total_expense: 200000 },
      { week: "W-2", revenue: 270000, total_expense: 280000 },
      { week: "W-3", revenue: 300000, total_expense: 200000 },
      { week: "W-4", revenue: 280000, total_expense: 220000 },
    ];

    res.json({
      history,
      prediction: { revenue: aiData.predicted_revenue, profit: aiData.predicted_profit },
      trend: aiData.trend,
      insights: aiData.insights,
    });
  } catch (err) {
    console.error("AI Analysis API error:", err);
    res.json({
      history: [],
      prediction: { revenue: 0, profit: 0 },
      trend: "unknown",
      insights: ["AI service temporarily unavailable"],
    });
  }
});

module.exports = router;
