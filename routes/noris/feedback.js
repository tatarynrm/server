const express = require("express");
const { createFeedback } = require("../../controllers/noris/feedback");
const router = express.Router();

router.route("/create").post(createFeedback);

module.exports = router;
