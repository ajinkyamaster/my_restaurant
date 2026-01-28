const express = require("express");
const router = express.Router();

const { getEndSession, postVacateTable } = require("../../controllers/customer/sessionController");

// GET /endSession
router.get("/endSession", getEndSession);

// POST /vacateTable
router.post("/vacateTable", postVacateTable);

module.exports = router;
