const express = require("express");
const router = express.Router();

const managerModel = require("../../models/manager");
const ordersModel = require("../../models/orders");
const { resolveUser, requireRole } = require("../../middleware/auth");
const { startStaffSession, endStaffSession } = require("../../auth/staffAuth");
const validate = require("../../utils/validate");
const { AuthError, ConflictError } = require("../../utils/errors");

// ─── Auth ────────────────────────────────────────────────

router.post("/login", async (req, res) => {
    const username = validate.username(req.body && req.body.username);
    const password = validate.loginPassword(req.body && req.body.password);

    const manager = await managerModel.findManagerByUsername(username);
    if (!manager) throw new AuthError("Invalid credentials");

    const valid = await managerModel.verifyPassword(manager, password);
    if (!valid) throw new AuthError("Invalid credentials");

    await startStaffSession(res, {
        id: manager._id,
        role: "manager",
        username: manager.username,
        tokenVersion: manager.tokenVersion || 0
    });

    res.json({ success: true, manager: { username: manager.username } });
});

router.get("/session", async (req, res) => {
    const user = await resolveUser(req);
    if (user && user.role === "manager") {
        return res.json({ authenticated: true, manager: { username: user.username } });
    }
    res.json({ authenticated: false });
});

router.post("/logout", async (req, res) => {
    await endStaffSession(req, res);
    res.json({ success: true });
});

// ─── Guard ───────────────────────────────────────────────
router.use(requireRole("manager"));

// ─── Orders ──────────────────────────────────────────────
router.get("/orders", async (req, res) => {
    const orders = await ordersModel.getAllOrders();
    res.json({ orders });
});

router.post("/acceptOrder", async (req, res) => {
    const orderId = validate.objectId(req.body && req.body.orderId, { field: "orderId" });

    const result = await ordersModel.acceptOrder(orderId);
    if (result.matchedCount === 0) {
        throw new ConflictError("Order not found or already accepted");
    }

    res.json({ success: true });
});

module.exports = router;
