
const express = require("express");
const { getLastMessages } = require("../../controllers/noris/chat");

const router = express.Router();

router.route("/last").get(getLastMessages);




module.exports = router;
