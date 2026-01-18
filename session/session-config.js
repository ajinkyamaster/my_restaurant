const session = require("express-session");

/**
 * Session middleware configuration
 */
const sessionMiddleware = session({
    secret: process.env.SESSION_SECRET || "my_restro_secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 2 * 60 * 60 * 1000 // 2 hours
    }
});

/**
 * Create table session
 */
const createTableSession = (req, table) => {
    req.session.table = {
        tableId: table._id,
        tableNumber: table.tableNumber,
        cart: [],
        orders: []
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

