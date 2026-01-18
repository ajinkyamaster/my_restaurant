const express = require("express");
const router = express.Router();

const adminProtectMiddleware = require("../../middlewares/adminProtect");
const adminLoginRoutes = require("./adminLogin");
const dashboardRoutes = require("./dashboard");
const bookingsRoutes = require("./bookings");
const tablesRoutes = require("./tables");
const menuRoutes = require("./menu");
const resetRoutes = require("./reset");

// admin end of day reset route
router.use("/admin", resetRoutes);


// apply protection to all /admin routes
router.use("/admin", adminProtectMiddleware);

// admin login routes
router.use("/admin", adminLoginRoutes);

// admin dashboard route
router.use("/admin", dashboardRoutes);

// admin viewbookings route
router.use("/admin", bookingsRoutes);

// admin livetablestatus route
router.use('/admin', tablesRoutes);

// admin menu management route
router.use('/admin', menuRoutes);


module.exports = router;