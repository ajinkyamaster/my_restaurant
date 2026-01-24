const express = require("express");
const router = express.Router();

router.get("/create-new-admin", (req, res) => {
    res.render("admin/add-admin");
});

router.get("/create-new-manager", (req, res) => {
    res.render("admin/add-manager");
});


router.post("/create-new-admin", async (req, res) => {
    const { username, password } = req.body;

    const adminModel = require("../../models/admin");

    try {
        const existingAdmin = await adminModel.findAdminByUsername(username);
        if (existingAdmin) {
            return res.status(400).send("Admin/Manager with this username already exists.");
        }

        await adminModel.createAdmin({ username, password });
        res.send("Admin/Manager created successfully.");
    } catch (error) {
        console.error("Error creating admin/manager:", error);
        res.status(500).send("Failed to create admin/manager.");
    }
});



router.post("/create-new-manager", async (req, res) => {
    const { username, password } = req.body;

    const managerModel = require("../../models/manager");
    
    try {
        const existingManager = await managerModel.findManagerByUsername(username);
        if (existingManager) {
            return res.status(400).send("Manager with this username already exists.");
        }

        await managerModel.createManager(username, password);
        res.send("Manager created successfully.");
    } catch (error) {
        console.error("Error creating manager:", error);
        res.status(500).send("Failed to create manager.");
    }
});


module.exports = router;