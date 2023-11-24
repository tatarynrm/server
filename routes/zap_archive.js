const express = require("express");
const { getAllZapArchive } = require("../controllers/zap_archive");
const router = express.Router();

router.route("/").post(getAllZapArchive);


module.exports = router;
