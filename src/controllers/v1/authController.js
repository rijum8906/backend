// Dependencies
const asyncHandler = require("express-async-handler");
const appError = require("./../utils/app-error");
const appResponse = require("./../utils/app-response");
const jwt = require("jsonwebtoken");
const { loginSchema, registerSchema, deviceSchema } = require("./../../validators/auth");
const { loginUser } = require("./../../services/v1/authService");


// Signin
module.exports.login = asyncHandler(async (req, res) => {
  const { email, username, password } = req.body;
  const ipAddress = req.ip;
  const deviceId = req.deviceId;
  const userAgent = req.headers['user-agent'];

  // Validate login credentials
  const { error: loginError } = loginSchema.validate({ email, username, password });
  if (loginError) {
    throw appError(loginError.details[0].message, 400);
  }

  // Attempt login
  const result = await loginUserByPass({
    email,
    username,
    password,
    ipAddress,
    deviceId,
    userAgent
  });

  res.status(200).json({
    success: true,
    data: {
      token: result.token,
      user: result.user
    }
  });
});

// Register
module.exports.register = asyncHandler(async (req, res) => {
  const { email, username, password, firstName, lastName } = req.body;
  const ipAddress = req.ip;
  const deviceId = req.deviceId;
  const userAgent = req.headers['user-agent'];

  // Validate registration data
  const { error: registerError } = registerSchema.validate({ 
    email, 
    username, 
    password,
    firstName,
    lastName
  });
  if (registerError) {
    throw appError(registerError.details[0].message, 400);
  }

  // Attempt registration
  const result = await registerByPassword({
    email,
    username,
    password,
    firstName,
    lastName,
    ipAddress,
    deviceId,
    userAgent
  });

  res.status(201).json({
    success: true,
    data: {
      token: result.token,
      user: result.user
    }
  });
}); 

// Google OAuth
module.exports.googleAuth = asyncHandler(async (req, res) => {
  const { googleId, email, firstName, lastName } = req.body;
  const ipAddress = req.ip;
  const deviceId = req.deviceId;
  const userAgent = req.headers['user-agent'];

  // Validate OAuth data
  const { error: oauthError } = googleAuthSchema.validate({
    googleId,
    email,
    firstName,
    lastName
  });
  if (oauthError) {
    throw appError(oauthError.details[0].message, 400);
  }

  // Validate device data
  const { error: deviceError } = deviceSchema.validate({ 
    ipAddress, 
    deviceId, 
    userAgent 
  });
  if (deviceError) {
    throw appError(deviceError.details[0].message, 400);
  }

  // Process Google authentication
  const result = await loginOrRegisterByGoogle({
    googleId,
    email,
    firstName,
    lastName,
    ipAddress,
    deviceId,
    userAgent
  });

  res.status(200).json({
    success: true,
    data: {
      token: result.token,
      user: result.user
    }
  });
});