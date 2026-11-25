const { ObjectId } = require("mongodb");
const { getDb } = require("../data/database");

const COLLECTION = "tables";

const addTable = async (tableData) => {
    const db = getDb();
    return db.collection(COLLECTION).insertOne({
        tableNumber: tableData.tableNumber,
        capacity: tableData.capacity,
        isVacant: true,
        createdAt: new Date()
    });
};

const deleteTable = async (id) => {
    const db = getDb();
    return db.collection(COLLECTION).deleteOne({
        _id: new ObjectId(id)
    });
};

const getVacantTable = async () => {
    const db = getDb();
    return db.collection(COLLECTION).findOne({ isVacant: true });
};

const markTableOccupied = async (tableId) => {
    const db = getDb();
    return db.collection(COLLECTION).updateOne(
        { _id: new ObjectId(tableId) },
        { $set: { isVacant: false } }
    );
};

/**
 * Look up a table by number only when it is vacant.
 * Admin "booking status" derivation uses this as a vacancy probe.
 */
const getTableByTableNumber = async (tableNumber) => {
    const db = getDb();
    return db.collection(COLLECTION).findOne({
        isVacant: true,
        tableNumber: Number(tableNumber)
    });
};

/**
 * Atomically claim a vacant table.
 *
 * findOne + updateOne is a race: two customers can both observe the table as
 * vacant. A single conditional findOneAndUpdate guarantees exactly one winner.
 */
const claimVacantTable = async (tableNumber) => {
    const db = getDb();
    return db.collection(COLLECTION).findOneAndUpdate(
        { tableNumber: Number(tableNumber), isVacant: true },
        { $set: { isVacant: false, occupiedAt: new Date() } },
        { returnDocument: "after" }
    );
};

const releaseTable = async (tableId) => {
    const db = getDb();
    return db.collection(COLLECTION).updateOne(
        { _id: new ObjectId(tableId) },
        { $set: { isVacant: true }, $unset: { occupiedAt: "" } }
    );
};

const getAllTables = async () => {
    const db = getDb();
    return db.collection(COLLECTION).find({}).sort({ tableNumber: 1 }).toArray();
};

const getTableById = async (id) => {
    const db = getDb();
    return db.collection(COLLECTION).findOne({
        _id: new ObjectId(id)
    });
};

const updateTable = async (id, tableNumber, capacity, isVacant) => {
    const db = getDb();
    return db.collection(COLLECTION).updateOne(
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

const markTableVacant = async (tableId) => {
    const db = getDb();
    return db.collection(COLLECTION).updateOne(
        { _id: new ObjectId(tableId) },
        { $set: { isVacant: true }, $unset: { occupiedAt: "" } }
    );
};

const markAllTablesVacant = async () => {
    const db = getDb();
    return db.collection(COLLECTION).updateMany(
        {},
        { $set: { isVacant: true }, $unset: { occupiedAt: "" } }
    );
};

module.exports = {
    addTable,
    deleteTable,
    getVacantTable,
    markTableOccupied,
    getTableByTableNumber,
    claimVacantTable,
    releaseTable,
    markTableVacant,

    getAllTables,
    getTableById,
    updateTable,
    markAllTablesVacant
};
