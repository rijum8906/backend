const express = require("express");
const { signin, adminSignin } = require("./../../controllers/v1/auth.controller");
const router = express.Router();

router.post("/signin", signin);
router.post("/admin-signin", adminSignin);

module.exports = router;
