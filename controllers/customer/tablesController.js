const bookingsModel = require("../../models/bookings");
const tablesModel = require("../../models/tables");
const { createTableSession } = require("../../session/session-config");

async function postBookTable(req, res) {
    try {
        const { name, tableNumber } = req.body;
        
        // 1. Get vacant table matching capacity
        const desiredTable = await tablesModel.getTableByTableNumber(tableNumber);

        if (!desiredTable) {
            return res.redirect("/bookTable?error=table_occupied&tableNumber=" + tableNumber);
        }

        // 2. Prepare booking data
        const bookingData = {
            customerName: name,
            tableNumber: desiredTable.tableNumber,
            bookingTime: new Date()
        };

        // 3. Save booking
        await bookingsModel.createBooking(bookingData);

        // 4. Mark table occupied
        await tablesModel.markTableOccupied(desiredTable._id);

        // 5. Create session for the table
        createTableSession(req, desiredTable, name);

        // 6. Render confirmation
        res.render("customer/bookingConfirmed", {
            booking: bookingData
        });

    } catch (error) {
        console.error(error);
        res.status(500).send("Booking failed");
    }
}

module.exports = {
    postBookTable
};
