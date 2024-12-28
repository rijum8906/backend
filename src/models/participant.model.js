const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Creating Event Schema
const eventSchema = new mongoose.Schema(
  {
    name: {
      type: String,
    },
    house: {
      type: String,
      enum: ["Udaigiri", "Shiwalik", "Arawalli", "Nilgiri"],
      required: true,
    },
    category: {
      type: String,
      enum: ["Under 14 Boys", "Under 17 Boys", "Under 19 Boys", "Junior Girls", "Senior Girls"],
      required: true,
    },
    rank: {
      type: String,
      enum:["1","2","3","4","5","6","7","8"]
    },
    event: {
      type: String,
      enum:["100m", "200m" ,"400m", "800m", "1500m", "3000m", "Javeline", "Shotput", "Discus", "High Jump", "Long Jump", "Triple Jump"],
      required: true,
    }
  },
  {
    timestamps: true,
  },
);

// Creating Event Model
const Participant = mongoose.model("Participant", eventSchema);

// Exports
module.exports = Participant;
