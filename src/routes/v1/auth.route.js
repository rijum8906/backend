const express = require("express");
const { login, register, googleAuth } = require("./../../controllers/v1/authController");
const googleTokenVerificationMiddleware = require("./../../middlewares/googleAuthVerification");
const router = express.Router();

router.post("/login", login);
router.post("/register", register);
router.post("/continue-with-google", googleTokenVerificationMiddleware, googleAuth);

module.exports = router;
