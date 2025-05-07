const mongoose = require("mongoose");

const userProfileSchema = new mongoose.Schema(
  {
    userAuth: {  // Reference to UserAuth
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserAuth",
      required: true,
    },
    username: {
      type: String,
      unique: true,
      required: true,
    },
    avatarURL: String,
    bio: String,
  },
  { timestamps: true }
);

const UserProfile = mongoose.model("UserProfile", userProfileSchema);
module.exports = UserProfile;