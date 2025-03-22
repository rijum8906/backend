const mongoose = require("mongoose");

// Creating User Profile Schema
const userProfileSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      unique: true,
      required: true,
    },
    avatarURI: {
      type: String,
    },
    bio: {
      type: String,
    },
  },
  {
    timestamps: true,
  },
);

// Creating Ise User Profile Model
const UserProfile = mongoose.model("UserProfile", UserProfileSchema);

// Exports
module.exports = UserProfile;
