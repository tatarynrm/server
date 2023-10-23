const express = require("express");
const { createFeedback, getAllFeedbacks } = require("../../controllers/noris/feedback");
const router = express.Router();

router.route("/create").post(createFeedback);
router.route("/").get(getAllFeedbacks);

module.exports = router;
