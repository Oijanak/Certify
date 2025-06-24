const express = require("express");
const {
  getAllUsersWithRoleUser,
  getUserCertificates,
  changePassword,
} = require("../controllers/user");
const { userAuthenticate } = require("../middlewares/authenticate");
const router = express.Router();
router.get("", userAuthenticate, getAllUsersWithRoleUser);
router.get("/certificates", userAuthenticate, getUserCertificates);
router.post("/change", userAuthenticate, changePassword);
module.exports = router;
