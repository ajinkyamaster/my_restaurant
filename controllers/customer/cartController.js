const ordersModel = require("../../models/orders");

// POST /cart/add (shared - returns JSON)
function postAddToCart(req, res) {
    if (!req.session.table) {
        return res.status(401).json({
            redirect: "/menu?message=Please book a table to add items to cart"
        });
    }

    const { item, quantity, price } = req.body;
    const cart = req.session.table.cart;

    const existingItem = cart.find(ci => ci.item === item);

    if (existingItem) {
        existingItem.quantity = quantity;
        existingItem.totalPrice = price * quantity;
    } else {
        cart.push({
            item,
            quantity,
            price,
            totalPrice: price * quantity
        });
    }

    req.session.table.cart = cart;
    const grandTotal = cart.reduce((sum, ci) => sum + ci.totalPrice, 0);

    res.json({
        cart,
        grandTotal
    });
}

// POST /cart/remove (shared - returns JSON)
function postRemoveFromCart(req, res) {
    if (!req.session.table) {
        return res.status(403).json({ message: "No active table session" });
    }

    const { item } = req.body;
    let cart = req.session.table.cart;

    cart = cart.filter(ci => ci.item !== item);

    req.session.table.cart = cart;
    const grandTotal = cart.reduce((sum, ci) => sum + ci.totalPrice, 0);

    res.json({ message: "Item removed", cart, grandTotal });
}

// ─── API: GET /api/cart ─── Returns cart as JSON
function apiGetCart(req, res) {
    if (!req.session.table) {
        return res.status(401).json({ error: "No active table session", redirect: "/booking" });
    }
    const cart = req.session.table.cart || [];
    const grandTotal = cart.reduce((sum, item) => sum + item.totalPrice, 0);
    res.json({ cart, grandTotal, tableNumber: req.session.table.tableNumber });
}

// ─── API: POST /api/cart/update ─── Update item quantity
function apiUpdateCartItem(req, res) {
    if (!req.session.table) {
        return res.status(401).json({ error: "No active table session" });
    }
    const { item, quantity, price } = req.body;
    const cart = req.session.table.cart;
    const existingItem = cart.find(ci => ci.item === item);

    if (existingItem) {
        if (quantity <= 0) {
            req.session.table.cart = cart.filter(ci => ci.item !== item);
        } else {
            existingItem.quantity = quantity;
            existingItem.totalPrice = price * quantity;
        }
    }
    const updatedCart = req.session.table.cart;
    const grandTotal = updatedCart.reduce((sum, i) => sum + i.totalPrice, 0);
    res.json({ cart: updatedCart, grandTotal });
}

// ─── API: GET /api/payments ─── Returns payment summary (cart ready for checkout)
function apiGetPayments(req, res) {
    if (!req.session.table) {
        return res.status(401).json({ error: "No active table session", redirect: "/booking" });
    }
    const cart = req.session.table.cart || [];
    const grandTotal = cart.reduce((sum, item) => sum + item.totalPrice, 0);
    res.json({
        cart,
        grandTotal,
        tableNumber: req.session.table.tableNumber,
        customerName: req.session.table.customerName,
    });
}

// ─── API: GET /api/myPayments ─── Returns past paid orders for current table
async function apiGetMyPayments(req, res) {
    if (!req.session.table) {
        return res.json({ tableOrders: [] });
    }
    try {
        const tableOrders = await ordersModel.getOrdersByTableNumber(req.session.table.tableNumber);
        res.json({ tableOrders });
    } catch (err) {
        console.error("API: Failed to fetch payments", err);
        res.status(500).json({ error: "Failed to load payment history" });
    }
}

// ─── API: POST /api/checkout ─── Process payment, save order, clear cart
async function apiCheckout(req, res) {
    if (!req.session.table || req.session.table.cart.length === 0) {
        return res.status(400).json({ error: "Cart is empty or no session" });
    }
    const cart = req.session.table.cart;
    const grandTotal = cart.reduce((sum, item) => sum + item.totalPrice, 0);

    try {
        await ordersModel.createOrder({
            tableNumber: req.session.table.tableNumber,
            customer: { name: req.session.table.customerName || "Dine-in Customer" },
            items: cart,
            grandTotal,
            orderedAt: new Date(),
            status: "PLACED",
        });
        req.session.table.cart = [];
        res.json({ success: true, tableNumber: req.session.table.tableNumber });
    } catch (err) {
        console.error("API: Checkout failed", err);
        res.status(500).json({ error: "Payment processing failed" });
    }
}

module.exports = {
    postAddToCart,
    postRemoveFromCart,
    apiGetCart,
    apiUpdateCartItem,
    apiGetPayments,
    apiGetMyPayments,
    apiCheckout
};
