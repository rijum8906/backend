// Dependencies
const asyncHandler = require("./../utils/async-handler");
const appError = require("./../utils/app-error");
const appResponse = require("./../utils/app-response");
const jwt = require("jsonwebtoken");

// Signin
module.exports.signin = asyncHandler(async (req, res) => {
  const { appSecret } = req.body;
  if (!appSecret) {
    throw new appError("Invalid data type given for authentication.", 401);
  }
  
  if(appSecret !== process.env.APP_SECRET){
    throw new appError("Sorry but app secret is not valid.", 404);
  }

  const token = jwt.sign({}, process.env.JWT_SECRET,{expiresIn:3600});

  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "none",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
  res.status(200).json(
    new appResponse("User successfully signed in.", {
      token
    }),
  );
});
