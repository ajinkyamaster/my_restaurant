const express = require("express");
const router = express.Router();

const ordersModel = require("../../models/orders");

const managerAuth = require("../../middlewares/managerAuth");

// GET /manager/dashboard
router.get("/dashboard", managerAuth, async (req, res) => {
    const orders = await ordersModel.getAllOrders();
    res.render("manager/manager-dashboard", { orders });
});

// POST /manager/acceptOrder
router.post("/acceptOrder", managerAuth, async (req, res) => {
    const { orderId } = req.body;

    await ordersModel.updateOrderStatus(orderId, "ACCEPTED");

    res.json({ success: true });
});


module.exports = router;
