const tablesModel = require("../../models/tables");
const tableSessions = require("../../models/tableSessions");
const { getTableSession, endTableSession } = require("../../services/tableSession");

async function apiEndSession(req, res) {
    const session = await getTableSession(req);
    if (!session) {
        return res.json({ success: true, message: "No active session" });
    }

    await endTableSession(res, session);

    // Only free the table when this was the last active session for it. A stale
    // session must never vacate a table a new party has since booked.
    const remaining = await tableSessions.countActiveForTable(session.tableId, session._id);
    if (remaining === 0) {
        await tablesModel.markTableVacant(session.tableId);
    }

    res.json({ success: true });
}

module.exports = {
    apiEndSession
};
