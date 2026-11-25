const { ObjectId } = require("mongodb");
const { getDb } = require("../data/database");
const bcrypt = require("bcryptjs");

const COLLECTION = "managers";

const findManagerByUsername = async (username) => {
    const db = getDb();
    return db.collection(COLLECTION).findOne({ username: String(username) });
};

const findManagerById = async (id) => {
    if (typeof id !== "string" || !ObjectId.isValid(id)) return null;
    const db = getDb();
    return db.collection(COLLECTION).findOne({ _id: new ObjectId(id) });
};

const verifyPassword = async (manager, password) => {
    return bcrypt.compare(password, manager.password);
};

const createManager = async (username, password) => {
    const db = getDb();
    const hashedPassword = await bcrypt.hash(password, 12);

    const newManager = {
        username,
        password: hashedPassword,
        tokenVersion: 0,
        createdAt: new Date()
    };

    const result = await db.collection(COLLECTION).insertOne(newManager);
    return { ...newManager, _id: result.insertedId };
};

/**
 * Deletes the account. Outstanding manager tokens stop working on the next
 * request because the auth middleware re-loads the manager by id.
 */
const vacateManager = async (username) => {
    const db = getDb();
    const result = await db.collection(COLLECTION).deleteOne({ username: String(username) });
    return result.deletedCount > 0;
};

const getAllManagers = async () => {
    const db = getDb();
    return db.collection(COLLECTION).find({}, { projection: { password: 0 } }).toArray();
};

module.exports = {
    findManagerByUsername,
    findManagerById,
    verifyPassword,
    createManager,
    vacateManager,
    getAllManagers
};
