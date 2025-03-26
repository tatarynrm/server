
const express = require("express");
const { getLastMessages, deleteOneMessage, getChatRooms } = require("../../controllers/noris/chat");

const router = express.Router();

router.route("/last").post(getLastMessages);
router.route("/delete-message").post(deleteOneMessage);
router.route("/rooms").get(getChatRooms);




module.exports = router;
