const express = require("express");
const { login, register, googleAuth, checkReq, logout } = require("./../../controllers/v1/authController");
const googleTokenVerificationMiddleware = require("./../../middlewares/googleAuthVerification");
const { accessTokenVerificationMiddleware } = require("./../../middlewares/auth-middleware");
const router = express.Router();

router.post("/login", login);
router.post("/logout", accessTokenVerificationMiddleware, logout);
router.post("/register", register);
router.post("/continue-with-google", googleTokenVerificationMiddleware, googleAuth);
router.post("/check-request",accessTokenVerificationMiddleware, checkReq);

module.exports = router;
