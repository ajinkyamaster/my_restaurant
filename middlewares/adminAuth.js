const adminModel = require("../models/admin");
const bcrypt = require("bcryptjs");

const adminAuthMiddleware = async (req, res, next) => {
    try {
        const { username, password } = req.body;

        const admin = await adminModel.findAdminByUsername(username);

        if (!admin) {
            console.log("Admin not found:", username);
        return res.render("admin/login", { error: "Invalid credentials" });
    }

    const isPasswordValid = await bcrypt.compare(password, admin.password);
    if (!isPasswordValid) {
        console.log("Invalid password attempt for admin:", username);
        return res.render("admin/login", { error: "Invalid credentials" });
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