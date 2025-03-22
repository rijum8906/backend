const UserAuth = require("./../../models/user.model");
const appError = require("./../../utils/app-error");
const { generateToken } = require("./../../utils/authUtils");

// Core Authentication
module.exports.loginUser = async (userInfo) => {
  const { usernameOrEmail, password, deviceId } = userInfo;

  const fetchedUser = username
    ? await UserAuth.findOne({ username })
    : await UserAuth.findOne({
        $or: [{ username: usernameOrEmail }, { email: usernameOrEmail }],
      }); // Find the user either ny username or email.

  // check if the user exists and the password is correct
  if (!fetchedUser || (await fetchedUser.verifyPassword(password))) {
    throw new appError("invalid username or password.", 404);
  }

  const token = generateToken({ userId: fetchedUser._id.toString() });

  // check if the user is looged in with the same device
  const exixstingSession = fetchedUser.activeSessions.find((session) => session.deviceId == deviceId);
  // update the token if the user is already looged in with the same device
  if (exixstingSession) {
    exixstingSession.token = token;
  } else {
    fetchedUser.activeSessions.push({ deviceId, token });
  }
  
  return { username: fetchedUser.username, fistName: fetchedUser.fistName, lastName: fetchedUser.lastName, token }
};
