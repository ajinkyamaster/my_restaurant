const crypto = require("crypto");
const jwtLib = require("./jwt");
const refreshTokens = require("../models/refreshTokens");
const { loadUser } = require("../middleware/auth");
const { AuthError } = require("../utils/errors");

/**
 * Issue / rotate / revoke staff sessions.
 *
 * Access token:  short-lived JWT (15 min) in an httpOnly cookie.
 * Refresh token: opaque random string (7 days) in an httpOnly cookie, stored
 *                hashed in MongoDB, rotated on every use, with reuse detection
 *                that revokes the whole token family if an old token reappears.
 */
async function startStaffSession(res, user) {
    const accessToken = jwtLib.signAccessToken({
        id: user.id,
        role: user.role,
        tokenVersion: user.tokenVersion || 0
    });

    const refreshToken = jwtLib.randomToken();
    await refreshTokens.create({
        userId: user.id,
        role: user.role,
        familyId: crypto.randomUUID(),
        tokenHash: jwtLib.hashToken(refreshToken),
        expiresAt: new Date(Date.now() + jwtLib.REFRESH_TTL_MS)
    });

    jwtLib.setAccessCookie(res, accessToken);
    jwtLib.setRefreshCookie(res, refreshToken);
}

async function refreshStaffSession(req, res) {
    const presented = req.cookies ? req.cookies[jwtLib.COOKIES.refresh] : null;
    if (!presented) throw new AuthError("No refresh token");

    const presentedHash = jwtLib.hashToken(presented);
    const record = await refreshTokens.findByHash(presentedHash);
    if (!record) throw new AuthError("Invalid refresh token");

    // A revoked token being presented again means it was stolen or replayed.
    if (record.revokedAt) {
        await refreshTokens.revokeFamily(record.familyId);
        throw new AuthError("Refresh token reuse detected");
    }

    if (record.expiresAt.getTime() <= Date.now()) {
        await refreshTokens.revokeFamily(record.familyId);
        throw new AuthError("Refresh token expired");
    }

    const user = await loadUser(record.role, String(record.userId));
    if (!user) {
        await refreshTokens.revokeFamily(record.familyId);
        throw new AuthError("Account no longer exists");
    }

    const nextToken = jwtLib.randomToken();
    const rotated = await refreshTokens.markRotated(record, jwtLib.hashToken(nextToken));
    if (!rotated) {
        await refreshTokens.revokeFamily(record.familyId);
        throw new AuthError("Refresh token already used");
    }

    await refreshTokens.create({
        userId: user._id,
        role: record.role,
        familyId: record.familyId,
        tokenHash: jwtLib.hashToken(nextToken),
        expiresAt: new Date(Date.now() + jwtLib.REFRESH_TTL_MS)
    });

    jwtLib.setAccessCookie(
        res,
        jwtLib.signAccessToken({
            id: user._id,
            role: record.role,
            tokenVersion: user.tokenVersion || 0
        })
    );
    jwtLib.setRefreshCookie(res, nextToken);

    return { id: String(user._id), role: record.role, username: user.username };
}

async function endStaffSession(req, res) {
    const presented = req.cookies ? req.cookies[jwtLib.COOKIES.refresh] : null;
    if (presented) {
        const record = await refreshTokens.findByHash(jwtLib.hashToken(presented));
        if (record) await refreshTokens.revokeFamily(record.familyId);
    }
    jwtLib.clearStaffCookies(res);
}

module.exports = {
    startStaffSession,
    refreshStaffSession,
    endStaffSession
};
