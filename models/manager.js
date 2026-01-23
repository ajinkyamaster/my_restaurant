const { getDb } = require("../data/database");

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

module.exports = {
    findManagerByUsername,
    verifyPassword
};