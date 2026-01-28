const bookingsModel = require("../../models/bookings");
const tablesModel = require("../../models/tables");
const ordersModel = require("../../models/orders");

// POST /admin/endOfDayReset
async function postEndOfDayReset(req, res) {
    // 1️⃣ Clear all bookings
    await bookingsModel.clearAllBookings();

    // 2️⃣ Set all tables to vacant
    await tablesModel.markAllTablesVacant();

    // 3️⃣ Clear all orders
    await ordersModel.clearAllOrders();

    res.redirect("/admin/dashboard");
}

module.exports = {
    postEndOfDayReset
};
