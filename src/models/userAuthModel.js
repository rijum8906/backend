const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Creating User Auth Schema
const userAuthSchema = new mongoose.Schema(
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
    firstName: {
      minlength: 3,
      maxlength: 30,
      required: true,
    },
    lastName: {
      minlength: 3,
      maxlength: 30,
      required: true,
    },
    likedWith: {
      google: {
        id: String,
        token: String,
        email: String,
        name: String,
      },
      facebook: {
        id: String,
        token: String,
        email: String,
        name: String,
      },
      twitter: {
        id: String,
        token: String,
        username: String,
        displayName: String,
      },
    },
    activeSessions: [
      {
        deviceId: String,
        token: String,
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
  },
);

// Pre-save middleware to hash the password
userAuthSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next(); // Only hash if the password is modified

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Instance method to verify password
userAuthSchema.methods.verifyPassword = async function (enteredPassword) {
  if (this.password) {
    return await bcrypt.compare(enteredPassword, this.password);
  }
  return false;
};

// Creating Admin Model
const UserAuth = mongoose.model("UserAuth", userAuthSchema);

// Exports
module.exports = UserAuth;
