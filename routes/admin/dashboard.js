const express = require("express");
const router = express.Router();

// GET /admin/dashboard
router.get("/dashboard", (req, res) => {
    res.render("admin/dashboard", {
        admin: req.session.adminUser
    });
});

module.exports = router;
