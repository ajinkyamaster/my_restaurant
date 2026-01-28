const menuModel = require("../models/menu");

// Home route (customer)
function getHome(req, res) {
    res.render("customer/home");
}

// GET /about
function getAbout(req, res) {
    res.render("about");
}

// GET /menu
async function getMenu(req, res) {
    try {
        const menuItems = await menuModel.getAllMenuItems();

        res.render("customer/menu", {
            menuItems,
            message: req.query.message
        });
        
    } catch (error) {
        console.error("Error fetching menu items:", error);
        res.status(500).send("Failed to load menu");
    }
}

// GET /bookTable
function getBookTable(req, res) {
    let errorMessage;

    if (req.query.error === 'table_occupied') {
        errorMessage = `Sorry, the requested table ${req.query.tableNumber} is already occupied or does not exist.`;
    }

    res.render("customer/bookTable", {
        errorMessage,
    });
}

// GET /bookTable/:tableNumber
function getBookTableWithNumber(req, res) {
    const tableNumber = req.params.tableNumber;
    let errorMessage;

    if (req.query.error === 'table_occupied') {
        errorMessage = `Sorry, the requested table ${tableNumber} is already occupied or does not exist.`;
    }

    res.render("customer/bookTable", {
        tableNumber,
        errorMessage
    });
}

module.exports = {
    getHome,
    getAbout,
    getMenu,
    getBookTable,
    getBookTableWithNumber
};
