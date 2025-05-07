const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const validator = require("validator");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const appError = require("./../utils/app-error")

const userAuthSchema = new mongoose.Schema(
  {
    // --- Core Auth Fields ---
    email: {
      type: String,
      unique: true,
      required: [true, "Email is required"],
      trim: true,
      lowercase: true,
      validate: {
        validator: validator.isEmail,
        message: "Invalid email format",
      },
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [12, "Password must be at least 12 characters"],
      select: false,
    },
    username: {
      type: String,
      unique: true,
      required: [true, "Username is required"],
      trim: true,
      match: [/^[a-z0-9_]+$/, "Username must be lowercase alphanumeric + underscores"],
      minlength: 3,
      maxlength: 30,
    },
    role: {
      type:"String",
      enum: ["user","admin"],
      default:"user"
    },

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

    // --- Account Security ---
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetTokenExpires: Date,
    isTFAEnabled: {
      type: Boolean,
      default: false,
    },
    TFASecret: {
      type: String,
      select: false,
    },

    // --- Social Logins ---
    socialLogins: {
      google: {
        id: { type: String },
        email: String,
      },
      github: {
        id: { type: String, select: false },
        email: String,
      },
    },
    
    // --- Login Information ---
lastLogin: {
  timestamp: {
    type:Date,
    default: Date.now
  },
  ipAddress: String,
  deviceId: String
},
activeSessions: [{
  token: String,
  ipAddress: String,
  userAgent: String,
  deviceId: String,
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastUsed: {
    type: Date,
    default: Date.now
  }
}]
    
    // --- Account Status ---
    registrationMethod:{
      type: String,
      enum:["password","google","github","facebook"],
      default:"password"
    }
    isVerified: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isLocked: {
      type: Boolean,
      default: false
    },
    lastLogin: Date,
    loginAttempts: {
      type: Number,
      default: 0,
    },
    lockUntil: Date,
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ======================
// MIDDLEWARE & METHODS
// ======================

// --- Password Hashing ---
userAuthSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    this.password = await bcrypt.hash(this.password, 12);
    if (!this.isNew) this.passwordChangedAt = Date.now() - 1000; // 1 sec ago
    next();
  } catch (err) {
    next(err);
  }
});

// --- Password Comparison ---
userAuthSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// --- Generate JWT Token ---
userAuthSchema.methods.generateAuthToken = function () {
  return jwt.sign(
    {
      id: this._id,
      email: this.email,
      role: this.role,
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "1d" }
  );
};

// --- Password Reset Token ---
userAuthSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");
  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  this.passwordResetTokenExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

  return resetToken;
};

// --- Add/Update Sessions on Login ---
userAuthSchema.methods.addSession = function (sessionInfo) {
  // Find existing session for this device
  const existingSessionIndex = this.activeSessions.findIndex(
    session => session.deviceId === sessionInfo.deviceId
  );

  if (existingSessionIndex >= 0) {
    // Update existing session 
    this.activeSessions[existingSessionIndex].lastUsed = Date.now();
  } else {
    // Add new session
    this.activeSessions.push(sessionInfo);
};

// --- Account Locking for Brute Force ---
userAuthSchema.methods.incrementLoginAttempts = function () {
  if (this.isLocked && this.lockUntil && this.lockUntil > Date.now()) {
    throw appError("Account is temporarily locked",401);
  }

  this.loginAttempts += 1;
  if (this.loginAttempts >= 5) {
    this.lockUntil = Date.now() + 15 * 60 * 1000; // Lock for 15 mins
  }
};

// --- Virtuals ---
userAuthSchema.virtual("fullName").get(function () {
  return `${this.firstName} ${this.lastName}`;
});

// --- Indexes ---
userAuthSchema.index({ email: 1 }, { unique: true });
userAuthSchema.index({ username: 1 }, { unique: true });
userAuthSchema.index({ "socialLogins.google.id": 1 });
userAuthSchema.index({ "socialLogins.github.id": 1 });

const UserAuth = mongoose.model("UserAuth", userAuthSchema);
module.exports = UserAuth;