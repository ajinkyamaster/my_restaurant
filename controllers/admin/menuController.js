const menuModel = require("../../models/menu");

// GET /admin/menu
async function getMenu(req, res) {
    const menuItems = await menuModel.getAllMenuItems();
    res.render("admin/manageMenu", { menuItems });
}

// GET /admin/editMenuItem/:id
async function getEditMenuItem(req, res) {
    const item = await menuModel.getMenuItemById(req.params.id);
    res.render("admin/editMenuItem", { item });
}

// POST /admin/editMenuItem
async function postEditMenuItem(req, res) {
    const { id, name, price } = req.body;
    await menuModel.updateMenuItem(id, name, Number(price));
    res.redirect("/admin/menu");
}

// POST /admin/deleteMenuItem
async function postDeleteMenuItem(req, res) {
    await menuModel.deleteMenuItem(req.body.id);
    res.redirect("/admin/menu");
}

// GET /admin/addNewMenuItem
function getAddNewMenuItem(req, res) {
    res.render("admin/addNewMenuItem");
}

// POST /admin/addNewMenuItem
async function postAddNewMenuItem(req, res) {
    const { name, price } = req.body;
    await menuModel.addMenuItem(name, Number(price));
    res.redirect("/admin/menu");
}

module.exports = {
    getMenu,
    getEditMenuItem,
    postEditMenuItem,
    postDeleteMenuItem,
    getAddNewMenuItem,
    postAddNewMenuItem
};
