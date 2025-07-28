const express = require("express");
const { getAllZapArchive, getAllZapArchiveCommercial, getOneZapArhcive, updateRecord } = require("../controllers/zap_archive");
const router = express.Router();

router.route("/").post(getAllZapArchive);
router.route("/update").post(getOneZapArhcive);
router.route("/update-record").post(updateRecord);
router.route("/commercial").post(getAllZapArchiveCommercial);


module.exports = router;
