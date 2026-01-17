const { MongoClient } = require("mongodb");

let db;

const connectToDb = async () => {
    try {
        const client = new MongoClient(process.env.MONGO_URI);
        await client.connect();

        db = client.db(process.env.DB_NAME);
        console.log(`Connected to MongoDB database: ${process.env.DB_NAME}`);
    } catch (error) {
        console.error("MongoDB connection failed", error);
        process.exit(1);
    }
};

const getDb = () => {
    if (!db) {
        throw new Error("Database not initialized");
    }
    return db;
};

module.exports = {
    connectToDb,
    getDb
};
