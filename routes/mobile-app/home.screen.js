const express = require("express");

const { getHomeScreenData } = require("../../controllers/mobile-app/home-screen");


const router = express.Router();

router.route("/home-screen").get(getHomeScreenData);

module.exports = router;
