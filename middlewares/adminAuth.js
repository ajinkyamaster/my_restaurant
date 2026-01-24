const adminModel = require("../models/admin");

const adminAuthMiddleware = async (req, res, next) => {
    try {
        const { username, password } = req.body;

        const admin = await adminModel.findAdminByUsername(username);

        console.log("LOGIN ATTEMPT:", username, password);
        console.log("ADMIN FOUND:", admin);


        if (!admin || admin.password !== password) {
            console.log("Admin authentication failed for username:", username);
            return res.status(401).render("admin/login", {
                error: "Invalid admin credentials"
            });
        }

        // attach admin info (optional)
        req.admin = {
            id: admin._id,
            username: admin.username
        };

        next();
    } catch (error) {
        console.error("Admin auth error:", error);
        res.status(500).send("Admin authentication failed");
    }
};

module.exports = adminAuthMiddleware;
