const express = require("express");
const {
  getCommentsById,
  addZapComment,
  setReadComments,
  deleteCommentById,
} = require("../controllers/comments");

const router = express.Router();

router.route("/:id").get(getCommentsById);
router.route("/add").post(addZapComment);
router.route("/setread").post(setReadComments);
router.route("/delete").post(deleteCommentById);

module.exports = router;
