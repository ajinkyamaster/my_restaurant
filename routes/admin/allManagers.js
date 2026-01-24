const express = require("express");
const router = express.Router();

const managerModel = require("../../models/manager");

router.get("/allManagers", async (req, res) => {
    try {
        const managers = await managerModel.getAllManagers();
        res.render("admin/allManagers", { managers });
    } catch (error) {
        console.error("Error fetching managers:", error);
        res.status(500).send("Failed to load managers");
    }
});



module.exports = router;
