const express = require("express");
const router = express.Router();

const {
    getCreateAdmin,
    getCreateManager,
    getVacateManager,
    postVacateManager,
    postCreateAdmin,
    postCreateManager
} = require("../../controllers/admin/managersController");

router.get("/create-new-admin", getCreateAdmin);
router.get("/create-new-manager", getCreateManager);
router.get("/vacate-manager", getVacateManager);

router.post("/vacate-manager", postVacateManager);
router.post("/create-new-admin", postCreateAdmin);
router.post("/create-new-manager", postCreateManager);

module.exports = router;