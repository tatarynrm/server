const express = require("express");


const { addWebGuestZap, recordVisit, getVisitorsMonth, getVisitorsMonthGroup, selectAllWebGuestZap } = require("../../controllers/web/web");
const router = express.Router();

router.route("/add-guest-zap").post(addWebGuestZap);
router.route("/visitor").post(recordVisit);
router.route("/month-visitors").get(getVisitorsMonth);
router.route("/month-visitors-report").get(getVisitorsMonthGroup);
router.route("/webguest-zap").get(selectAllWebGuestZap);

module.exports = router;
