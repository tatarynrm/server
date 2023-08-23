const express = require("express");
const {
  getAllUsers,
  getUserById,
  getActiveUsers,
  getFiredUsers,
  getAllManagers,
  getAllOsManagers,
  getAllOsManagersTg,
  getAllUsersToCloseZap,
} = require("../controllers/users");
const checkAuth = require("../middleware/checkAuth");

const router = express.Router();

router.route("/").get(checkAuth,getAllUsers);
router.route("/managers").get(checkAuth,getAllManagers);
router.route("/os-managers").get(getAllOsManagers);
router.route("/os-managers-tg").get(getAllOsManagersTg);
router.route("/close-zap").get(getAllUsersToCloseZap);
router.route("/active").get(getActiveUsers);
router.route("/fired").get(getFiredUsers);
router.route("/:id").get(checkAuth, getUserById);
module.exports = router;
