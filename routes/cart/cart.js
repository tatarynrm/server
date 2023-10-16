const express = require("express");

const checkAuth = require("../../middleware/checkAuth");
const { getCart, getDepartments, getAllPrinters } = require("../../controllers/cart/cart");
const router = express.Router();

router.route("/cart").get(getCart);
router.route("/dep").get(getDepartments);
router.route("/printers").get(getAllPrinters);

module.exports = router;