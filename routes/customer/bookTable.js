const express = require("express");
const router = express.Router();

const bookingsModel = require("../../models/bookings");
const tablesModel = require("../../models/tables");
const { createTableSession } = require("../../session/session-config");


//post book table
router.post("/bookTable", async (req, res) => {
    try {
        const { name, phone, time, capacity } = req.body;

        // 1. Get vacant table matching capacity
        const vacantTable = await tablesModel.getVacantTableByCapacity(capacity);

        if (!vacantTable) {
            return res.status(400).send("No suitable table available");
        }

        // 2. Prepare booking data
        const bookingData = {
            customerName: name,
            contact: phone,
            dateTimeIn: time,
            tableNumber: vacantTable.tableNumber,
            requestedCapacity: Number(capacity)
        };

        // 3. Save booking
        await bookingsModel.createBooking(bookingData);

        // 4. Mark table occupied
        await tablesModel.markTableOccupied(vacantTable._id);

        // 5. Create session for the table
        createTableSession(req, vacantTable.tableNumber);

        // 5. Render confirmation
        res.render("customer/bookingConfirmed", {
            booking: bookingData
        });

    } catch (error) {
        console.error(error);
        res.status(500).send("Booking failed");
    }
});



module.exports = router;
