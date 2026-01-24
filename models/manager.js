const { getDb } = require("../data/database");
const bcrypt = require("bcryptjs");

const COLLECTION = "managers";

// Find manager by username
const findManagerByUsername = async (username) => {
    const db = getDb();
    return await db.collection(COLLECTION).findOne({ username });
};

const verifyPassword = async (manager, password) => {
    // In a real application, use hashed passwords and a library like bcrypt
    return manager.password === password;
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

module.exports = {
    findManagerByUsername,
    verifyPassword,
    createManager
};