const express = require("express");
const router = express.Router();

const bookTableRoutes = require("./bookTable");
const cartRoutes = require("./cart");

// use cart-related routes
router.use(cartRoutes);

// use customer-related routes
router.use(bookTableRoutes);

module.exports = router;
