const express = require("express");
const { createFeedback, getAllFeedbacks, getAllEmailsCount, createNewFeedback } = require("../../controllers/noris/feedback");
const router = express.Router();

router.route("/create").post(createFeedback);
router.route("/").get(getAllFeedbacks);
router.route("/emails").get(getAllEmailsCount);


router.route("/create-new").post(createNewFeedback);

module.exports = router;
