
const express = require("express");
const { getLastMessages, deleteOneMessage } = require("../../controllers/noris/chat");

const router = express.Router();

router.route("/last").get(getLastMessages);
router.route("/delete-message").post(deleteOneMessage);




module.exports = router;
