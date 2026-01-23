const { getDb } = require("../data/database");

const COLLECTION = "bookings";

const createBooking = async (bookingData) => {
    const db = getDb();
    return await db.collection(COLLECTION).insertOne({
        customerName: bookingData.customerName,
        tableNumber: bookingData.tableNumber,
        createdAt: bookingData.bookingTime
    });
};

// delete all bookings (end of day)
const clearAllBookings = async () => {
    const db = getDb();
    return await db.collection(COLLECTION).deleteMany({});
};

const getAllBookings = async () => {
    const db = getDb();
    return await db.collection(COLLECTION).find().toArray();
};

module.exports = {
    createBooking,
    clearAllBookings,
    getAllBookings
};
