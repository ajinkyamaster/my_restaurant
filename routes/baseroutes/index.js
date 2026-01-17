const express = require("express");
const router = express.Router();
const menuModel = require("../../models/menu");


// Home route (customer)
router.get("/", (req, res) => {
    res.render("customer/home");
});

// GET /menu
router.get("/menu", async (req, res) => {
    try {
        const menuItems = await menuModel.getAllMenuItems();
        res.render("customer/menu", { menuItems });
    } catch (error) {
        console.error("Error fetching menu items:", error);
        res.status(500).send("Failed to load menu");
    }
});


// GET /bookTable
router.get("/bookTable", (req, res) => {
    res.render("customer/bookTable");
});


// GET /orders
router.get("/orders", (req, res) => {
    if (!req.session.table) {
        return res.redirect("/");
    }

    res.render("customer/orders", {
        orders: req.session.table.orders || []
    });
});


module.exports = router;
