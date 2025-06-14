const express = require("express");
const { getAllUsersWithRoleUser } = require("../controllers/user");
const { userAuthenticate } = require("../middlewares/authenticate");
const router = express.Router();
router.get("", userAuthenticate, getAllUsersWithRoleUser);
module.exports = router;
