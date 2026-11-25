const { ObjectId } = require("mongodb");
const { getDb } = require("../data/database");
const bcrypt = require("bcryptjs");

const COLLECTION = "admins";

const findAdminByUsername = async (username) => {
    const db = getDb();
    return db.collection(COLLECTION).findOne({ username: String(username) });
};

const findAdminById = async (id) => {
    if (typeof id !== "string" || !ObjectId.isValid(id)) return null;
    const db = getDb();
    return db.collection(COLLECTION).findOne({ _id: new ObjectId(id) });
};

const createAdmin = async ({ username, password }) => {
    const db = getDb();

    if (!password) {
        throw new Error("Password is required");
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const newAdmin = {
        username,
        password: hashedPassword,
        // Bumping this invalidates every access token issued to the account.
        tokenVersion: 0,
        createdAt: new Date()
    };

    const result = await db.collection(COLLECTION).insertOne(newAdmin);
    return { ...newAdmin, _id: result.insertedId };
};

/** Revoke every outstanding token for an account (password change, incident). */
const bumpTokenVersion = async (id) => {
    const db = getDb();
    return db.collection(COLLECTION).updateOne(
        { _id: new ObjectId(id) },
        { $inc: { tokenVersion: 1 } }
    );
};

module.exports = {
    findAdminByUsername,
    findAdminById,
    createAdmin,
    bumpTokenVersion
};
