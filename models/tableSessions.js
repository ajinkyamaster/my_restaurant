const { ObjectId } = require("mongodb");
const { getDb } = require("../data/database");

const COLLECTION = "tableSessions";

/**
 * Dine-in table sessions replace `req.session.table`.
 *
 * The cart lives in MongoDB instead of memory/session storage so that:
 *  - the customer only carries a signed, short-lived `ts` cookie;
 *  - an end-of-day reset can invalidate every open table at once;
 *  - checkout can be claimed atomically.
 */
const create = async ({ tableId, tableNumber, customerName, ttlMs }) => {
    const db = getDb();
    const now = new Date();
    const doc = {
        tableId: new ObjectId(tableId),
        tableNumber,
        customerName,
        cart: [],
        status: "active",
        checkoutLock: false,
        createdAt: now,
        updatedAt: now,
        expiresAt: new Date(now.getTime() + ttlMs)
    };
    const result = await db.collection(COLLECTION).insertOne(doc);
    return { ...doc, _id: result.insertedId };
};

const findById = async (id) => {
    if (typeof id !== "string" || !ObjectId.isValid(id)) return null;
    const db = getDb();
    return db.collection(COLLECTION).findOne({ _id: new ObjectId(id) });
};

const setCart = async (id, cart) => {
    const db = getDb();
    return db.collection(COLLECTION).findOneAndUpdate(
        { _id: new ObjectId(id), status: "active" },
        { $set: { cart, updatedAt: new Date() } },
        { returnDocument: "after" }
    );
};

/**
 * Atomically take ownership of a checkout. Only one request can succeed, which
 * makes the Pay button idempotent against double clicks and retries.
 */
const claimForCheckout = async (id) => {
    const db = getDb();
    return db.collection(COLLECTION).findOneAndUpdate(
        {
            _id: new ObjectId(id),
            status: "active",
            checkoutLock: { $ne: true },
            "cart.0": { $exists: true }
        },
        { $set: { checkoutLock: true, checkoutStartedAt: new Date() } },
        { returnDocument: "after" }
    );
};

const releaseCheckout = async (id) => {
    const db = getDb();
    return db.collection(COLLECTION).updateOne(
        { _id: new ObjectId(id) },
        { $set: { checkoutLock: false, updatedAt: new Date() } }
    );
};

const completeCheckout = async (id) => {
    const db = getDb();
    return db.collection(COLLECTION).updateOne(
        { _id: new ObjectId(id) },
        {
            $set: {
                cart: [],
                checkoutLock: false,
                lastCheckoutAt: new Date(),
                updatedAt: new Date()
            }
        }
    );
};

const end = async (id) => {
    const db = getDb();
    return db.collection(COLLECTION).updateOne(
        { _id: new ObjectId(id) },
        { $set: { status: "ended", cart: [], endedAt: new Date(), updatedAt: new Date() } }
    );
};

/** Used to avoid vacating a table that another party already re-booked. */
const countActiveForTable = async (tableId, excludeId) => {
    const db = getDb();
    const filter = { tableId: new ObjectId(tableId), status: "active" };
    if (excludeId) filter._id = { $ne: new ObjectId(excludeId) };
    return db.collection(COLLECTION).countDocuments(filter);
};

const clearAll = async () => {
    const db = getDb();
    return db.collection(COLLECTION).deleteMany({});
};

module.exports = {
    create,
    findById,
    setCart,
    claimForCheckout,
    releaseCheckout,
    completeCheckout,
    end,
    countActiveForTable,
    clearAll
};
