const express = require("express");
const router = express.Router();

const managerModel = require("../../models/manager");

// GET /manager/login
router.get("/login", (req, res) => {
    res.render("manager/manager-login");
});

// POST /manager/login
router.post("/login", async (req, res) => {
    const { username, password } = req.body;

     const manager = await managerModel.findManagerByUsername(username);

    if (!manager) {
        return res.render("manager/manager-login", { error: "Invalid credentials" });
    }

    const isPasswordValid = await managerModel.verifyPassword(manager, password);

    if (!isPasswordValid) {
        return res.render("manager/manager-login", { error: "Invalid credentials" });
    } 
    req.session.manager = true;
    res.redirect("/manager/dashboard");
});

// GET /manager/logout
router.get("/logout", (req, res) => {
    req.session.manager = false;
    res.redirect("/");
});

module.exports = router;
