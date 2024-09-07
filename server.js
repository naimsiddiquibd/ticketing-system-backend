const express = require('express');
const errorHandler = require('./middleware/errorHandler');
const connectDb = require('./config/dbConnection');
const dotenv = require('dotenv').config();
const path = require('path');
const cors = require('cors');

// Connect to the database
connectDb();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());

// Middleware to parse JSON bodies
app.use(express.json());

// Routes
app.use("/api/tickets", require("./routes/ticketRoutes"));
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/events", require("./routes/eventRoutes"));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Error handling middleware
app.use(errorHandler);

// Start the server
app.listen(port, () => {
    console.log("Server listening on port " + port);
});
