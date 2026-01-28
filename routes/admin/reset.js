const express = require("express");
const router = express.Router();

const { postEndOfDayReset } = require("../../controllers/admin/resetController");

// POST /admin/endOfDayReset
router.post("/endOfDayReset", postEndOfDayReset);

module.exports = router;
