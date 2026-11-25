const { MongoClient } = require("mongodb");

let db;
let client;

const connectToDb = async () => {
    try {
        client = new MongoClient(process.env.MONGO_URI);
        await client.connect();

        db = client.db(process.env.DB_NAME);
        console.log(`Connected to MongoDB database: ${process.env.DB_NAME}`);
        await ensureIndexes();
    } catch (error) {
        console.error("MongoDB connection failed:", error.message);
        process.exit(1);
    }
};

/**
 * Indexes are created on boot so lookups are not collection scans and the
 * uniqueness constraints the application relies on actually exist.
 * A failure is logged rather than fatal: production may already contain
 * duplicates that need cleaning up first.
 */
const ensureIndexes = async () => {
    const definitions = [
        ["admins", { username: 1 }, { unique: true, name: "uniq_admin_username" }],
        ["managers", { username: 1 }, { unique: true, name: "uniq_manager_username" }],
        ["tables", { tableNumber: 1 }, { unique: true, name: "uniq_table_number" }],
        ["menu", { name: 1 }, { name: "idx_menu_name" }],
        ["orders", { tableSessionId: 1, orderedAt: -1 }, { name: "idx_orders_session" }],
        ["orders", { orderedAt: -1 }, { name: "idx_orders_orderedAt" }],
        ["bookings", { tableNumber: 1, createdAt: -1 }, { name: "idx_bookings_table" }],
        ["refreshTokens", { tokenHash: 1 }, { unique: true, name: "uniq_refresh_hash" }],
        ["refreshTokens", { familyId: 1 }, { name: "idx_refresh_family" }],
        ["refreshTokens", { expiresAt: 1 }, { expireAfterSeconds: 0, name: "ttl_refresh_expiry" }],
        ["tableSessions", { expiresAt: 1 }, { expireAfterSeconds: 0, name: "ttl_table_session_expiry" }],
        ["tableSessions", { tableId: 1, status: 1 }, { name: "idx_table_session_table" }]
    ];

    for (const [collection, keys, options] of definitions) {
        try {
            await db.collection(collection).createIndex(keys, options);
        } catch (error) {
            console.warn(
                `[db] Could not create index ${options.name} on ${collection}: ${error.message}`
            );
        }
    }
};

const getDb = () => {
    if (!db) {
        throw new Error("Database not initialized");
    }
    return db;
};

const closeDb = async () => {
    if (client) await client.close();
};

module.exports = {
    connectToDb,
    getDb,
    ensureIndexes,
    closeDb
};
