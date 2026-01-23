const adminProtectMiddleware = (req, res, next) => {
    // allow admin login page
    if (req.path === "/login") {
        return next();
    }

    // check admin session
    if (req.session && req.session.admin === true) {
        return next();
    }

    // block unauthorized access
    return res.status(403).render("error/403");
};

module.exports = adminProtectMiddleware;
