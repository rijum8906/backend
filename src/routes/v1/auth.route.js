const express = require("express");
const { login, adminLogin } = require("./../../controllers/v1/auth.controller");
const router = express.Router();

router.post("/login", signin);
router.post("/admin-login", adminLogin);

module.exports = router;
