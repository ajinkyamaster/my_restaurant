const bookingsModel = require("../../models/bookings");
const tablesModel = require("../../models/tables");
const { startTableSession } = require("../../services/tableSession");
const validate = require("../../utils/validate");
const { ConflictError } = require("../../utils/errors");

async function apiGetTables(req, res) {
    const tables = await tablesModel.getAllTables();
    res.json(tables);
}

/**
 * Book a table.
 *
 * The table is claimed with one atomic conditional update, so two people
 * scanning/entering the same table number at the same moment cannot both win.
 */
async function apiBookTable(req, res) {
    const name = validate.str(req.body && req.body.name, { field: "name", min: 1, max: 60 });
    const tableNumber = validate.int(req.body && req.body.tableNumber, {
        field: "tableNumber",
        min: 1,
        max: 9999
    });

    const table = await tablesModel.claimVacantTable(tableNumber);
    if (!table) {
        throw new ConflictError(`Table ${tableNumber} is not available`);
    }

    const bookingData = {
        customerName: name,
        tableNumber: table.tableNumber,
        bookingTime: new Date()
    };

    try {
        await bookingsModel.createBooking(bookingData);
        await startTableSession(res, table, name);
    } catch (error) {
        // Never leave a table occupied by a booking that failed halfway.
        await tablesModel.releaseTable(table._id).catch(() => {});
        throw error;
    }

    res.json({ success: true, booking: bookingData });
}

module.exports = {
    apiGetTables,
    apiBookTable
};
