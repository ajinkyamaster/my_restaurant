const express = require("express");
const router = express.Router();

// ─── Import controllers ─────────────────────────────────
const { apiGetMenu, apiGetSession } = require("../../controllers/baseController");
const {
    apiGetCart,
    postAddToCart,
    postRemoveFromCart,
    apiUpdateCartItem,
    apiGetPayments,
    apiGetMyPayments,
    apiCheckout
} = require("../../controllers/customer/cartController");
const { apiGetOrders } = require("../../controllers/customer/ordersController");
const { apiGetTables, apiBookTable } = require("../../controllers/customer/tablesController");
const { apiEndSession } = require("../../controllers/customer/sessionController");

// ─── Menu ────────────────────────────────────────────────
router.get("/menu", apiGetMenu);

// ─── Session ─────────────────────────────────────────────
router.get("/session", apiGetSession);

// ─── Cart ────────────────────────────────────────────────
router.get("/cart", apiGetCart);
router.post("/cart/add", postAddToCart);         // already returns JSON
router.post("/cart/remove", postRemoveFromCart);  // already returns JSON
router.post("/cart/update", apiUpdateCartItem);

// ─── Orders ──────────────────────────────────────────────
router.get("/orders", apiGetOrders);

// ─── Payments / Checkout ─────────────────────────────────
router.get("/payments", apiGetPayments);
router.get("/myPayments", apiGetMyPayments);
router.post("/checkout", apiCheckout);

// ─── Tables / Booking ────────────────────────────────────
router.get("/tables", apiGetTables);
router.post("/bookTable", apiBookTable);

// ─── End Session ─────────────────────────────────────────
router.post("/endSession", apiEndSession);

module.exports = router;
