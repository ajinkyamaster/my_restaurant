const express = require("express");
const router = express.Router();

const tablesModel = require("../../models/tables");

/* ---------------- EXISTING: Live Table Status ---------------- */

// GET /admin/liveTableStatus
router.get("/liveTableStatus", async (req, res) => {
    const tables = await tablesModel.getAllTables();
    res.render("admin/liveTableStatus", { tables });
});

/* ---------------- NEW: Tables CRUD ---------------- */

// GET /admin/tables (manage tables page)
router.get("/tables", async (req, res) => {
    const tables = await tablesModel.getAllTables();
    res.render("admin/manageTables", { tables });
});

// GET /admin/addTable
router.get("/addTable", (req, res) => {
    res.render("admin/addTable");
});

// POST /admin/addTable
router.post("/addTable", async (req, res) => {
    const { tableNumber, capacity } = req.body;

    await tablesModel.addTable({
        tableNumber: Number(tableNumber),
        capacity: Number(capacity)
    });

    res.redirect("/admin/tables");
});

// GET /admin/editTable/:id
router.get("/editTable/:id", async (req, res) => {
    const table = await tablesModel.getTableById(req.params.id);
    res.render("admin/editTable", { table });
});

// POST /admin/editTable
router.post("/editTable", async (req, res) => {
    const { id, tableNumber, capacity, isVacant } = req.body;

    await tablesModel.updateTable(
        id,
        Number(tableNumber),
        Number(capacity),
        isVacant === "true"
    );

    res.redirect("/admin/tables");
});

// POST /admin/deleteTable
router.post("/deleteTable", async (req, res) => {
    await tablesModel.deleteTable(req.body.id);
    res.redirect("/admin/tables");
});

module.exports = router;
