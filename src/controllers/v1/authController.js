// Dependencies
const asyncHandler = require("express-async-handler");
const appError = require("./../../utils/app-error");
const appResponse = require("./../../utils/app-response");
const jwt = require("jsonwebtoken");
const { loginSchema, registerSchema, deviceSchema, googleAuthSchema } = require("./../../validators/auth");
const { loginUserByPass, loginOrRegisterByGoogle, registerByPassword } = require("./../../services/v1/authService");

// Signin
module.exports.login = asyncHandler(async (req, res) => {
  const userInfo = req.body;
  const ipAddress = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  const deviceId = req.deviceId;
  const userAgent = req.headers["user-agent"];

  const sessionInfo = { deviceId, ipAddress, userAgent };

  // Validate login credentials
  const { error } = loginSchema.validate(userInfo);
  if (error) {
    throw new appError(error.details[0].message, 400);
  }

  // Attempt login
  const data = await loginUserByPass({ sessionInfo, userInfo });

  res.status(200).json({
    success: true,
    data,
  });
});

// Register
module.exports.register = asyncHandler(async (req, res) => {
  const userInfo = req.body;
  const ipAddress = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  const deviceId = req.deviceId;
  const userAgent = req.headers["user-agent"];
  const sessionInfo = { deviceId, ipAddress, userAgent };

  // Validate registration data
  const { error: registerError } = registerSchema.validate(userInfo);
  if (registerError) {
    throw new appError(registerError.details[0].message, 400);
  }

  // Attempt registration
  const result = await registerByPassword({ userInfo, sessionInfo });

  res.status(201).json({
    success: true,
    data: {
      token: result.token,
      user: result.user,
    },
  });
});

// Google OAuth
module.exports.googleAuth = asyncHandler(async (req, res) => {
  const ipAddress = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  const deviceId = req.deviceId;
  const userAgent = req.headers["user-agent"];
  const username = (req.user.email.split("@")[0] + req.user.googleId.substr(0, 5)).substr(0, 15);
  
  const userInfo = { username, ...req.user };
  const sessionInfo = { deviceId, ipAddress, userAgent };

  // Validate OAuth data
  const { error: oauthError } = googleAuthSchema.validate(userInfo);
  if (oauthError) {
    throw new appError(oauthError.details[0].message, 400);
  }

  // Process Google authentication
  const result = await loginOrRegisterByGoogle({ sessionInfo, userInfo });

  res.status(200).json({
    success: true,
    data: {
      token: result.token,
      user: result.user,
    },
  });
});
