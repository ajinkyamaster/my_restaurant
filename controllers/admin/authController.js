const adminAuthMiddleware = require("../../middlewares/adminAuth");

// GET /admin/login
function getLogin(req, res) {
    res.render("admin/login", { error: null });
}

// POST /admin/login
function postLogin(req, res) {
    req.session.admin = true;
    req.session.adminUser = req.admin;

    res.redirect("/admin/dashboard");
}

// GET /admin/logout
function getLogout(req, res) {
    req.session.admin = false;
    req.session.adminUser = null;
    res.redirect("/admin/login");
}

module.exports = {
    getLogin,
    postLogin,
    getLogout,
    adminAuthMiddleware
};
