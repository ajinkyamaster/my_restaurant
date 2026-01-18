const express = require("express");
const router = express.Router();

const { getDb } = require("../../data/database");

// GET /admin/viewAllBookings
router.get("/viewAllBookings", async (req, res) => {
    const db = getDb();
    const bookings = await db.collection("bookings").find({}).toArray();

    res.render("admin/viewAllBookings", { bookings });
});

module.exports = router;
