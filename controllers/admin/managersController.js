const adminModel = require("../../models/admin");
const managerModel = require("../../models/manager");

// GET /create-new-admin
function getCreateAdmin(req, res) {
    res.render("admin/add-admin", { message: null });
}

// GET /create-new-manager
function getCreateManager(req, res) {
    res.render("admin/add-manager", { message: null });
}

// GET /vacate-manager
function getVacateManager(req, res) {
    res.render("admin/vacate-manager", { message: null });
}

// POST /vacate-manager
async function postVacateManager(req, res) {
    const { username } = req.body;

    try {
        const manager = await managerModel.findManagerByUsername(username);
        if (!manager) {
            return res.status(404).render("admin/vacate-manager", { message: "Manager not found." });
        }
        await managerModel.vacateManager(username);
        res.render("admin/vacate-manager", { message: "Manager vacated successfully." });
    } catch (error) {
        console.error("Error vacating manager:", error);
        res.status(500).render("admin/vacate-manager", { message: "Failed to vacate manager." });
    }
}

// POST /create-new-admin
async function postCreateAdmin(req, res) {
    const { username, password } = req.body;

    try {
        const existingAdmin = await adminModel.findAdminByUsername(username);
        if (existingAdmin) {
            return res.status(400).render("admin/add-admin", { message: "Admin with this username already exists." });
        }

        await adminModel.createAdmin({ username, password });
        res.render("admin/add-admin", { message: "New admin created successfully!" });
    } catch (error) {
        console.error("Error creating admin:", error);
        res.status(500).render("admin/add-admin", { message: "Failed to create admin." });
    }
}

// POST /create-new-manager
async function postCreateManager(req, res) {
    const { username, password } = req.body;
    
    try {
        const existingManager = await managerModel.findManagerByUsername(username);
        if (existingManager) {
            return res.status(400).render("admin/add-manager", { message: "Manager with this username already exists." });
        }

        await managerModel.createManager(username, password);
        res.render("admin/add-manager", { message: "New manager created successfully!" });
    } catch (error) {
        console.error("Error creating manager:", error);
        res.status(500).send("Failed to create manager.");
    }
}

// GET /allManagers
async function getAllManagers(req, res) {
    try {
        const managers = await managerModel.getAllManagers();
        res.render("admin/allManagers", { managers });
    } catch (error) {
        console.error("Error fetching managers:", error);
        res.status(500).send("Failed to load managers");
    }
}

module.exports = {
    getCreateAdmin,
    getCreateManager,
    getVacateManager,
    postVacateManager,
    postCreateAdmin,
    postCreateManager,
    getAllManagers
};
