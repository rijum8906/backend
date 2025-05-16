const UserAuth = require("./../../models/userAuthModel");
const UserLoginHistory = require("./../../models/userLoginHistoryModel");
const UserProfile = require("./../../models/userProfileModel");
const appError = require("./../../utils/app-error");
const { loginToDatabase } = require("./../../utils/authUtils");

/**
 * Login a user with correct credentials
 * @param {Object} params - Login parameters
 * @param {String} [params.email] - User's email
 * @param {String} [params.username] - User's username
 * @param {String} params.password - User's password
 * @param {String} params.ipAddress - IP address of the device
 * @param {String} params.deviceId - Device identifier (typo fixed from devideId)
 * @param {String} params.userAgent - User agent string
 * @returns {Object} the jwt token and some user details
 */
module.exports.loginUserByPass = async ({ sessionInfo, userInfo }) => {
  const { username, password, email } = userInfo;

  // Find user by username or email
  const fetchedUser = username ? await UserAuth.findOne({ username }) : await UserAuth.findOne({ email });

  // Check if user exists and password is correct
  if (!fetchedUser || !(await fetchedUser.comparePassword(password))) {
    throw new appError("Invalid credentials", 404);
  }

  // if the account is already locked
  if (fetchedUser.isLocked) {
    throw new appError("Too many times login.", 429);
  }

  // Save the login information to database
  const responseData = await loginToDatabase(user, sessionInfo, "password");

  return responseData;
};

/**
 * Register a new user with password authentication
 * @param {Object} params - Registration parameters
 * @param {String} params.email - User's email
 * @param {String} params.username - User's username
 * @param {String} params.password - User's password
 * @param {String} [params.firstName] - User's first name
 * @param {String} [params.lastName] - User's last name
 * @param {String} params.ipAddress - IP address of the device
 * @param {String} params.deviceId - Device identifier
 * @param {String} params.userAgent - User agent string
 * @returns {Object} the jwt token and some user details
 */
module.exports.registerByPassword = async ({ sessionInfo, userInfo }) => {
  const { firstName, lastName, username, email, password } = userInfo;

  // Check if email or username already exists
  const existingUser = await UserAuth.findOne({
    $or: [{ email }, { username }],
  });
  if (existingUser) {
    if (existingUser.email === email) {
      throw new appError("Email already in use", 409);
    } else {
      throw new appError("Username already taken", 409);
    }
  }

  // Create new user and profile and save them
  const newUserProfile = new UserProfile({ firstName, lastName, ipAddress: sessionInfo.ipAddress });
  await newUserProfile.save();
  const newUser = new UserAuth({
    email,
    username,
    password,
    registrationMethod: "password",
    profileInfo: newUserProfile._id,
  });
  await newUser.save();

  // Save the login information to database
  const responseData = await loginToDatabase(newUser, sessionInfo, "password");

  return responseData;
};

/**
 * Login or register a user using Google OAuth
 * @param {Object} params - OAuth parameters
 * @param {String} params.googleId - Google's user ID
 * @param {String} params.email - Google account email
 * @param {String} [params.username] - Optional username
 * @param {String} params.ipAddress - IP address
 * @param {String} params.deviceId - Device identifier
 * @param {String} params.userAgent - User agent string
 * @returns {Object} JWT token and user details
 */
module.exports.loginOrRegisterByGoogle = async ({ userInfo, sessionInfo }) => {
  const { firstName, lastName, googleId, email, username, avatarURL } = userInfo;
  // Try to find existing user by Google ID or email
  const fetchedUser = await UserAuth.findOne({ email, "socialLogins.google.id": googleId });
  const isUserExists = await UserAuth.exists({ email });

  // Case 1: User already exists with this email and google Id
  if (fetchedUser) {
    // Save the login information to database
    const responseData = await loginToDatabase(fetchedUser, sessionInfo, "google");

    return responseData;
  } else if (isUserExists) {
    // Case 2: If email is registered but not linked with google
    throw new appError("Email already in use.", 409);
  } else {
    // Case 3: New registration
    // Create new user
    const newUserProfile = new UserProfile({ firstName, lastName, avatarURL, ipAddress: sessionInfo.ipAddress });
    await newUserProfile.save();
    const newUser = new UserAuth({
      email,
      username,
      registrationMethod: "google",
      isEmailVerified: true,
      profileInfo: newUserProfile._id,
    });
    newUser.socialLogins.google = {
      id: googleId,
      email,
    };
    await newUser.save();

    // Save the login information to database
    const responseData = await loginToDatabase(newUser, sessionInfo, "google");

    return responseData;
  }
};
