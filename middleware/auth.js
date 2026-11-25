const jwtLib = require("../auth/jwt");
const adminModel = require("../models/admin");
const managerModel = require("../models/manager");

/**
 * Load the account behind an access token on every request.
 *
 * This is what makes JWT sessions *revocable*: a deleted manager or a bumped
 * `tokenVersion` stops working immediately instead of living until the token
 * expires on its own.
 */
async function loadUser(role, id) {
    if (role === "admin") return adminModel.findAdminById(id);
    if (role === "manager") return managerModel.findManagerById(id);
    return null;
}

function bearerToken(req) {
    const header = req.get("authorization") || "";
    return header.startsWith("Bearer ") ? header.slice(7).trim() : null;
}

async function resolveUser(req) {
    const token = (req.cookies && req.cookies[jwtLib.COOKIES.access]) || bearerToken(req);
    if (!token) return null;

    let payload;
    try {
        payload = jwtLib.verifyAccessToken(token);
    } catch {
        return null;
    }

    const user = await loadUser(payload.role, payload.sub);
    if (!user) return null;

    const currentVersion = Number(user.tokenVersion) || 0;
    if (currentVersion !== (Number(payload.tv) || 0)) return null;

    return {
        id: String(user._id),
        role: payload.role,
        username: user.username,
        tokenVersion: currentVersion
    };
}

function requireRole(role) {
    return async (req, res, next) => {
        try {
            const user = await resolveUser(req);
            if (!user || user.role !== role) {
                return res.status(401).json({ error: "Not authenticated" });
            }
            req.user = user;
            return next();
        } catch (error) {
            return next(error);
        }
    };
}

module.exports = {
    loadUser,
    resolveUser,
    requireRole
};
