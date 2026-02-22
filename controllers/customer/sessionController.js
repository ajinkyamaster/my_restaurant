const tablesModel = require("../../models/tables");
const { destroyTableSession } = require("../../session/session-config");

// ─── API: POST /api/endSession ─── End session (JSON)
async function apiEndSession(req, res) {
    if (!req.session.table) {
        return res.json({ success: true, message: "No active session" });
    }
    try {
        const tableId = req.session.table.tableId;
        await tablesModel.markTableVacant(tableId);
        await destroyTableSession(req);
        res.json({ success: true });
    } catch (err) {
        console.error("API: End session failed", err);
        res.status(500).json({ error: "Failed to end session" });
    }
}

module.exports = {
    apiEndSession
};
