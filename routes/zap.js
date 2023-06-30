const express = require("express");
const {
  createZap,
  getAllZap,
  getGroups,
  deleteZap,
  getClosedZap,
  refreshZap,
  editZap,
  getAllTimeZap,
} = require("../controllers/zap");

const router = express.Router();

router.route("/add").post(createZap);
router.route("/").post(getAllZap);
router.route("/closed").post(getClosedZap);
router.route("/groups").post(getGroups);
router.route("/delete").post(deleteZap);
router.route("/refresh").post(refreshZap);
router.route("/edit").post(editZap);
router.route("/all").post(getAllTimeZap);

module.exports = router;
