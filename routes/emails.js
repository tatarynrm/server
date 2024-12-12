const express = require("express");

const { getEvents, createMessAll, getAllMess, getGoogleMeetLink } = require("../controllers/events");

const { sendNewYearEmailFunction } = require("../controllers/emails");
const { createEmailListInDb, sendEmailsDirectly, getAllTables, playSendingDirectly } = require("../controllers/emails-controller");

const router = express.Router();

router.route("/").post(sendNewYearEmailFunction);

router.route('/create-list').post(createEmailListInDb)
router.route('/direct-send').post(sendEmailsDirectly)

router.route('/play-sending').post(playSendingDirectly)




router.route('/emails-tables').get(getAllTables)




module.exports = router;
