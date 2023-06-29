const express = require("express");
const checkAuth = require("../middleware/checkAuth");
const { getZas } = require("../controllers/zas");

const router = express.Router();

router.route("/:id").get(getZas);
module.exports = router;
