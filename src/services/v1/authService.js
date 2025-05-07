const UserAuth = require("./../../models/user.model");
const UserLoginHistory = require("./../../models/userLoginHistoryModel");
const appError = require("./../../utils/app-error");
const { formatLoginData } = require("./../../utils/authUtils");

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
module.exports.loginUserByPass = async ({email, username, password, ipAddress, deviceId, userAgent}) => {
    // Find user by username or email
    const fetchedUser = username 
        ? await UserAuth.findOne({username}) 
        : await UserAuth.findOne({email});
    
    // Check if user exists and password is correct
    if(!fetchedUser || !(await fetchedUser.comparePassword(password))) {
        throw appError("Invalid credentials", 404);
    }
    
    // increase the login attempt 
    fetchedUser.incrementLoginAttempts();
    
    // Generate token
    const token = fetchedUser.generateAuthToken()
    
    // Add session
    fetchedUser.addSession({
        token,
        ipAddress, 
        deviceId, 
        userAgent, 
        method: "password",
    });
    
    // Create login history record
    const newLoginData = new UserLoginHistory({
        userId: fetchedUser._id,
        token, 
        ipAddress, 
        deviceId, 
        userAgent,
        method: "password"
    });
    
    await fetchedUser.save();
    await newLoginData.save();
    
    return {
        token,
        user: formatLoginData(fetchedUser)
    };
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
module.exports.registerByPassword = async ({
    email,
    username,
    password,
    firstName,
    lastName,
    ipAddress,
    deviceId,
    userAgent
}) => {
    // Check if email or username already exists
    const existingUser = await UserAuth.findOne({
        $or: [{ email }, { username }]
    });
    
    if (existingUser) {
        if (existingUser.email === email) {
            throw appError("Email already in use", 409);
        } else {
            throw appError("Username already taken", 409);
        }
    }
    
    // Create new user
    const newUser = new UserAuth({
        email,
        username,
        password,
        firstName,
        lastName,
        registrationMethod: "password"
    });
    
    // Generate token
    const token = newUser.generateAuthToken();
    
    // Add session
    newUser.addSession({
        token,
        ipAddress, 
        deviceId, 
        userAgent, 
        method: "password",
    });
    
    // Create login history record
    const newLoginData = new UserLoginHistory({
        userId: newUser._id,
        token,
        ipAddress,
        deviceId,
        userAgent,
        method: "password",
    });
    
    // Save everything
    await newUser.save();
    await newLoginData.save();
    
    return {
        token,
        user: formatLoginData(newUser)
    };
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
module.exports.loginOrRegisterByGoogle = async ({
  firstName,
  lastName,
  googleId,
  email,
  username,
  ipAddress,
  deviceId,
  userAgent
}) => {
  // Try to find existing user by Google ID or email
  const fetchedUser = await UserAuth.findOne({"socialLogins.google.id":googleId, email});

  // Case 1: Existing Google-linked user
  if (fetchedUser) {
        // increase the login attempt 
    fetchedUser.incrementLoginAttempts();
    
    // Generate token
    const token = fetchedUser.generateAuthToken()
    
    // Add session
    fetchedUser.addSession({
        token,
        ipAddress, 
        deviceId, 
        userAgent, 
        method: "google",
    });
    
    // Create login history record
    const newLoginData = new UserLoginHistory({
        userId: fetchedUser._id,
        token, 
        ipAddress, 
        deviceId, 
        userAgent,
        method: "google"
    });
    
    await fetchedUser.save();
    await newLoginData.save();
    
    return {
        token,
        user: formatLoginData(fetchedUser)
    };
  } else {
  // Case 2: New registration
      // Create new user
    const newUser = new UserAuth({
        email,
        username,
         password,
        firstName,
        lastName,
        registrationMethod: "google"
    });
    newUser.socialLogins.google = {
      id: googleId,
      email
    }
    
    // Generate token
    const token = newUser.generateAuthToken();
    
    // Add session
    newUser.addSession({
        token,
        ipAddress, 
        deviceId, 
        userAgent, 
        method: "google",
    });
    
    // Create login history record
    const newLoginData = new UserLoginHistory({
        userId: newUser._id,
        token,
        ipAddress,
        deviceId,
        userAgent,
        method: "password",
    });
    
    // Save everything
    await newUser.save();
    await newLoginData.save();
    
    return {
        token,
        user: formatLoginData(newUser)
    };
  }

  
};