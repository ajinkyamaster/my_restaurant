const { ObjectId } = require("mongodb");
const { getDb } = require("../data/database");

const COLLECTION = "menu";

const getAllMenuItems = async () => {
    const db = getDb();
    return await db.collection(COLLECTION).find({}).toArray();
};

const getMenuItemById = async (id) => {
    const db = getDb();
    return await db.collection(COLLECTION).findOne({
        _id: new ObjectId(id)
    });
};

const addMenuItem = async (name, price) => {
    const db = getDb();
    return await db.collection(COLLECTION).insertOne({
        name,
        price
    });
};

const updateMenuItem = async (id, name, price) => {
    const db = getDb();
    return await db.collection(COLLECTION).updateOne(
        { _id: new ObjectId(id) },
        { $set: { name, price } }
    );
};

const deleteMenuItem = async (id) => {
    const db = getDb();
    return await db.collection(COLLECTION).deleteOne({
        _id: new ObjectId(id)
    });
};

module.exports = {
    getAllMenuItems,
    getMenuItemById,
    addMenuItem,
    updateMenuItem,
    deleteMenuItem
};
