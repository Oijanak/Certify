const express = require("express");
const {
  getAllUsersWithRoleUser,
  getUserCertificates,
  changePassword,
  getStats,
} = require("../controllers/user");
const {
  userAuthenticate,
  adminAuthenticate,
} = require("../middlewares/authenticate");
const router = express.Router();
router.get("", userAuthenticate, getAllUsersWithRoleUser);
router.get("/certificates", userAuthenticate, getUserCertificates);
router.post("/change", userAuthenticate, changePassword);
router.get("/stats", adminAuthenticate, getStats);
module.exports = router;
