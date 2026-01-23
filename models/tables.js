const { ObjectId } = require("mongodb");
const { getDb } = require("../data/database");

const COLLECTION = "tables";

// -------------------- EXISTING FUNCTIONS (DO NOT CHANGE) --------------------

// Add new table
const addTable = async (tableData) => {
    const db = getDb();
    return await db.collection(COLLECTION).insertOne({
        tableNumber: tableData.tableNumber,
        capacity: tableData.capacity,
        isVacant: true
    });
};

// Delete table
const deleteTable = async (id) => {
    const db = getDb();
    return await db.collection(COLLECTION).deleteOne({
        _id: new ObjectId(id)
    });
};

// Get one vacant table
const getVacantTable = async () => {
    const db = getDb();
    return await db.collection(COLLECTION).findOne({
        isVacant: true
    });
};

// Mark table as occupied
const markTableOccupied = async (tableId) => {
    const db = getDb();
    return await db.collection(COLLECTION).updateOne(
        { _id: new ObjectId(tableId) },
        { $set: { isVacant: false } }
    );
};

// Get vacant table with required capacity
const getTableByTableNumber = async (tableNumber) => {
    const db = getDb();
    return await db.collection(COLLECTION).findOne({
        isVacant: true,
        tableNumber: Number(tableNumber)
    });
};

// -------------------- NEW FUNCTIONS (ADMIN CRUD ONLY) --------------------

// Get all tables (admin view)
const getAllTables = async () => {
    const db = getDb();
    return await db.collection(COLLECTION).find({}).toArray();
};

// Get table by ID (admin edit)
const getTableById = async (id) => {
    const db = getDb();
    return await db.collection(COLLECTION).findOne({
        _id: new ObjectId(id)
    });
};

// Update table details (admin edit)
const updateTable = async (id, tableNumber, capacity, isVacant) => {
    const db = getDb();
    return await db.collection(COLLECTION).updateOne(
        { _id: new ObjectId(id) },
        {
            $set: {
                tableNumber: Number(tableNumber),
                capacity: Number(capacity),
                isVacant: Boolean(isVacant)
            }
        }
    );
};

// Mark table as vacant (after customer leaves)
const markTableVacant = async (tableId) => {
    const db = getDb();
    return await db.collection(COLLECTION).updateOne(
        { _id: new ObjectId(tableId) },
        { $set: { isVacant: true } }
    );
};

// Set all tables to vacant (end of day reset)
const markAllTablesVacant = async () => {
    const db = getDb();
    return await db.collection(COLLECTION).updateMany(
        {},
        { $set: { isVacant: true } }
    );
};



module.exports = {
    // existing exports
    addTable,
    deleteTable,
    getVacantTable,
    markTableOccupied,
    getTableByTableNumber,
    markTableVacant,

    // new admin exports
    getAllTables,
    getTableById,
    updateTable,
    markAllTablesVacant
};
