// Dependencies
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const path = require("path");
const deviceIdGenerator = require("./src/middlewares/deviceIdGenerator");
require("dotenv").config();

// Dependency Configs
const connectDB = require("./src/configs/db.config");

// Connecting to MongoDB
connectDB();

// Creating App
var app = express();

// Setting Middleware in App
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(helmet());
app.use(morgan("dev"));
app.use(deviceIdGenerator);
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "*",
    credentials: process.env.FRONTEND_URL ? true : false,
  }),
);

// Mount routes
app.use("/api/v1", require("./src/routes/v1/routes"));

// Error handler middleware
app.use((err, req, res, next) => {
  return res.status(err.statusCode || 500).json({
    success: false,
    message: err.message,
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
    error: err.description,
  });
});

// Listening the app
app.listen(process.env.PORT, () => {
  console.log(`app running at port ${process.env.PORT}`);
});
