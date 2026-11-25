const { ObjectId } = require("mongodb");
const { getDb } = require("../data/database");

const COLLECTION = "orders";

const createOrder = async (orderData) => {
    const db = getDb();
    const result = await db.collection(COLLECTION).insertOne(orderData);
    return { ...orderData, _id: result.insertedId };
};

const getAllOrders = async () => {
    const db = getDb();
    return db
        .collection(COLLECTION)
        .find({})
        .sort({ orderedAt: -1 })
        .toArray();
};

const clearAllOrders = async () => {
    const db = getDb();
    return db.collection(COLLECTION).deleteMany({});
};

/**
 * Orders belong to a table *session*, not to a table number. Keying history by
 * number leaked the previous diners' orders to whoever booked that table next.
 */
const getOrdersBySessionId = async (tableSessionId) => {
    if (!ObjectId.isValid(tableSessionId)) return [];
    const db = getDb();
    return db
        .collection(COLLECTION)
        .find({ tableSessionId: new ObjectId(tableSessionId) })
        .sort({ orderedAt: -1 })
        .toArray();
};

const getOrdersByTableNumber = async (tableNumber) => {
    const db = getDb();
    return db
        .collection(COLLECTION)
        .find({ tableNumber: Number(tableNumber) })
        .sort({ orderedAt: -1 })
        .toArray();
};

/** Only a PLACED order can be accepted; state transitions are explicit. */
const acceptOrder = async (orderId) => {
    const db = getDb();
    return db.collection(COLLECTION).updateOne(
        { _id: new ObjectId(orderId), status: "PLACED" },
        { $set: { status: "ACCEPTED", acceptedAt: new Date() } }
    );
};

const updateOrderStatus = async (orderId, status) => {
    const db = getDb();
    return db.collection(COLLECTION).updateOne(
        { _id: new ObjectId(orderId) },
        { $set: { status } }
    );
};

module.exports = {
    createOrder,
    getAllOrders,
    clearAllOrders,
    acceptOrder,
    updateOrderStatus,
    getOrdersBySessionId,
    getOrdersByTableNumber
};
