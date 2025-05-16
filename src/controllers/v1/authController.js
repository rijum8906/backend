// Dependencies
const asyncHandler = require("express-async-handler");
const appError = require("./../../utils/app-error");
const appResponse = require("./../../utils/app-response");
const jwt = require("jsonwebtoken");
const { loginSchema, registerSchema, deviceSchema, googleAuthSchema } = require("./../../validators/auth");
const { loginUserByPass, loginOrRegisterByGoogle, registerByPassword, logoutUser } = require("./../../services/v1/authService");

// Signin
module.exports.login = asyncHandler(async (req, res) => {
  const userInfo = req.body;
  const sessionInfo = req.session;

  // Validate login credentials
  const { error: loginError } = loginSchema.validate(userInfo);
  if (loginError) {
    throw new appError(error.details[0].message, 400);
  }

  // Attempt login
  const { accessToken, refreshToken } = await loginUserByPass({ sessionInfo, userInfo });

  res.status(200).json({
    success: true,
    data:{
      token: accessToken
    }
  });
  res.cookie("token", refreshToken, {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production" ? true : false ,
  sameSite: "lax"
  });
});

// Register
module.exports.register = asyncHandler(async (req, res) => {
  const userInfo = req.body;
  const sessionInfo = req.session;

  // Validate registration data
  const { error: registerError } = registerSchema.validate(userInfo);
  if (registerError) {
    throw new appError(registerError.details[0].message, 400);
  }

  // Attempt registration
  const { accessToken, refreshToken } = await registerByPassword({ sessionInfo, userInfo });

  res.status(200).json({
    success: true,
    data:{
      token: accessToken
    }
  });
  res.cookie("token", refreshToken, {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production" ? true : false ,
  sameSite: "lax"
  });
  });

// Google OAuth
module.exports.googleAuth = asyncHandler(async (req, res) => {
  const sessionInfo = req.session;
  const username = (req.user.email.split("@")[0] + req.user.googleId.substr(0, 5)).substr(0, 15);

  const userInfo = { username, ...req.user };

  // Validate OAuth data
  const { error: oauthError } = googleAuthSchema.validate(userInfo);
  if (oauthError) {
    throw new appError(oauthError.details[0].message, 400);
  }

  // Process Google authentication
  const { accessToken, refreshToken } = await loginOrRegisterByGoogle({ sessionInfo, userInfo });

  res.status(200).json({
    success: true,
    data:{
      token: accessToken
    }
  });
  res.cookie("token", refreshToken, {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production" ? true : false ,
  sameSite: "lax"
  });
});

// Request Check 
module.exports.checkReq = asyncHandler(async (req, res) => {
  res.status(200).json({
    status: true,
    data: {
      message: "Verification successful."
    }
  })
});

// Logout
module.exports.logout = asyncHandler(async (req, res)=>{
  const { deviceId } = req.session;
  const userId = req.user.sub;
  const status = await logoutUser({ deviceId, userId });
  res.status(200).json({
    status
  })
})