const express = require("express");
const {
  getAllUsers,
  getUserById,
  getActiveUsers,
  getFiredUsers,
  getAllManagers,
} = require("../controllers/users");
const checkAuth = require("../middleware/checkAuth");

const router = express.Router();

router.route("/").get(checkAuth,getAllUsers);
router.route("/managers").get(checkAuth,getAllManagers);
router.route("/active").get(getActiveUsers);
router.route("/fired").get(getFiredUsers);
router.route("/:id").get(checkAuth, getUserById);
module.exports = router;
