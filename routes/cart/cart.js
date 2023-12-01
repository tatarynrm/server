const express = require("express");

const checkAuth = require("../../middleware/checkAuth");
const { getCart, getDepartments, getAllPrinters, getCartModel, getCartriges, changePrinterModel, getAllDepartments, changePrinterDep } = require("../../controllers/cart/cart");
const router = express.Router();

router.route("/cart").get(getCart);
router.route("/dep").get(getDepartments);
router.route("/printers").get(getAllPrinters);
router.route("/cart-model").get(getCartModel);
router.route("/cartriges").get(getCartriges);
router.route("/departments").get(getAllDepartments);
router.route("/update-printer").post(changePrinterModel);
router.route("/update-dep").post(changePrinterDep);

module.exports = router;