const jwt = require("jsonwebtoken");
const UserLoginHistory = require("./../models/userLoginHistoryModel");
const UserProfile = require("./../models/userProfileModel");
const redisClient = require("./../configs/redisConfig");

const formatLoginData = async (user) => {
  const userData = await user.populate("profileInfo");
  const { username, email, profileInfo } = userData;
  return {
    id: user._id,
    username,
    email,
    profileInfo,
  };
};

const generateToken = ({isRefreshToken, user}) => {
  const expiresIn = isRefreshToken ? process.env.JWT_REFRESH_TOKEN_EXPIRES : process.env.JWT_ACCESS_TOKEN_EXPIRES;
  const secretKey = process.env.JWT_SECRET_KEY;
  const payload = isRefreshToken ?
  {
    sub: user._id
  } :
  {
    sub: user._id,
    role: user.role,
    username: user.username,
    email: user.email,
    firstName: user.profileInfo.firstName,
    lastName: user.profileInfo.lastName,
    avatarURL: user.profileInfo.avatarURL,
  }
  
  return jwt.sign(payload, secretKey, 
  {
    expiresIn
  }
  );
}

module.exports.loginToDatabase = async (user, sessionInfo, method) => {
  const userInfo = await user.populate("profileInfo");
  // Generate Refresh token
  const refreshToken = generateToken({isRefreshToken:true, user:userInfo});
  
  // Generate Access Token 
  const accessToken = generateToken({user:userInfo});
  
  // Save Access Token to Redis
  await redisClient.setEx(user._id.toString(), 60*15 ,accessToken, (err, reply)=>{
    if(err) throw new Error("Something went wrong. Please try again.");
  });

  // Add session
  user.addSession({
    token: refreshToken,
    ...sessionInfo,
    method,
  });

  // Create login history record
  const newLoginData = new UserLoginHistory({
    userId: user._id,
    ...sessionInfo,
    method,
  });

  await user.save();
  await newLoginData.save();

  // Rerturn token with some user information
  return {
    token: accessToken,
  };
};

// complete the login works
module.exports.completeLogin = (user) => {};
