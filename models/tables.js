const { ObjectId } = require("mongodb");
const { getDb } = require("../data/database");

const COLLECTION = "tables";

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
const getVacantTableByCapacity = async (requiredCapacity) => {
    const db = getDb();
    return await db.collection(COLLECTION).findOne({
        isVacant: true,
        capacity: { $gte: Number(requiredCapacity) }
    });
};


module.exports = {
    addTable,
    deleteTable,
    getVacantTable,
    markTableOccupied,
    getVacantTableByCapacity
};
