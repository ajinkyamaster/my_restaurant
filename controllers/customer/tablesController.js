const bookingsModel = require("../../models/bookings");
const tablesModel = require("../../models/tables");
const { createTableSession } = require("../../session/session-config");

// ─── API: GET /api/tables ─── Returns all tables with vacancy info
async function apiGetTables(req, res) {
    try {
        const tables = await tablesModel.getAllTables();
        res.json(tables);
    } catch (err) {
        console.error("API: Failed to fetch tables", err);
        res.status(500).json({ error: "Failed to load tables" });
    }
}

// ─── API: POST /api/bookTable ─── Book a table (JSON)
async function apiBookTable(req, res) {
    try {
        const { name, tableNumber } = req.body;
        const desiredTable = await tablesModel.getTableByTableNumber(parseInt(tableNumber));

        if (!desiredTable) {
            return res.status(400).json({ error: `Table ${tableNumber} is already occupied or does not exist.` });
        }

        const bookingData = {
            customerName: name,
            tableNumber: desiredTable.tableNumber,
            bookingTime: new Date(),
        };

        await bookingsModel.createBooking(bookingData);
        await tablesModel.markTableOccupied(desiredTable._id);
        createTableSession(req, desiredTable, name);

        res.json({ success: true, booking: bookingData });
    } catch (err) {
        console.error("API: Booking failed", err);
        res.status(500).json({ error: "Booking failed" });
    }
}

module.exports = {
    apiGetTables,
    apiBookTable
};
