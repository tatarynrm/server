const express = require("express");


const { saveUserPushToken, sendPushNotification } = require("../../controllers/mobile-app/notifications");
const router = express.Router();

router.route("/token-save").post(saveUserPushToken);
router.route("/send-push").post(sendPushNotification);

module.exports = router;
