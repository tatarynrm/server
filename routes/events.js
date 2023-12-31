const express = require("express");

const { getEvents, createMessAll, getAllMess, getGoogleMeetLink } = require("../controllers/events");

const router = express.Router();

router.route("/").post(getEvents);
router.route("/create-mess-all").post(createMessAll);
router.route("/get-all-mess").get(getAllMess);
router.route("/google-meet").post(getGoogleMeetLink);

module.exports = router;
