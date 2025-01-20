const express = require("express");
const { getFaq, createFaq } = require("../../controllers/mobile-app/faq");



const router = express.Router();

router.route("/faq").get(getFaq);
router.route("/faq/add").post(createFaq);

module.exports = router;
