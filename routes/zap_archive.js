const express = require("express");
const { getAllZapArchive, getAllZapArchiveCommercial } = require("../controllers/zap_archive");
const router = express.Router();

router.route("/").post(getAllZapArchive);
router.route("/commercial").post(getAllZapArchiveCommercial);


module.exports = router;
