const menuModel = require("../../models/menu");
const ordersModel = require("../../models/orders");
const tableSessions = require("../../models/tableSessions");
const { getTableSession, cartTotal } = require("../../services/tableSession");
const validate = require("../../utils/validate");
const { NotFoundError, ConflictError } = require("../../utils/errors");

const MAX_QUANTITY = 50;

function lineTotal(price, quantity) {
    return Math.round(price * quantity * 100) / 100;
}

function cartPayload(session) {
    const cart = session.cart || [];
    return { cart, grandTotal: cartTotal(cart), tableNumber: session.tableNumber };
}

/**
 * Persist a cart mutation. `setCart` only matches sessions that are still
 * active, so a write that loses a race with End Session fails clearly instead
 * of reviving a closed tab.
 */
async function applyCart(session, cart) {
    const updated = await tableSessions.setCart(session._id, cart);
    if (!updated) {
        throw new ConflictError("This table session has ended. Please book a table again.");
    }
    return updated;
}

/**
 * Add / set the quantity of a menu item.
 *
 * SECURITY: the client sends a menu item id and a quantity. The unit price is
 * always read from the menu collection, so a tampered request can no longer buy
 * a ₹500 dish for ₹1 (or with a negative quantity).
 */
async function postAddToCart(req, res) {
    const session = await getTableSession(req);
    if (!session) {
        return res.status(401).json({
            error: "Please book a table to add items to cart",
            redirect: "/booking"
        });
    }

    const menuItemId = validate.objectId(req.body && req.body.menuItemId, { field: "menuItemId" });
    const quantity = validate.int(req.body && req.body.quantity, {
        field: "quantity",
        min: 1,
        max: MAX_QUANTITY
    });

    const menuItem = await menuModel.getMenuItemById(menuItemId);
    if (!menuItem) throw new NotFoundError("Menu item not found");

    const price = validate.money(menuItem.price, { field: "menu item price" });
    const productId = String(menuItem._id);

    const cart = (session.cart || []).map((line) => ({ ...line }));
    const existing = cart.find((line) => line.menuItemId === productId);

    if (existing) {
        existing.item = menuItem.name;
        existing.price = price;
        existing.quantity = quantity;
        existing.totalPrice = lineTotal(price, quantity);
    } else {
        cart.push({
            menuItemId: productId,
            item: menuItem.name,
            quantity,
            price,
            totalPrice: lineTotal(price, quantity)
        });
    }

    const updated = await applyCart(session, cart);
    res.json(cartPayload(updated));
}

async function postRemoveFromCart(req, res) {
    const session = await getTableSession(req);
    if (!session) {
        return res.status(401).json({ error: "No active table session", redirect: "/booking" });
    }

    const menuItemId = validate.objectId(req.body && req.body.menuItemId, { field: "menuItemId" });
    const cart = (session.cart || []).filter((line) => line.menuItemId !== menuItemId);
    const updated = await applyCart(session, cart);

    res.json({ message: "Item removed", ...cartPayload(updated) });
}

async function apiGetCart(req, res) {
    const session = await getTableSession(req);
    if (!session) {
        return res.status(401).json({ error: "No active table session", redirect: "/booking" });
    }
    res.json(cartPayload(session));
}

/** quantity 0 removes the line; prices still come from the stored server value. */
async function apiUpdateCartItem(req, res) {
    const session = await getTableSession(req);
    if (!session) {
        return res.status(401).json({ error: "No active table session", redirect: "/booking" });
    }

    const menuItemId = validate.objectId(req.body && req.body.menuItemId, { field: "menuItemId" });
    const quantity = validate.int(req.body && req.body.quantity, {
        field: "quantity",
        min: 0,
        max: MAX_QUANTITY
    });

    let cart = (session.cart || []).map((line) => ({ ...line }));

    if (quantity === 0) {
        cart = cart.filter((line) => line.menuItemId !== menuItemId);
    } else {
        const line = cart.find((entry) => entry.menuItemId === menuItemId);
        if (!line) throw new NotFoundError("Item is not in the cart");

        // Re-price from the menu so a price change (or tampering) cannot stick.
        const menuItem = await menuModel.getMenuItemById(menuItemId);
        if (!menuItem) throw new NotFoundError("Menu item not found");

        const price = validate.money(menuItem.price, { field: "menu item price" });
        line.item = menuItem.name;
        line.price = price;
        line.quantity = quantity;
        line.totalPrice = lineTotal(price, quantity);
    }

    const updated = await applyCart(session, cart);
    res.json(cartPayload(updated));
}

async function apiGetPayments(req, res) {
    const session = await getTableSession(req);
    if (!session) {
        return res.status(401).json({ error: "No active table session", redirect: "/booking" });
    }
    res.json({
        ...cartPayload(session),
        customerName: session.customerName
    });
}

/** Payment history is scoped to this table session, never to a table number. */
async function apiGetMyPayments(req, res) {
    const session = await getTableSession(req);
    if (!session) {
        return res.json({ tableOrders: [] });
    }
    const tableOrders = await ordersModel.getOrdersBySessionId(session._id);
    res.json({ tableOrders });
}

/**
 * Checkout is claimed atomically in MongoDB, so a double-clicked Pay button
 * produces one order rather than two.
 */
async function apiCheckout(req, res) {
    const session = await getTableSession(req);
    if (!session) {
        return res.status(401).json({ error: "No active table session", redirect: "/booking" });
    }
    if (!Array.isArray(session.cart) || session.cart.length === 0) {
        return res.status(400).json({ error: "Cart is empty" });
    }

    const claimed = await tableSessions.claimForCheckout(session._id);
    if (!claimed) {
        throw new ConflictError("Checkout already in progress");
    }

    try {
        const items = (claimed.cart || []).map((line) => ({
            menuItemId: line.menuItemId,
            item: line.item,
            quantity: line.quantity,
            price: line.price,
            totalPrice: line.totalPrice
        }));

        if (items.length === 0) {
            await tableSessions.releaseCheckout(session._id);
            return res.status(400).json({ error: "Cart is empty" });
        }

        const grandTotal = cartTotal(items);

        const order = await ordersModel.createOrder({
            tableSessionId: claimed._id,
            tableNumber: claimed.tableNumber,
            customer: { name: claimed.customerName || "Dine-in Customer" },
            items,
            grandTotal,
            orderedAt: new Date(),
            status: "PLACED",
            // Payment gateway is not integrated yet; this records the current
            // reality instead of pretending a payment was captured.
            payment: { mode: "SIMULATED", status: "PAID" }
        });

        await tableSessions.completeCheckout(claimed._id);

        res.json({
            success: true,
            orderId: String(order._id),
            tableNumber: claimed.tableNumber,
            grandTotal
        });
    } catch (error) {
        // Release the lock so the customer can retry rather than being stuck.
        await tableSessions.releaseCheckout(claimed._id).catch(() => {});
        throw error;
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
