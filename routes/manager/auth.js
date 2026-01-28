const express = require("express");
const router = express.Router();

const { getLogin, postLogin, getLogout } = require("../../controllers/manager/authController");

// GET /manager/login
router.get("/login", getLogin);

// POST /manager/login
router.post("/login", postLogin);

// GET /manager/logout
router.get("/logout", getLogout);

module.exports = router;
