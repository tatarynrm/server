const express = require("express");
const {
  getAllUsers,
  getUserById,
  getActiveUsers,
  getFiredUsers,
} = require("../controllers/users");
const checkAuth = require("../middleware/checkAuth");

const router = express.Router();

router.route("/").get(getAllUsers);
router.route("/active").get(getActiveUsers);
router.route("/fired").get(getFiredUsers);
router.route("/:id").get(checkAuth, getUserById);
module.exports = router;
