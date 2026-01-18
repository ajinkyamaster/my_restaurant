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
router.get("/payments", (req, res) => {
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
    res.redirect("/payments");
});

// POST /makePayment                    need to be added
router.post("/makePayment", (req, res) => {
    // Payment processing logic would go here

    // For now, we assume payment is successful
     res.redirect("/paymentSuccess");       //for now
});

// GET /paymentSuccess
router.get("/paymentSuccess", (req, res) => {
    if (!req.session.table || req.session.table.cart.length === 0) {
        return res.redirect("/");
    }

    const cart = req.session.table.cart;

    const grandTotal = cart.reduce(
        (sum, item) => sum + item.totalPrice,
        0
    );

    const order = {
        orderId: Date.now(),
        items: cart,
        grandTotal,
        orderedAt: new Date()
    };

    // ✅ store order in session
    req.session.table.orders.push(order);

    // ✅ clear cart AFTER order is stored
    req.session.table.cart = [];

    res.render("customer/paymentSuccess", {
        tableNumber: req.session.table.tableNumber,
        order
    });
});



module.exports = router;
