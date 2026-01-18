const { getDb } = require("../data/database");

const COLLECTION = "admin";

const findAdminByUsername = async (username) => {
    const db = getDb();
    return await db.collection(COLLECTION).findOne({ username });
};

module.exports = {
    findAdminByUsername
};
