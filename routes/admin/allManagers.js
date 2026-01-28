const express = require("express");
const router = express.Router();

const { getAllManagers } = require("../../controllers/admin/managersController");

router.get("/allManagers", getAllManagers);

module.exports = router;
