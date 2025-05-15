const mongoose = require("mongoose");

const userProfileSchema = new mongoose.Schema(
  {
    // --- Personal Details ---
    firstName: {
      type: String,
      required: [true, "First name is required"],
      trim: true,
      minlength: 2,
      maxlength: 50,
    },
    lastName: {
      type: String,
      required: [true, "Last name is required"],
      trim: true,
      minlength: 2,
      maxlength: 50,
    },
    avatarURL: String,
    bio: String,
  },
  { timestamps: true },
);

const UserProfile = mongoose.model("UserProfile", userProfileSchema);
module.exports = UserProfile;
