const express = require("express");
const router = express.Router();

// GET /cart
router.get("/cart", (req, res) => {
    if (!req.session.table) {
        return res.redirect("/bookTable");
    }

    const cart = req.session.table.cart || [];

    const grandTotal = cart.reduce(
        (sum, item) => sum + item.totalPrice,
        0
    );

    res.render("customer/cart", {
        cart,
        grandTotal
    });
});

// POST /cart/add
router.post("/cart/add", (req, res) => {
    if (!req.session.table) {
        return res.status(403).json({ message: "No active table session" });
    }

    const { item, quantity, price } = req.body;
    const cart = req.session.table.cart;

    const existingItem = cart.find(ci => ci.item === item);

    if (existingItem) {
        existingItem.quantity += quantity;
        existingItem.totalPrice += price * quantity;
    } else {
        cart.push({
            item,
            quantity,
            totalPrice: price * quantity
        });
    }

    req.session.table.cart = cart;

    res.json({ message: "Added to cart", cart });
});

// GET /payment
router.get("/payment", (req, res) => {
    if (!req.session.table || req.session.table.cart.length === 0) {
        return res.redirect("/menu");
    }

    const cart = req.session.table.cart;

    const grandTotal = cart.reduce(
        (sum, item) => sum + item.totalPrice,
        0
    );

    res.render("customer/payment", {
        cart,
        grandTotal,
        tableNumber: req.session.table.tableNumber
    });
});


// POST /checkout
router.post("/checkout", (req, res) => {
    res.redirect("/payment");
});

module.exports = router;
