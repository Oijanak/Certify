const express = require("express");
const router = express.Router();
const {
  register,
  verifyEmail,
  login,
  forgotPassword,
  resetPassword,

  logout,
  email,
  sendVerify,
  getUser,
} = require("../controllers/auth");
const { userAuthenticate } = require("../middlewares/authenticate");

router.post("/register", register);
router.post("/verify-email", verifyEmail);
router.post("/send-verify", sendVerify);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.put("/reset-password/:token", resetPassword);

router.get("/logout", logout);
router.get("/email", email);
router.get("/me", userAuthenticate, getUser);

module.exports = router;
