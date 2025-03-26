
const express = require("express");
const { getLastMessages, deleteOneMessage, getChatRooms, insertOrUpdateLastViewed, getCountOfUnreadMessages } = require("../../controllers/noris/chat");

const router = express.Router();

router.route("/last").post(getLastMessages);
router.route("/delete-message").post(deleteOneMessage);
router.route("/rooms").get(getChatRooms);
router.route("/view-time").post(insertOrUpdateLastViewed);
router.route("/unread").post(getCountOfUnreadMessages);




module.exports = router;
