const jwt = require("jsonwebtoken");
const asyncHandler = require("./../utils/async-handler");
const ApiError = require("./../utils/app-error");

module.exports.authMiddleware = asyncHandler(async (req, res, next) => {
  const refreshToken = req.cookies.refreshToken || req.headers.authorization?.replace("Bearer ", "");

  if (!refreshToken) {
    throw new ApiError("Token is not provided", 401);
  }

  let isAdmin = false;
  const payload = jwt.decode(refreshToken);

  if (payload && payload.isAdmin) {
    isAdmin = true;
  }

  const secret = isAdmin ? process.env.JWT_SECRET_FOR_ADMIN : process.env.JWT_SECRET;

  try {
    const decoded = await jwt.verify(refreshToken, secret);

    if (!decoded) {
      throw new ApiError("Invalid token", 401);
    }

    req.user = { ...decoded, refreshToken };
    next();
  } catch (err) {
    throw new ApiError("Token verification failed", 401);
  }
});

module.exports.adminAuthMiddleware = asyncHandler(async (req, res, next) => {
  const refreshToken = req.cookies.refreshToken || req.headers.authorization?.replace("Bearer ", "");

  if (!refreshToken) {
    throw new ApiError("Admin token is not provided", 401);
  }

  try {
    const decoded = await jwt.verify(refreshToken, process.env.JWT_SECRET_FOR_ADMIN);

    if (!decoded) {
      throw new ApiError("Invalid admin token", 401);
    }

    req.user = { ...decoded, refreshToken };
    next();
  } catch (err) {
    throw new ApiError("Admin token verification failed", 401);
  }
});
