const express = require("express");
if (process.env.NODE_ENV !== "production") {
    require("dotenv").config();
}

const cors = require("cors");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const rateLimit = require("express-rate-limit");

const db = require("./data/database");
const jwtLib = require("./auth/jwt");
const { corsOptions } = require("./config/cors");
const { ensureCsrfToken, csrfProtection } = require("./auth/csrf");
const { AppError } = require("./utils/errors");

const app = express();

// Trust exactly one reverse proxy (Render) so req.ip and secure cookies work.
app.set("trust proxy", 1);
app.disable("x-powered-by");

// ─── Security headers ────────────────────────────────────
// The service only returns JSON, so the CSP can be maximally strict.
app.use(
    helmet({
        contentSecurityPolicy: {
            useDefaults: false,
            directives: {
                "default-src": ["'none'"],
                "frame-ancestors": ["'none'"],
                "base-uri": ["'none'"]
            }
        },
        crossOriginResourcePolicy: { policy: "cross-origin" },
        // CSP frame-ancestors already blocks clickjacking; this keeps legacy
        // browsers that ignore CSP equally protected.
        xFrameOptions: { action: "deny" },
        referrerPolicy: { policy: "no-referrer" }
    })
);

app.use(cors(corsOptions));

// ─── Body parsing ────────────────────────────────────────
// JSON only. Removing the urlencoded parser closes the HTML-form CSRF vector
// even before the CSRF token check runs.
app.use(express.json({ limit: "64kb", strict: true }));
app.use(cookieParser());

// ─── CSRF ────────────────────────────────────────────────
app.use(ensureCsrfToken);
app.use(csrfProtection);

// ─── Rate limiting ───────────────────────────────────────
const apiLimiter = rateLimit({
    windowMs: 5 * 60 * 1000,
    limit: 600,
    standardHeaders: "draft-7",
    legacyHeaders: false,
    message: { error: "Too many requests, please slow down" }
});

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 10,
    standardHeaders: "draft-7",
    legacyHeaders: false,
    skipSuccessfulRequests: true,
    message: { error: "Too many login attempts. Try again in a few minutes." }
});

const refreshLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 120,
    standardHeaders: "draft-7",
    legacyHeaders: false,
    message: { error: "Too many token refreshes" }
});

// ─── Public utility endpoints ────────────────────────────
app.get("/api/health", (req, res) => {
    res.json({ status: "ok", uptime: Math.round(process.uptime()) });
});

app.get("/api/csrf", (req, res) => {
    res.json({ csrfToken: req.csrfToken });
});

// ─── Routes ──────────────────────────────────────────────
const apiRoutes = require("./routes/customer/api");
const authApiRoutes = require("./routes/auth/api");
const adminApiRoutes = require("./routes/admin/api");
const managerApiRoutes = require("./routes/manager/api");

app.use("/api/admin/login", loginLimiter);
app.use("/api/manager/login", loginLimiter);
app.use("/api/auth/refresh", refreshLimiter);
app.use("/api", apiLimiter);

app.use("/api/auth", authApiRoutes);
app.use("/api/admin", adminApiRoutes);
app.use("/api/manager", managerApiRoutes);
app.use("/api", apiRoutes);

// ─── 404 (JSON, never an HTML error page) ────────────────
app.use((req, res) => {
    res.status(404).json({ error: "Not found" });
});

// ─── Central error handler ───────────────────────────────
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
    if (res.headersSent) return next(err);

    if (err && err.code === 11000) {
        return res.status(409).json({ error: "That record already exists" });
    }

    if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
        return res.status(400).json({ error: "Malformed JSON body" });
    }

    const status =
        err instanceof AppError
            ? err.status
            : Number.isInteger(err && err.status) && err.status >= 400 && err.status < 600
              ? err.status
              : 500;

    if (status >= 500) {
        console.error(`[api] ${req.method} ${req.originalUrl} failed:`, err && err.message);
        return res.status(500).json({ error: "Internal server error" });
    }

    return res.status(status).json({ error: err.message || "Request failed" });
});

// ─── Startup ─────────────────────────────────────────────
async function start() {
    const PORT = process.env.PORT || 5000;

    const missing = ["MONGO_URI", "DB_NAME"].filter((key) => !process.env[key]);
    if (missing.length > 0) {
        console.error(`Missing required environment variables: ${missing.join(", ")}`);
        process.exit(1);
    }

    try {
        // Fails fast in production when no usable JWT signing secret exists.
        jwtLib.assertConfigured();
    } catch (error) {
        console.error(error.message);
        process.exit(1);
    }

    await db.connectToDb();

    const server = app.listen(PORT, "0.0.0.0", () => {
        console.log(`Server running on port ${PORT}`);
    });

    const shutdown = (signal) => {
        console.log(`Received ${signal}, closing server…`);
        server.close(async () => {
            await db.closeDb().catch(() => {});
            process.exit(0);
        });
        setTimeout(() => process.exit(1), 10000).unref();
    };

    process.on("SIGTERM", () => shutdown("SIGTERM"));
    process.on("SIGINT", () => shutdown("SIGINT"));
}

if (require.main === module) {
    start().catch((error) => {
        console.error("Failed to start:", error.message);
        process.exit(1);
    });
}

module.exports = app;
