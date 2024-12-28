// Dependencies
const express = require("express");
// Router Dependencies
const authRouter = require("./auth.route");
const eventRouter = require("./event.route");

// Router
const router = express.Router();
router.use(authRouter);
router.use(eventRouter);

// Exports
module.exports = router;
