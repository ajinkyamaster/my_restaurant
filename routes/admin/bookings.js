const express = require("express");
const router = express.Router();

const { getViewAllBookings } = require("../../controllers/admin/bookingsController");

// GET /viewAllBookings
router.get("/viewAllBookings", getViewAllBookings);

module.exports = router;
