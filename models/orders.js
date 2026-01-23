const { getDb } = require("../data/database");

const { ObjectId } = require("mongodb");

const COLLECTION = "orders";

// Store a new order
const createOrder = async (orderData) => {
    const db = getDb();
    return await db.collection(COLLECTION).insertOne(orderData);
};

// Retrieve all orders (manager)
const getAllOrders = async () => {
    const db = getDb();
    return await db
        .collection(COLLECTION)
        .find({})
        .sort({ orderedAt: -1 })
        .toArray();
};

// ✅ Clear all orders (end of day)
const clearAllOrders = async () => {
    const db = getDb();
    return await db.collection(COLLECTION).deleteMany({});
};

// Fetch orders for a specific table number (customer view)
const getOrdersByTableNumber = async (tableNumber) => {
    const db = getDb();
    // Sort newest first so recent items show up on top
    return await db
        .collection(COLLECTION)
        .find({ tableNumber })
        .sort({ orderedAt: -1 })
        .toArray();
};

// Update order status (manager action)
const updateOrderStatus = async (orderId, status) => {
    const db = getDb();
    return await db.collection(COLLECTION).updateOne(
        { _id: new ObjectId(orderId) },
        { $set: { status } }
    );
};


module.exports = {
    createOrder,
    getAllOrders,
    clearAllOrders,
    updateOrderStatus,
    getOrdersByTableNumber
};
