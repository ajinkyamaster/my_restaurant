const express = require("express");
const path = require("path");
require("dotenv").config();
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

app.use(sessionMiddleware);

app.use(baseRoutes);

// Use customer routes
app.use(customerRoutes);


// Port
const PORT = process.env.PORT || 5000;

// Start server
db.connectToDb().then(() => {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
});
