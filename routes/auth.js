const express = require("express");
const {
  login,
  getMe,
  mobileLogin,
  getOtpCode,
} = require("../controllers/auth");
const checkAuth = require("../middleware/checkAuth");
const router = express.Router();

router.route("/login").post(login);
router.route("/login/mobile").post(mobileLogin);
router.route("/me").get(checkAuth, getMe);
router.route("/otp-code").post(getOtpCode);
module.exports = router;
