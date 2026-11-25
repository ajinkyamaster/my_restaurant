const crypto = require("crypto");
const jwt = require("jsonwebtoken");

const ISSUER = "my_restaurant";
const STAFF_AUDIENCE = "my_restaurant:staff";
const TABLE_AUDIENCE = "my_restaurant:table";

const ACCESS_TTL_SECONDS = 15 * 60; // 15 minutes
const REFRESH_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
const TABLE_TTL_MS = 3 * 60 * 60 * 1000; // 3 hours (one meal)

const isProduction = () => process.env.NODE_ENV === "production";

let ephemeralDevSecret = null;

/**
 * Resolve the signing secret.
 *
 * In production a real secret is mandatory (>= 32 chars) — starting with a
 * generated throwaway secret would silently log everyone out on every restart
 * and would differ per instance behind a load balancer.
 * In development an ephemeral secret keeps `npm run dev` working.
 */
function getSecret() {
    const configured = process.env.JWT_SECRET || process.env.SESSION_SECRET;
    if (typeof configured === "string" && configured.length >= 32) {
        return configured;
    }
    if (isProduction()) {
        throw new Error(
            "JWT_SECRET must be set to at least 32 characters in production (rotate the previously leaked SESSION_SECRET)."
        );
    }
    if (!ephemeralDevSecret) {
        ephemeralDevSecret = crypto.randomBytes(32).toString("hex");
        console.warn(
            "[auth] No JWT_SECRET (>=32 chars) configured; using an ephemeral development secret. Tokens will not survive a restart."
        );
    }
    return ephemeralDevSecret;
}

/** Fail fast on boot when production has no usable signing secret. */
function assertConfigured() {
    getSecret();
    return true;
}

function baseCookieOptions(maxAge) {
    const options = {
        httpOnly: true,
        secure: isProduction(),
        // The Next.js frontend and the API are separate Render services, so the
        // cookie must survive a cross-site request in production.
        sameSite: isProduction() ? "none" : "lax",
        path: "/"
    };
    if (typeof maxAge === "number") options.maxAge = maxAge;
    return options;
}

function signAccessToken({ id, role, tokenVersion }) {
    return jwt.sign(
        { sub: String(id), role, tv: Number(tokenVersion) || 0 },
        getSecret(),
        {
            algorithm: "HS256",
            expiresIn: ACCESS_TTL_SECONDS,
            issuer: ISSUER,
            audience: STAFF_AUDIENCE
        }
    );
}

function verifyAccessToken(token) {
    return jwt.verify(token, getSecret(), {
        algorithms: ["HS256"],
        issuer: ISSUER,
        audience: STAFF_AUDIENCE
    });
}

function signTableToken(sessionId) {
    return jwt.sign(
        { sid: String(sessionId) },
        getSecret(),
        {
            algorithm: "HS256",
            expiresIn: Math.floor(TABLE_TTL_MS / 1000),
            issuer: ISSUER,
            audience: TABLE_AUDIENCE
        }
    );
}

function verifyTableToken(token) {
    return jwt.verify(token, getSecret(), {
        algorithms: ["HS256"],
        issuer: ISSUER,
        audience: TABLE_AUDIENCE
    });
}

/** Refresh tokens are opaque random strings; only their hash is stored. */
function randomToken() {
    return crypto.randomBytes(48).toString("base64url");
}

function hashToken(token) {
    return crypto.createHash("sha256").update(String(token)).digest("hex");
}

const COOKIES = {
    access: "at",
    refresh: "rt",
    table: "ts"
};

function setAccessCookie(res, token) {
    res.cookie(COOKIES.access, token, baseCookieOptions(ACCESS_TTL_SECONDS * 1000));
}

function setRefreshCookie(res, token) {
    res.cookie(COOKIES.refresh, token, baseCookieOptions(REFRESH_TTL_MS));
}

function setTableCookie(res, token) {
    res.cookie(COOKIES.table, token, baseCookieOptions(TABLE_TTL_MS));
}

function clearStaffCookies(res) {
    res.clearCookie(COOKIES.access, baseCookieOptions());
    res.clearCookie(COOKIES.refresh, baseCookieOptions());
}

function clearTableCookie(res) {
    res.clearCookie(COOKIES.table, baseCookieOptions());
}

module.exports = {
    ACCESS_TTL_SECONDS,
    REFRESH_TTL_MS,
    TABLE_TTL_MS,
    COOKIES,
    isProduction,
    assertConfigured,
    signAccessToken,
    verifyAccessToken,
    signTableToken,
    verifyTableToken,
    randomToken,
    hashToken,
    baseCookieOptions,
    setAccessCookie,
    setRefreshCookie,
    setTableCookie,
    clearStaffCookies,
    clearTableCookie
};
