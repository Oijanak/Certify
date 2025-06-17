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
  issuedDate: {
    type: Date,
  },
  recieptId: {
    type: String,
  },
  ipfsId: {
    type: String,
  },
  status: {
    type: String,
    enum: ["created", "pending", "rejected"],
    default: "pending",
  },
  issuer: {
    type: String,
  },
  requestedDate: {
    type: Date,
  },
  organizationName: {
    type: String,
  },
  documentUrl: {
    type: String,
  },
  transactionId: {
    type: String,
  },
});

module.exports = mongoose.model("Certificate", certificateSchema);
