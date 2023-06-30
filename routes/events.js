const express = require("express");

const { getEvents } = require("../controllers/events");

const router = express.Router();

router.route("/").post(getEvents);

module.exports = router;
