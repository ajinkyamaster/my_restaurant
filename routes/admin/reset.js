const express = require("express");
const router = express.Router();

const bookingsModel = require("../../models/bookings");
const tablesModel = require("../../models/tables");

// POST /admin/endOfDayReset
router.post("/endOfDayReset", async (req, res) => {
    // clear all bookings
    await bookingsModel.clearAllBookings();

    // set all tables to vacant
    await tablesModel.markAllTablesVacant();

    res.redirect("/admin/dashboard");
});

module.exports = router;
