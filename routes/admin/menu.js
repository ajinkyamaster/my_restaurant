const express = require("express");
const router = express.Router();

const menuModel = require("../../models/menu");

// GET /admin/menu
router.get("/menu", async (req, res) => {
    const menuItems = await menuModel.getAllMenuItems();
    res.render("admin/manageMenu", { menuItems });
});

// GET /admin/editMenuItem/:id
router.get("/editMenuItem/:id", async (req, res) => {
    const item = await menuModel.getMenuItemById(req.params.id);
    res.render("admin/editMenuItem", { item });
});

// POST /admin/editMenuItem
router.post("/editMenuItem", async (req, res) => {
    const { id, name, price } = req.body;
    await menuModel.updateMenuItem(id, name, Number(price));
    res.redirect("/admin/menu");
});

// POST /admin/deleteMenuItem
router.post("/deleteMenuItem", async (req, res) => {
    await menuModel.deleteMenuItem(req.body.id);
    res.redirect("/admin/menu");
});

// GET /admin/addNewMenuItem
router.get("/addNewMenuItem", (req, res) => {
    res.render("admin/addNewMenuItem");
});

// POST /admin/addNewMenuItem
router.post("/addNewMenuItem", async (req, res) => {
    const { name, price } = req.body;
    await menuModel.addMenuItem(name, Number(price));
    res.redirect("/admin/menu");
});

module.exports = router;
