const express = require("express");
const { getLogistProTenders } = require("../controllers/tenders");


const router = express.Router();

router.route("/logist-pro").get(getLogistProTenders);

module.exports = router;
