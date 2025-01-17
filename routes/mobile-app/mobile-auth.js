const express = require("express");
const { mobile_login } = require("../../controllers/mobile-app/mobile-auth");


const router = express.Router();

router.route("/login").post(mobile_login);

module.exports = router;
