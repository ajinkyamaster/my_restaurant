// GET /admin/dashboard
function getDashboard(req, res) {
    res.render("admin/dashboard", {
        admin: req.session.adminUser
    });
}

module.exports = {
    getDashboard
};
