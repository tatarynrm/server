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
  getClosedZapByDate,
  editZapText,
  zakrZap,
  getManagersIsCommentZap,
  editZapCinaStatus,
  copyZap,
  getAllFreeTrucks,
  editZapKilAm,
  getTzType,
  editTzType,
  editZapZbir,
  editZapZam,
  getAllZapMobile,
  getZapInformationData,
  editComment
} = require("../controllers/zap");

const router = express.Router();

router.route("/add").post(createZap);
router.route("/").post(getAllZap);
router.route("/mobile").get(getAllZapMobile);
router.route("/closed").post(getClosedZap);
router.route("/groups").post(getGroups);
router.route("/delete").post(deleteZap);
router.route("/zakr-zap").post(zakrZap);
router.route("/refresh").post(refreshZap);
router.route("/edit").post(editZap);
router.route("/copy").post(copyZap);
router.route("/edit-text").post(editZapText);
router.route("/edit-zap-cina").post(editZapCinaStatus);
router.route("/all").post(getAllTimeZap);
router.route("/by-date").post(getClosedZapByDate);
router.route("/coments-in-zap").post(getManagersIsCommentZap);
router.route("/free-trucks").get(getAllFreeTrucks);
router.route("/edit-kilam").post(editZapKilAm);
router.route("/edit-tztype").post(editTzType);
router.route("/edit-zapzbir").post(editZapZbir);
router.route("/edit-zapzam").post(editZapZam);
router.route("/edit-zap-comment").post(editComment);
router.route("/tztype").get(getTzType);
router.route("/zap-information-data").get(getZapInformationData);

module.exports = router;
