const { ObjectId } = require("mongodb");
const { getDb } = require("../data/database");

const COLLECTION = "refreshTokens";

/**
 * Only the SHA-256 hash of a refresh token is stored, so a database read can
 * never be replayed as a working credential.
 */
const create = async ({ userId, role, familyId, tokenHash, expiresAt }) => {
    const db = getDb();
    const doc = {
        userId: new ObjectId(userId),
        role,
        familyId,
        tokenHash,
        createdAt: new Date(),
        expiresAt,
        revokedAt: null,
        replacedByTokenHash: null
    };
    const result = await db.collection(COLLECTION).insertOne(doc);
    return { ...doc, _id: result.insertedId };
};

const findByHash = async (tokenHash) => {
    const db = getDb();
    return db.collection(COLLECTION).findOne({ tokenHash });
};

/**
 * Atomically mark a refresh token as used. Returns false when another request
 * already rotated it (double-use / replay), which the caller treats as reuse.
 */
const markRotated = async (record, replacedByTokenHash) => {
    const db = getDb();
    const result = await db.collection(COLLECTION).updateOne(
        { _id: record._id, revokedAt: null },
        { $set: { revokedAt: new Date(), replacedByTokenHash } }
    );
    return result.modifiedCount === 1;
};

const revokeFamily = async (familyId) => {
    const db = getDb();
    return db.collection(COLLECTION).updateMany(
        { familyId, revokedAt: null },
        { $set: { revokedAt: new Date() } }
    );
};

const revokeAllForUser = async (userId) => {
    const db = getDb();
    return db.collection(COLLECTION).updateMany(
        { userId: new ObjectId(userId), revokedAt: null },
        { $set: { revokedAt: new Date() } }
    );
};

const deleteExpired = async () => {
    const db = getDb();
    return db.collection(COLLECTION).deleteMany({ expiresAt: { $lte: new Date() } });
};

module.exports = {
    create,
    findByHash,
    markRotated,
    revokeFamily,
    revokeAllForUser,
    deleteExpired
};
