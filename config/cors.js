/**
 * Single source of truth for the browser origins that may talk to this API.
 * CORS, the CSRF middleware and the cookie policy all use it, so they can never
 * drift apart.
 */
const allowedOrigins = [
    "http://localhost:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:3001"
];

if (process.env.FRONTEND_URL) {
    for (const origin of String(process.env.FRONTEND_URL).split(",")) {
        const clean = origin.trim().replace(/\/+$/, "");
        if (clean && !allowedOrigins.includes(clean)) {
            allowedOrigins.push(clean);
        }
    }
}

function isAllowedOrigin(origin) {
    return typeof origin === "string" && allowedOrigins.includes(origin);
}

const corsOptions = {
    origin(origin, callback) {
        // No Origin header: same-origin navigation, curl, server-to-server.
        if (!origin) return callback(null, true);
        if (isAllowedOrigin(origin)) return callback(null, true);
        return callback(null, false);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-CSRF-Token"],
    exposedHeaders: ["X-CSRF-Token"],
    maxAge: 600
};

module.exports = {
    allowedOrigins,
    isAllowedOrigin,
    corsOptions
};
