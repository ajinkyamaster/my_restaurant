const express = require("express");
const router = express.Router();

const { getLogin, postLogin, getLogout, adminAuthMiddleware } = require("../../controllers/admin/authController");

// GET /admin/login
router.get("/login", getLogin);

// POST /admin/login
router.post("/login", adminAuthMiddleware, postLogin);

// GET /admin/logout
router.get("/logout", getLogout);

module.exports = router;
