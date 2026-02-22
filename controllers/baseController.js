const menuModel = require("../models/menu");

// ─── API: GET /api/menu ─── Returns menu items as JSON
async function apiGetMenu(req, res) {
    try {
        const menuItems = await menuModel.getAllMenuItems();
        res.json(menuItems);
    } catch (error) {
        console.error("API: Error fetching menu items:", error);
        res.status(500).json({ error: "Failed to load menu items" });
    }
}

// ─── API: GET /api/session ─── Returns current session info
function apiGetSession(req, res) {
    if (!req.session.table) {
        return res.json({ active: false });
    }
    res.json({
        active: true,
        tableNumber: req.session.table.tableNumber,
        customerName: req.session.table.customerName,
    });
}

module.exports = {
    apiGetMenu,
    apiGetSession
};
