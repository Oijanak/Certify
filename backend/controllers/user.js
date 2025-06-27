const User = require("../models/User");
const Certificate = require("../models/Cerificate");
const bcrypt = require("bcryptjs");
exports.getAllUsersWithRoleUser = async (req, res) => {
  try {
    const users = await User.find({ role: "user" }).select("-password");
    res.status(200).json({
      success: true,
      data: users,
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Server Error", error: error.message });
  }
};
exports.getUserCertificates = async (req, res) => {
  try {
    const userId = req.user.id;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const certificates = await Certificate.find({ user: userId }); // Optional: sort by newest first

    res.json(certificates);
  } catch (err) {
    res.status(500).json({
      message: "Failed to fetch certificates",
    });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user.id).select("+password");

    const isMatch = await bcrypt.compare(currentPassword, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    user.password = newPassword;
    await user.save();

    res.json({ success: true, message: "Password updated successfully" });
  } catch (error) {
    res.status(500).json({ error: "Error changing password" });
  }
};

exports.getStats = async (req, res) => {
  try {
    // Count total users
    const totalUsers = await User.countDocuments({ role: "user" });

    // Count total certificates created (status: 'created')
    const certificatesCreated = await Certificate.countDocuments({
      status: "created",
    });

    // Count pending certificates
    const certificatesPending = await Certificate.countDocuments({
      status: "pending",
    });

    res.status(200).json({
      totalUsers,
      certificatesCreated,
      certificatesPending,
    });
  } catch (err) {
    console.error("Error fetching stats:", err);
    res.status(500).json({ message: "Server error" });
  }
};
