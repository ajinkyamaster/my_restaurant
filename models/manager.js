const { getDb } = require("../data/database");
const bcrypt = require("bcryptjs");

const COLLECTION = "managers";

// Find manager by username
const findManagerByUsername = async (username) => {
    const db = getDb();
    return await db.collection(COLLECTION).findOne({ username });
};

const verifyPassword = async (manager, password) => {

    return await bcrypt.compare(password, manager.password);
}

const createManager = async (username, password) => {
    const db = getDb();
    const hashedPassword = await bcrypt.hash(password, 12);

    const newManager = {
        username,
        password: hashedPassword
    };

    await db.collection(COLLECTION).insertOne(newManager);
};

const vacateManager = async (username) => {
    const db = getDb();
    const result = await db.collection(COLLECTION).deleteOne({ username });
    return result.deletedCount > 0;
};

const getAllManagers = async () => {
    const db = getDb();
    return await db.collection(COLLECTION).find().toArray();
};

module.exports = {
    findManagerByUsername,
    verifyPassword,
    createManager,
    vacateManager,
    getAllManagers
};