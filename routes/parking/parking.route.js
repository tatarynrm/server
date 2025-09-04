const express = require("express");

const {
  getParkedCars,
} = require("../../controllers/parking/parking.controller");

const router = express.Router();

router.route("/all").get(getParkedCars);

module.exports = router;
