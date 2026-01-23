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

router.get("/logout", (req, res) => {
    req.session.admin = false;
    req.session.adminUser = null;
    res.redirect("/admin/login");
});


module.exports = router;
