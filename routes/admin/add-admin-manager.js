const express = require("express");
const router = express.Router();

router.get("/create-new-admin", (req, res) => {
    res.render("admin/add-admin", { message: null });
});

router.get("/create-new-manager", (req, res) => {
    res.render("admin/add-manager", { message: null });
});

router.get("/vacate-manager", (req, res) => {
    res.render("admin/vacate-manager", { message: null });
});

router.post("/vacate-manager", async (req, res) => {
    const { username } = req.body;

    const managerModel = require("../../models/manager");

    try {
        const manager = await managerModel.findManagerByUsername(username);
        if (!manager) {
            return res.status(404).render("admin/vacate-manager", { message: "Manager not found." });
        }
        await managerModel.vacateManager(username);
        res.render("admin/vacate-manager", { message: "Manager vacated successfully." });
    } catch (error) {
        console.error("Error vacating manager:", error);
        res.status(500).render("admin/vacate-manager", { message: "Failed to vacate manager." });
    }
});


router.post("/create-new-admin", async (req, res) => {
    const { username, password } = req.body;

    const adminModel = require("../../models/admin");

    try {
        const existingAdmin = await adminModel.findAdminByUsername(username);
        if (existingAdmin) {
            return res.status(400).render("admin/add-admin", { message: "Admin with this username already exists." });
        }

        await adminModel.createAdmin({ username, password });
        res.render("admin/add-admin", { message: "New admin created successfully!" });
    } catch (error) {
        console.error("Error creating admin:", error);
        res.status(500).render("admin/add-admin", { message: "Failed to create admin." });
    }
});



router.post("/create-new-manager", async (req, res) => {
    const { username, password } = req.body;

    const managerModel = require("../../models/manager");
    
    try {
        const existingManager = await managerModel.findManagerByUsername(username);
        if (existingManager) {
            return res.status(400).render("admin/add-manager", { message: "Manager with this username already exists." });
        }

        await managerModel.createManager(username, password);
        res.render("admin/add-manager", { message: "New manager created successfully!" });
    } catch (error) {
        console.error("Error creating manager:", error);
        res.status(500).send("Failed to create manager.");
    }
});


module.exports = router;