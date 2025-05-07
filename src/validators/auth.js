const Joi = require("joi");

// Signin Schema
module.exports.loginSchema = Joi.object({
  email: Joi.string().email().messages({
    "string.email": "Please provide a valid email address",
  }),
  username: Joi.string().alphanum().min(3).max(15).messages({
    "string.alphanum": "Username must only contain alphanumeric characters",
    "string.min": "Username must be at least {#limit} characters long",
    "string.max": "Username cannot exceed {#limit} characters",
  }),
  password: Joi.string().pattern(new RegExp("^[a-zA-Z0-9]{8,50}$")).required().messages({
    "string.pattern.base": "Password must be alphanumeric and between 8 to 50 characters",
    "any.required": "Password is required",
  }),
}).xor("email", "username"); // Ensures either email or username is provided, but not both

// Signup Schema
module.exports.registerSchema = Joi.object({
  firstName: Joi.string().min(2).max(20).required().messages({
    "string.min": "First name must be at least {#limit} characters long",
    "string.max": "First name cannot exceed {#limit} characters",
    "any.required": "First name is required",
  }),
  lastName: Joi.string().min(2).max(20).required().messages({
    "string.min": "Last name must be at least {#limit} characters long",
    "string.max": "Last name cannot exceed {#limit} characters",
    "any.required": "Last name is required",
  }),
  email: Joi.string().email().required().messages({
    "string.email": "Please provide a valid email address",
    "any.required": "Email is required",
  }),
  username: Joi.string().alphanum().min(3).max(15).required().messages({
    "string.alphanum": "Username must only contain alphanumeric characters",
    "string.min": "Username must be at least {#limit} characters long",
    "string.max": "Username cannot exceed {#limit} characters",
    "any.required": "Username is required",
  }),
  password: Joi.string().pattern(new RegExp("^[a-zA-Z0-9]{8,50}$")).required().messages({
    "string.pattern.base": "Password must be alphanumeric and between 8 to 50 characters",
    "any.required": "Password is required",
  }),
});

// Device Schema 
module.exports.deviceSchema = Joi.object({
  ipAddress: Joi.string().required().messages({
    "string.required": "ip address is not given."
  }),
  userAgent: Joi.string().required().messages({
    "string.required": "user agent is not given."
  }),
  deviceId: Joi.string().required().messages({
    "string.required": "device ID is not given."
  }),
  os: Joi.string().optional(),
  browser: Joi.string().optional(),
  lastAccessed: Joi.date().default(Date.now)
});

// Google Auth Schema
module.exports.googleAuthSchema = Joi.object({
  googleId: Joi.string().required(),
  email: Joi.string().email().required(),
  firstName: Joi.string(),
  lastName: Joi.string()
});