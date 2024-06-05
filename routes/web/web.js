const express = require("express");


const { addWebGuestZap, recordVisit } = require("../../controllers/web/web");
const router = express.Router();

router.route("/add-guest-zap").post(addWebGuestZap);
router.route("/visitor").post(recordVisit);

module.exports = router;
