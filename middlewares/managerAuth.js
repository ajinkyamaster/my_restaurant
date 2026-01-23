// simple auth guard
const managerAuth = (req, res, next) => {
    if (!req.session.manager) {
        return res.render("error/403");
    }
    next();
};

module.exports = managerAuth;