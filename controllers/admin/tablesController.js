const tablesModel = require("../../models/tables");

/* ---------------- EXISTING: Live Table Status ---------------- */

// GET /admin/liveTableStatus
async function getLiveTableStatus(req, res) {
    const tables = await tablesModel.getAllTables();
    res.render("admin/liveTableStatus", { tables });
}

/* ---------------- NEW: Tables CRUD ---------------- */

// GET /admin/tables (manage tables page)
async function getTables(req, res) {
    const tables = await tablesModel.getAllTables();
    res.render("admin/manageTables", { tables });
}

// GET /admin/addTable
function getAddTable(req, res) {
    res.render("admin/addTable");
}

// POST /admin/addTable
async function postAddTable(req, res) {
    const { tableNumber, capacity } = req.body;

    await tablesModel.addTable({
        tableNumber: Number(tableNumber),
        capacity: Number(capacity)
    });

    res.redirect("/admin/tables");
}

// GET /admin/editTable/:id
async function getEditTable(req, res) {
    const table = await tablesModel.getTableById(req.params.id);
    res.render("admin/editTable", { table });
}

// POST /admin/editTable
async function postEditTable(req, res) {
    const { id, tableNumber, capacity, isVacant } = req.body;

    await tablesModel.updateTable(
        id,
        Number(tableNumber),
        Number(capacity),
        isVacant === "true"
    );

    res.redirect("/admin/tables");
}

// POST /admin/deleteTable
async function postDeleteTable(req, res) {
    await tablesModel.deleteTable(req.body.id);
    res.redirect("/admin/tables");
}

module.exports = {
    getLiveTableStatus,
    getTables,
    getAddTable,
    postAddTable,
    getEditTable,
    postEditTable,
    postDeleteTable
};
