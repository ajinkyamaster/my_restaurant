const express = require("express");
const router = express.Router();

const { postBookTable } = require("../../controllers/customer/tablesController");

//post book table
router.post("/bookTable", postBookTable);

module.exports = router;
