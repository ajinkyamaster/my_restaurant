const ordersModel = require("../../models/orders");

// ─── API: GET /api/orders ─── Returns orders as JSON
async function apiGetOrders(req, res) {
    if (!req.session.table || !req.session.table.tableNumber) {
        return res.status(401).json({ error: "No active table session", redirect: "/booking" });
    }
    const tableNumber = req.session.table.tableNumber;
    try {
        const orders = await ordersModel.getOrdersByTableNumber(tableNumber);
        res.json({ orders, tableNumber });
    } catch (err) {
        console.error("API: Failed to fetch orders for table", tableNumber, err);
        res.status(500).json({ error: "Failed to load orders" });
    }
}

module.exports = {
    apiGetOrders
};
