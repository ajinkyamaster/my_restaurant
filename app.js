const express = require("express");
const path = require("path");
if (process.env.NODE_ENV !== "production") {
    require("dotenv").config();
}
const db = require("./data/database");

const app = express();

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files
app.use(express.static(path.join(__dirname, "public")));

// Set EJS as view engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

const { sessionMiddleware } = require("./session/session-config");

const baseRoutes = require("./routes/baseroutes");
const customerRoutes = require("./routes/customer");
const adminRoutes = require("./routes/admin");
const managerAuthRoutes = require("./routes/manager/auth");
const managerRoutes = require("./routes/manager");

app.use(sessionMiddleware);

app.use(baseRoutes);

// Use customer routes
app.use(customerRoutes);

// Use admin routes
app.use(adminRoutes);

// Use manager routes
app.use("/manager", managerAuthRoutes);
app.use("/manager", managerRoutes);

// Port
const PORT = process.env.PORT || 5000;

// Start server
db.connectToDb().then(() => {
   app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
});

});
