// Dependencies
const asyncHandler = require("./../utils/async-handler");
const appError = require("./../utils/app-error");
const appResponse = require("./../utils/app-response");
const jwt = require("jsonwebtoken");
const { signinSchema, signupSchema } = require("./../../validators/auth");

// Signin
module.exports.signin = asyncHandler(async (req, res) => {
  const { error, value } = loginSchema.validate(req.body);

  // if the data is not corerect
  if (error) {
    throw new appError(error, 401);
  }

  if (appSecret !== process.env.APP_SECRET) {
    throw new appError("Sorry but app secret is not valid.", 404);
  }

  const token = jwt.sign({}, process.env.JWT_SECRET, { expiresIn: 3600 });

  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "none",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
  res.status(200).json(
    new appResponse("User successfully signed in.", {
      token,
    }),
  );
});

// Admin Signin
module.exports.adminSignin = asyncHandler(async (req, res) => {
  const { username, password } = req.body;
  if (username !== "admin" || password !== "fuck_nilgiri") {
    throw new appError("invalid credentials.", 404);
  }

  const token = jwt.sign({ isAdmin: true }, process.env.JWT_SECRET_FOR_ADMIN, { expiresIn: 3600 });

  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "none",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
  res.status(200).json(
    new appResponse("Admin successfully signed in.", {
      token,
    }),
  );
});
