const express = require("express");
const router = express.Router();

const managerModel = require("../../models/manager");
const ordersModel = require("../../models/orders");

// ─── Auth ────────────────────────────────────────────────

router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const manager = await managerModel.findManagerByUsername(username);
    if (!manager) return res.status(401).json({ error: "Invalid credentials" });

    const valid = await managerModel.verifyPassword(manager, password);
    if (!valid) return res.status(401).json({ error: "Invalid credentials" });

    req.session.manager = true;
    res.json({ success: true, manager: { username: manager.username } });
  } catch (err) {
    console.error("Manager API login error:", err);
    res.status(500).json({ error: "Login failed" });
  }
});

router.get("/session", (req, res) => {
  if (req.session && req.session.manager === true) {
    return res.json({ authenticated: true });
  }
  res.json({ authenticated: false });
});

router.post("/logout", (req, res) => {
  req.session.manager = false;
  res.json({ success: true });
});

// ─── Guard ───────────────────────────────────────────────
router.use((req, res, next) => {
  if (req.session && req.session.manager) return next();
  res.status(403).json({ error: "Not authenticated" });
});

// ─── Orders ──────────────────────────────────────────────
router.get("/orders", async (req, res) => {
  try {
    const orders = await ordersModel.getAllOrders();
    res.json({ orders });
  } catch (err) {
    res.status(500).json({ error: "Failed to load orders" });
  }
});

// ─── Accept Order ────────────────────────────────────────
router.post("/acceptOrder", async (req, res) => {
  try {
    const { orderId } = req.body;
    await ordersModel.updateOrderStatus(orderId, "ACCEPTED");
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to accept order" });
  }
});

module.exports = router;
