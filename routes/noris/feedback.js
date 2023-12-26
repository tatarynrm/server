const express = require("express");
const { createFeedback, getAllFeedbacks, getAllEmailsCount } = require("../../controllers/noris/feedback");
const router = express.Router();

router.route("/create").post(createFeedback);
router.route("/").get(getAllFeedbacks);
router.route("/emails").get(getAllEmailsCount);

module.exports = router;
