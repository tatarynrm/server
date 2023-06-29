const express = require("express");
const { login, getMe, mobileLogin } = require("../controllers/auth");
const checkAuth = require("../middleware/checkAuth");
const router = express.Router();

router.route("/login").post(login);
router.route("/login/mobile").post(mobileLogin);
router.route("/me").get(checkAuth, getMe);
module.exports = router;
