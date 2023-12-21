const express = require("express");

const { getEvents, createMessAll, getAllMess, getGoogleMeetLink } = require("../controllers/events");

const { sendNewYearEmailFunction } = require("../controllers/emails");

const router = express.Router();

router.route("/").post(sendNewYearEmailFunction);

module.exports = router;
