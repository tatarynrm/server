const express = require("express");
const {
  getALLDownloads,
  getDownloadById,
  createDownload,
} = require("../controllers/INTERNAL_DOWNLOADS");

const router = express.Router();

router.route("/").get(getALLDownloads);
router.route("/:id").get(getDownloadById);
router.route("/").post(createDownload);
module.exports = router;
