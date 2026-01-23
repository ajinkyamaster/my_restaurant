const express = require("express");
const router = express.Router();

const { getDb } = require("../../data/database");

const tablesModel = require("../../models/tables");
const bookingsModel = require("../../models/bookings");

// GET /viewAllBookings
router.get("/viewAllBookings", async (req, res) => {
    const bookings = await bookingsModel.getAllBookings();

    const bookingsWithStatus = await Promise.all(
        bookings.map(async (b) => {
            const vacantTable = await tablesModel.getTableByTableNumber(b.tableNumber);

            return {
                ...b,
                status: vacantTable
                    ? "Booking Expired"
                    : "Booking Active"
            };
        })
    );

    res.render("admin/viewAllBookings", {
        bookings: bookingsWithStatus
    });
});


module.exports = router;
