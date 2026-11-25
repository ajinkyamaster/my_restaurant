const express = require("express");
const router = express.Router();

const { refreshStaffSession } = require("../../auth/staffAuth");

/**
 * Rotate the refresh token and mint a new access token.
 * Shared by the admin and manager panels (the refresh token records its role).
 */
router.post("/refresh", async (req, res) => {
    const user = await refreshStaffSession(req, res);
    res.json({ success: true, user });
});

module.exports = router;
