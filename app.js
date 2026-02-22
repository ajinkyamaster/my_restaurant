const express = require("express");
const path = require("path");
if (process.env.NODE_ENV !== "production") {
    require("dotenv").config();
}
const db = require("./data/database");

const app = express();

// Trust proxy (Render uses reverse proxy)
app.set("trust proxy", 1);

const cors = require('cors');
const helmet = require('helmet');

// Enable CORS
const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:3001',
];
if (process.env.FRONTEND_URL) {
    allowedOrigins.push(process.env.FRONTEND_URL);
}

app.use(cors({
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files
app.use(express.static(path.join(__dirname, "public")));

const { sessionMiddleware } = require("./session/session-config");

const apiRoutes = require("./routes/customer/api");
const adminApiRoutes = require("./routes/admin/api");
const managerApiRoutes = require("./routes/manager/api");

app.use(sessionMiddleware);

// JSON API routes for Next.js frontend
app.use("/api", apiRoutes);
app.use("/api/admin", adminApiRoutes);
app.use("/api/manager", managerApiRoutes);

// Port
const PORT = process.env.PORT || 5000;

// Start server
db.connectToDb().then(() => {
   app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
});

});