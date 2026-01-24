const adminProtectMiddleware = (req, res, next) => {
    if (req.session && req.session.admin === true) {
        return next();
    }

    return res.status(403).render("error/403");
};

module.exports = adminProtectMiddleware;
