const express = require("express");
const router = express.Router();
const menuModel = require("../../models/menu");

// Home route (customer)
router.get("/", (req, res) => {
    res.render("customer/home");
});

router.get("/about", (req, res) => {
    res.render("about");
});

// GET /menu
router.get("/menu", async (req, res) => {

    try {

        const menuItems = await menuModel.getAllMenuItems();

        res.render("customer/menu", {
            menuItems,
            message: req.query.message
        });
        
    } catch (error) {
        console.error("Error fetching menu items:", error);
        res.status(500).send("Failed to load menu");
    }
});


// GET /bookTable
router.get("/bookTable", (req, res) => {
    let errorMessage;

    if (req.query.error === 'table_occupied') {
        errorMessage = `Sorry, the requested table ${req.query.tableNumber} is already occupied or does not exist.`;
    }

    res.render("customer/bookTable", {
        errorMessage,
    });
});


// GET /bookTable/:tableNumber
router.get("/bookTable/:tableNumber", (req, res) => {
    const tableNumber = req.params.tableNumber;
    let errorMessage;

    if (req.query.error === 'table_occupied') {
        errorMessage = "Sorry, the requested table is already occupied or does not exist.";
    }

    res.render("customer/bookTable", {
        tableNumber,
        errorMessage
    });
});


// TEMPORARY — DELETE AFTER USE
router.get("/dev/add-admin", async (req, res) => {
    const bcrypt = require("bcryptjs");
    const adminModel = require("../../models/admin");

    const hash = await bcrypt.hash("admin123", 10);

    await adminModel.createAdmin({
        username: "admin",
        password: hash
    });

    res.send("Admin created");
});




module.exports = router;
