const express = require("express");
const router = express.Router();

const ordersModel = require("../../models/orders");

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
        return res.status(401).json({
            redirect: "/menu?message=Please book a table to add items to cart"
        });
    }

    const { item, quantity, price } = req.body;
    const cart = req.session.table.cart;

    const existingItem = cart.find(ci => ci.item === item);

    if (existingItem) {
        existingItem.quantity = quantity;
        existingItem.totalPrice = price * quantity;
    } else {
        cart.push({
            item,
            quantity,
            price,
            totalPrice: price * quantity
        });
    }

    req.session.table.cart = cart;

    res.json({
        success: true,
        cart
    });
});


// POST /cart/remove
router.post("/cart/remove", (req, res) => {
    if (!req.session.table) {
        return res.status(403).json({ message: "No active table session" });
    }

    const { item } = req.body;
    let cart = req.session.table.cart;

    cart = cart.filter(ci => ci.item !== item);

    req.session.table.cart = cart;

    res.json({ message: "Item removed", cart });
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

// GET /myPayments
router.get("/myPayments", async (req, res) => {
    let tableOrders;
    if(!req.session.table) {
        return res.render("customer/myPayments", { tableOrders: [] });
    }

     tableOrders = await ordersModel.getOrdersByTableNumber(req.session.table.tableNumber);

    res.render("customer/myPayments", { tableOrders });
});

// GET /paymentSuccess
router.get("/paymentSuccess", async (req, res) => {
    if (!req.session.table || req.session.table.cart.length === 0) {
        return res.redirect("/");
    }

    const cart = req.session.table.cart;


    const grandTotal = cart.reduce(
        (sum, item) => sum + item.totalPrice,
        0
    );

    // store order ONLY in DB
    await ordersModel.createOrder({
        tableNumber: req.session.table.tableNumber,
        customer: {
            name: req.session.table?.customerName || "Dine-in Customer"
        },
        items: cart,
        grandTotal,
        orderedAt: new Date(),
        status: "PLACED"
    });

    // clear cart
    req.session.table.cart = [];

    res.render("customer/paymentSuccess", {
        tableNumber: req.session.table.tableNumber
    });
});





module.exports = router;
