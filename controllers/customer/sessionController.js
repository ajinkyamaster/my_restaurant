const tablesModel = require("../../models/tables");
const { destroyTableSession } = require("../../session/session-config");

// GET /endSession
function getEndSession(req, res) {
    if (!req.session.table) {
        return res.redirect("/");
    }

    res.render("customer/endSession", {
        tableNumber: req.session.table.tableNumber
    });
}

// POST /vacateTable
async function postVacateTable(req, res) {
    if (!req.session.table) {
        return res.redirect("/");
    }

    const tableId = req.session.table.tableId;

    // mark table as vacant
    await tablesModel.markTableVacant(tableId);

    // destroy table session using session-config
    await destroyTableSession(req);

    res.redirect("/");
}

module.exports = {
    getEndSession,
    postVacateTable
};
