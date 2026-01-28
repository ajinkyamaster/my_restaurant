const express = require("express");
const router = express.Router();

const {
    getMenu,
    getEditMenuItem,
    postEditMenuItem,
    postDeleteMenuItem,
    getAddNewMenuItem,
    postAddNewMenuItem
} = require("../../controllers/admin/menuController");

// GET /admin/menu
router.get("/menu", getMenu);

// GET /admin/editMenuItem/:id
router.get("/editMenuItem/:id", getEditMenuItem);

// POST /admin/editMenuItem
router.post("/editMenuItem", postEditMenuItem);

// POST /admin/deleteMenuItem
router.post("/deleteMenuItem", postDeleteMenuItem);

// GET /admin/addNewMenuItem
router.get("/addNewMenuItem", getAddNewMenuItem);

// POST /admin/addNewMenuItem
router.post("/addNewMenuItem", postAddNewMenuItem);

module.exports = router;
