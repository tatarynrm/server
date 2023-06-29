const express = require("express");
const { getAllCargos, getCargoById } = require("../controllers/cargos");

const router = express.Router();

router.route("/").get(getAllCargos);
// router.route("/:id").get(getCargoById);
module.exports = router;
