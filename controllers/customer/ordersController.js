const ordersModel = require("../../models/orders");
const { getTableSession } = require("../../services/tableSession");

async function apiGetOrders(req, res) {
    const session = await getTableSession(req);
    if (!session) {
        return res.status(401).json({ error: "No active table session", redirect: "/booking" });
    }

    const orders = await ordersModel.getOrdersBySessionId(session._id);
    res.json({ orders, tableNumber: session.tableNumber });
}

module.exports = {
    apiGetOrders
};
