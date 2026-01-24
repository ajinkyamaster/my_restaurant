const session = require("express-session");
const MongoStore = require("connect-mongo").default;

const sessionMiddleware = session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,

    store: MongoStore.create({
        mongoUrl: process.env.MONGO_URI,
        dbName: process.env.DB_NAME,
        collectionName: "sessions",
    }),

    cookie: {
        httpOnly: true,
        secure: false, // OK for now (Render handles HTTPS)
        maxAge: 2 * 60 * 60 * 1000 // 2 hours
    }
});


/**
 * Create table session
 */
const createTableSession = (req, table, customerName) => {
    req.session.table = {
        tableId: table._id,
        tableNumber: table.tableNumber,
        cart: [],
        customerName
    };
};

/**
 * Destroy table session
 */
const destroyTableSession = (req) => {
    return new Promise((resolve, reject) => {
        req.session.destroy(err => {
            if (err) return reject(err);
            resolve();
        });
    });
};

module.exports = {
    sessionMiddleware,
    createTableSession,
    destroyTableSession
};
