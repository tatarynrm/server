const express = require("express");
const checkAuth = require("../middleware/checkAuth");
const { getGroups } = require("../controllers/groups");


const router = express.Router();

router.route("/").get(getGroups);

module.exports = router;
