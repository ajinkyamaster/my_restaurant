const express = require("express");
const router = express.Router();

const { getOrders } = require("../../controllers/customer/ordersController");

// GET /orders -> shows current table's orders
router.get("/orders", getOrders);

module.exports = router;
