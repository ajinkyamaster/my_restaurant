const express = require("express");
const router = express.Router();

// GET /orders
router.get("/orders", (req, res) => {
    if (!req.session.table) {
        return res.redirect("/");
    }

    res.render("customer/orders", {
        tableNumber: req.session.table.tableNumber,
        orders: req.session.table.orders
    });
});

module.exports = router;
