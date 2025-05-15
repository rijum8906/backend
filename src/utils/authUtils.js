const jwt = require("jsonwebtoken");
const UserLoginHistory = require("./../models/userLoginHistoryModel");
const UserProfile = require("./../models/userProfileModel");

const formatLoginData = async (user) => {
  const userData = await user.populate("profileInfo");
  const { username, email, profileInfo } = userData;
  return {
    id: user._id,
    username,
    email,
    profileInfo
  };
};

module.exports.loginToDatabase = async (user, sessionInfo, method) => {
  // Generate token
  const token = user.generateAuthToken();

  // Add session
  user.addSession({
    token,
    ...sessionInfo,
    method,
  });

  // Create login history record
  const newLoginData = new UserLoginHistory({
    userId: user._id,
    token,
    ...sessionInfo,
    method,
  });

  await user.save();
  await newLoginData.save();

  // Rerturn token with some user information
  return {
    token,
    user: await formatLoginData(user),
  };
};

// complete the login works
module.exports.completeLogin = (user) => {};
