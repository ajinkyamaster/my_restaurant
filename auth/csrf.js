const crypto = require("crypto");
const { isAllowedOrigin } = require("../config/cors");

const CSRF_COOKIE = "csrf_token";
const CSRF_HEADER = "X-CSRF-Token";
const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);
const TOKEN_PATTERN = /^[a-f0-9]{64}$/;

function cookieOptions(maxAge) {
    return {
        httpOnly: true, // the browser never needs to read it: the value is returned in a header
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        path: "/",
        maxAge
    };
}

function timingSafeEqual(a, b) {
    const bufA = Buffer.from(String(a));
    const bufB = Buffer.from(String(b));
    if (bufA.length !== bufB.length) return false;
    return crypto.timingSafeEqual(bufA, bufB);
}

/**
 * Guarantee that the browser holds a CSRF token and expose the same value in a
 * response header. A cross-site attacker cannot read that header (CORS), so
 * they cannot replay it in `X-CSRF-Token` on a forged request.
 */
function ensureCsrfToken(req, res, next) {
    let token = req.cookies ? req.cookies[CSRF_COOKIE] : null;

    if (typeof token !== "string" || !TOKEN_PATTERN.test(token)) {
        token = crypto.randomBytes(32).toString("hex");
        res.cookie(CSRF_COOKIE, token, cookieOptions(7 * 24 * 60 * 60 * 1000));
    }

    req.csrfToken = token;
    res.setHeader(CSRF_HEADER, token);
    next();
}

function csrfProtection(req, res, next) {
    if (SAFE_METHODS.has(req.method)) return next();

    const cookieToken = req.cookies ? req.cookies[CSRF_COOKIE] : null;
    const headerToken = req.get(CSRF_HEADER);

    if (!cookieToken || !headerToken || !timingSafeEqual(cookieToken, headerToken)) {
        return res.status(403).json({ error: "Invalid or missing CSRF token" });
    }

    // Belt and braces: reject a mutation whose Origin we do not serve.
    // Requests without Origin (curl, server-to-server) still need the token.
    const origin = req.get("Origin");
    if (origin && !isAllowedOrigin(origin)) {
        return res.status(403).json({ error: "Origin not allowed" });
    }

    return next();
}

module.exports = {
    CSRF_COOKIE,
    CSRF_HEADER,
    ensureCsrfToken,
    csrfProtection
};
