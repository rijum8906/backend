// Dependencies
const jwt = require("jsonwebtoken");
const asyncHandler = require("./../utils/async-handler");
const ApiError = require("./../utils/app-error");

const checkRefreshToken = asyncHandler(async (req, res, next) => {
  const refreshToken = req.cookies.refreshToken || req.headers.authorization?.replace("Bearer ", "");

  if (!refreshToken) {
    throw new ApiError("token is not given", 401);
  }

  const decoded = await jwt.verify(refreshToken, process.env.JWT_SECRET);
  if (!decoded) {
    throw new ApiError("token is not valid", 401);
  }

  req.user = { ...decoded, ...{ refreshToken } };
  next();
});

// Exports
module.exports = checkRefreshToken;
