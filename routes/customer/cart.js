const express = require("express");
const router = express.Router();

const {
    getCart,
    postAddToCart,
    postRemoveFromCart,
    getPayments,
    postCheckout,
    postMakePayment,
    getMyPayments,
    getPaymentSuccess
} = require("../../controllers/customer/cartController");

// GET /cart
router.get("/cart", getCart);

// POST /cart/add
router.post("/cart/add", postAddToCart);

// POST /cart/remove
router.post("/cart/remove", postRemoveFromCart);

// GET /payment
router.get("/payments", getPayments);

// POST /checkout
router.post("/checkout", postCheckout);

// POST /makePayment
router.post("/makePayment", postMakePayment);

// GET /myPayments
router.get("/myPayments", getMyPayments);

// GET /paymentSuccess
router.get("/paymentSuccess", getPaymentSuccess);

module.exports = router;
