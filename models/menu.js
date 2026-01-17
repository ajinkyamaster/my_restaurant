const { ObjectId } = require("mongodb");
const { getDb } = require("../data/database");

const COLLECTION_NAME = "menu";

/**
 * Create a new menu item
 * @param {Object} menuItem
 */
const createMenuItem = async (menuItem) => {
    const db = getDb();
    const result = await db.collection(COLLECTION_NAME).insertOne(menuItem);
    return result;
};

/**
 * Get all menu items
 */
const getAllMenuItems = async () => {
    const db = getDb();
    const menuItems = await db.collection(COLLECTION_NAME).find({}).toArray();
    return menuItems;
};

/**
 * Update a menu item by ID
 * @param {String} id
 * @param {Object} updatedData
 */
const updateMenuItemById = async (id, updatedData) => {
    const db = getDb();
    const result = await db.collection(COLLECTION_NAME).updateOne(
        { _id: new ObjectId(id) },
        { $set: updatedData }
    );
    return result;
};

module.exports = {
    createMenuItem,
    getAllMenuItems,
    updateMenuItemById
};
