const express = require("express");
const router = express.Router();

const bookTableRoutes = require("./bookTable");
const cartRoutes = require("./cart");
const endTableSessionRoutes = require("./endTableSession");
const ordersRoutes = require("./orders");

// use orders-related routes
router.use(ordersRoutes);

// use end table session routes
router.use(endTableSessionRoutes);

// use cart-related routes
router.use(cartRoutes);

// use customer-related routes
router.use(bookTableRoutes);

module.exports = router;
