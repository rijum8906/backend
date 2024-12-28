const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Creating Admin Schema
const adminSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      unique: true,
      required: true,
    },
    password: {
      type: String,
      minlength: 8,
      required: true,
    },
    refreshToken: {
      type: String,
    },
  },
  {
    timestamps: true,
  },
);

// Pre-save middleware to hash the password
adminSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next(); // Only hash if the password is modified

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Instance method to match password
adminSchema.methods.matchPassword = async function (enteredPassword) {
  if (this.password) {
    return await bcrypt.compare(enteredPassword, this.password);
  }
  return false;
};

// Instance method to generate tokens
adminSchema.methods.generateTokens = async function (generateAccessToken = true, generateRefreshToken = false) {
  var accessToken;
  var refreshToken = this.refreshToken;

  // If refresh token is not set
  if (!refreshToken) {
    generateRefreshToken = true;
  }

  // generate access token
  if (generateAccessToken) {
    accessToken = jwt.sign(
      {
        id: this._id.toString(),
      },
      process.env.JWT_SECRET,
      { expiresIn: 60 * 30 },
    ); // 30 minutes
  }

  // generate refresh token
  if (generateRefreshToken) {
    refreshToken = jwt.sign(
      {
        id: this._id,
      },
      process.env.JWT_SECRET,
      { expiresIn: 3600 * 24 * 30 },
    ); // 30 days
    this.refreshToken = refreshToken;
    await this.save();
  }

  return { accessToken, refreshToken };
};

// Creating Admin Model
const Admin = mongoose.model("Admin", adminSchema);

// Exports
module.exports = Admin;
