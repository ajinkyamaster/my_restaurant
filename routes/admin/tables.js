const express = require("express");
const router = express.Router();

const {
    getLiveTableStatus,
    getTables,
    getAddTable,
    postAddTable,
    getEditTable,
    postEditTable,
    postDeleteTable
} = require("../../controllers/admin/tablesController");

/* ---------------- EXISTING: Live Table Status ---------------- */

// GET /admin/liveTableStatus
router.get("/liveTableStatus", getLiveTableStatus);

/* ---------------- NEW: Tables CRUD ---------------- */

// GET /admin/tables (manage tables page)
router.get("/tables", getTables);

// GET /admin/addTable
router.get("/addTable", getAddTable);

// POST /admin/addTable
router.post("/addTable", postAddTable);

// GET /admin/editTable/:id
router.get("/editTable/:id", getEditTable);

// POST /admin/editTable
router.post("/editTable", postEditTable);

// POST /admin/deleteTable
router.post("/deleteTable", postDeleteTable);

module.exports = router;
