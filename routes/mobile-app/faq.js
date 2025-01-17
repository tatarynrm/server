const express = require("express");
const { getFaq } = require("../../controllers/mobile-app/faq");



const router = express.Router();

router.route("/faq").get(getFaq);

module.exports = router;
