const express = require("express");
const router = express.Router();

const ordersModel = require("../../models/orders");

// GET /orders -> shows current table's orders
router.get("/orders", async (req, res) => {
    if (!req.session.table || !req.session.table.tableNumber) {
        return res.redirect("/");
    }

    const tableNumber = req.session.table.tableNumber;

    try {
        const orders = await ordersModel.getOrdersByTableNumber(tableNumber);

        return res.render("customer/orders", {
            tableNumber,
            orders
        });
    } catch (err) {
        console.error("Failed to fetch orders for table", tableNumber, err);
        return res.status(500).send("Unable to fetch orders right now.");
    }
});


module.exports = router;
