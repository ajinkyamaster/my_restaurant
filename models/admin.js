const { getDb } = require("../data/database");

const bcrypt = require("bcryptjs");

const COLLECTION = "admins";

const findAdminByUsername = async (username) => {
    const db = getDb();
    return await db.collection(COLLECTION).findOne({ username });
};

const createAdmin = async (username, password) => {
    const db = getDb();

    const hashedPassword = await bcrypt.hash(password, 12);

    const newAdmin = {
        username,
        password: hashedPassword
    };

    await db.collection(COLLECTION).insertOne(newAdmin);
};

module.exports = {
    findAdminByUsername,
    createAdmin
};
