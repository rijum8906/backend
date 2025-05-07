const mongoose = require("mongoose");

const loginHistorySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId, 
    ref: "UserAuth",
    required: true 
  },
  ipAddress: String,
  userAgent: String,
  deviceId: String,
  method: { type: String, enum: ["password", "google", "github","facebook"] },
  status: { type: String, enum: ["success", "failed", "locked"] }
},
{
  timestamp:true
});

module.exports = mongoose.model("LoginHistory", loginHistorySchema);