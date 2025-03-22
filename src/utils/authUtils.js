const jwt = require("jsonwebtoken");

module.exports.generateToken = (info) => {
  const token = jwt.sign(info, { expiresIn: process.env.EXPIRY_TIME || 3600 * 24 }); // token generate with expiry time
  return token;
};
