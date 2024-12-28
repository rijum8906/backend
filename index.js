// Dependencies
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const path = require("path");
require("dotenv").config();
const ENV = process.env;

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
app.use(
  cors({
    origin: "*",
    credentials: true,
    withCredentials: true,
  }),
);

// Mount routes
app.use("/api", require("./src/routes/routes"));

// Error handler middleware
app.use((err, req, res, next) => {
  return res.status(err.statusCode || 500).json({
    message: err.message,
    stack: ENV.NODE_ENV === "development" ? err.stack : undefined,
    error: err.description,
  });
});

// Listening the app
app.listen(ENV.PORT, () => {
  console.log(`app running at port ${ENV.PORT}`);
});
