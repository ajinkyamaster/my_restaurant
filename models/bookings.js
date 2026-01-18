const { getDb } = require("../data/database");

const COLLECTION = "bookings";

const createBooking = async (bookingData) => {
    const db = getDb();
    return await db.collection(COLLECTION).insertOne({
        customerName: bookingData.customerName,
        contact: bookingData.contact,
        dateTimeIn: bookingData.dateTimeIn,
        tableNumber: bookingData.tableNumber,
        requestedCapacity: bookingData.requestedCapacity,
        createdAt: new Date()
    });
};

// delete all bookings (end of day)
const clearAllBookings = async () => {
    const db = getDb();
    return await db.collection(COLLECTION).deleteMany({});
};

module.exports = {
    createBooking,
    clearAllBookings
};
