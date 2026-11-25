const menuModel = require("../models/menu");
const { getTableSession } = require("../services/tableSession");

async function apiGetMenu(req, res) {
    const menuItems = await menuModel.getAllMenuItems();
    res.json(menuItems);
}

async function apiGetSession(req, res) {
    const session = await getTableSession(req);
    if (!session) {
        return res.json({ active: false });
    }
    res.json({
        active: true,
        tableNumber: session.tableNumber,
        customerName: session.customerName
    });
}

module.exports = {
    apiGetMenu,
    apiGetSession
};
