const express = require("express");
const checkAuth = require("../middleware/checkAuth");
const { getAllZay } = require("../controllers/zay");

const router = express.Router();

router.route("/").post(getAllZay);
module.exports = router;
