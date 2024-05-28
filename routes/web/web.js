const express = require("express");

const checkAuth = require("../middleware/checkAuth");
const { addWebGuestZap } = require("../../controllers/web/web");
const router = express.Router();

router.route("/add-guest-zap").post(addWebGuestZap);

module.exports = router;
