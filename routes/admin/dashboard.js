const express = require("express");
const router = express.Router();

const { getDashboard } = require("../../controllers/admin/dashboardController");

// GET /admin/dashboard
router.get("/dashboard", getDashboard);

module.exports = router;
