const jwtLib = require("../auth/jwt");
const tableSessions = require("../models/tableSessions");

/** Read the dine-in session referenced by the signed `ts` cookie. */
async function getTableSession(req) {
    const token = req.cookies ? req.cookies[jwtLib.COOKIES.table] : null;
    if (!token) return null;

    let payload;
    try {
        payload = jwtLib.verifyTableToken(token);
    } catch {
        return null;
    }

    const session = await tableSessions.findById(payload.sid);
    if (!session || session.status !== "active") return null;
    if (session.expiresAt.getTime() <= Date.now()) return null;

    return session;
}

async function startTableSession(res, table, customerName) {
    const session = await tableSessions.create({
        tableId: table._id,
        tableNumber: table.tableNumber,
        customerName,
        ttlMs: jwtLib.TABLE_TTL_MS
    });
    jwtLib.setTableCookie(res, jwtLib.signTableToken(session._id));
    return session;
}

async function endTableSession(res, session) {
    if (session) await tableSessions.end(session._id);
    jwtLib.clearTableCookie(res);
}

/** Money is computed from server-side prices only, never from the client. */
function cartTotal(cart) {
    const total = cart.reduce((sum, line) => sum + line.totalPrice, 0);
    return Math.round(total * 100) / 100;
}

module.exports = {
    getTableSession,
    startTableSession,
    endTableSession,
    cartTotal
};
