const express = require("express");
const router = express.Router();

const adminProtectMiddleware = require("../../middlewares/adminProtect");
const adminLoginRoutes = require("./adminLogin");
const dashboardRoutes = require("./dashboard");
const bookingsRoutes = require("./bookings");
const tablesRoutes = require("./tables");
const menuRoutes = require("./menu");
const resetRoutes = require("./reset");
const addAdminManagerRoutes = require("./add-admin-manager");
const allManagersRoutes = require("./allManagers");


router.use("/admin", adminLoginRoutes);

// apply protection to all /admin routes
router.use("/admin", adminProtectMiddleware);

// admin dashboard route
router.use("/admin", dashboardRoutes);

// admin viewbookings route
router.use("/admin", bookingsRoutes);

// admin livetablestatus route
router.use('/admin', tablesRoutes);

// admin menu management route
router.use('/admin', menuRoutes);

// route to view all managers
router.use("/admin", allManagersRoutes);

// route to add admin/manager
router.use("/admin", addAdminManagerRoutes);

// admin end of day reset route
router.use("/admin", resetRoutes);


module.exports = router;