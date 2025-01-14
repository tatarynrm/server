const express = require("express");


const { saveUserPushToken } = require("../../controllers/mobile-app/notifications");
const router = express.Router();

router.route("/token-save").post(saveUserPushToken);

module.exports = router;
