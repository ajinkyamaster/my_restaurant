const express = require("express");
const router = express.Router();

const adminAuthMiddleware = require("../../middlewares/adminAuth");

// GET /admin/login
router.get("/login", (req, res) => {
    res.render("admin/login", { error: null });
});

// POST /admin/login
router.post("/login", adminAuthMiddleware, (req, res) => {
    req.session.admin = true;
    req.session.adminUser = req.admin;

    res.redirect("/admin/dashboard");
});


module.exports = router;
