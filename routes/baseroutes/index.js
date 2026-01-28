const express = require("express");
const router = express.Router();

const {
    getHome,
    getAbout,
    getMenu,
    getBookTable,
    getBookTableWithNumber
} = require("../../controllers/baseController");

// Home route (customer)
router.get("/", getHome);

// GET /about
router.get("/about", getAbout);

// GET /menu
router.get("/menu", getMenu);

// GET /bookTable
router.get("/bookTable", getBookTable);

// GET /bookTable/:tableNumber
router.get("/bookTable/:tableNumber", getBookTableWithNumber);

module.exports = router;
