const mongoose = require("mongoose");

const certificateSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  certificateType: {
    type: "String",
    required: true,
  },
  recipientName: {
    type: String,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  issueDate: {
    type: Date,
  },
  certificateId: {
    type: String,
  },
  status: {
    type: String,
    enum: ["created", "pending", "rejected"],
    default: "pending",
  },
  requestedDate: {
    type: Date,
  },
  documentUrl: {
    type: String,
  },
});

module.exports = mongoose.model("Certificate", certificateSchema);
