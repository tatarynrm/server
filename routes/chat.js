const express = require("express");
const { createMessage, getAllMessages } = require("../controllers/chat");

const router = express.Router();

router.route("/").post(createMessage);
router.route("/").get(getAllMessages);
module.exports = router;
