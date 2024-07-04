const express = require("express");


const { addWebGuestZap, recordVisit, getVisitorsMonth } = require("../../controllers/web/web");
const router = express.Router();

router.route("/add-guest-zap").post(addWebGuestZap);
router.route("/visitor").post(recordVisit);
router.route("/month-visitors").get(getVisitorsMonth);

module.exports = router;
