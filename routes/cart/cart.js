const express = require("express");

const checkAuth = require("../../middleware/checkAuth");
const { getCart, getDepartments, getAllPrinters, getCartModel, getCartriges, changePrinterModel, getAllDepartments, changePrinterDep, changeCartridgeModel, addPrinterModel, deletePrinterModel, deleteCartridgeModel, addCartridgeModel, getCartChange, getAllPrintersList } = require("../../controllers/cart/cart");
const router = express.Router();

router.route("/cart").get(getCart);
router.route("/dep").get(getDepartments);
router.route("/printers").get(getAllPrinters);
router.route("/printers-list").get(getAllPrintersList);
router.route("/cart-model").get(getCartModel);
router.route("/cart-change").get(getCartChange);
router.route("/cartriges").get(getCartriges);
router.route("/departments").get(getAllDepartments);
router.route("/update-printer").post(changePrinterModel);
router.route("/update-dep").post(changePrinterDep);
router.route("/update-cartridge").post(changeCartridgeModel);
router.route("/add-cartridge").post(addPrinterModel);
router.route("/add-cartridge-model").post(addCartridgeModel);
router.route("/delete-printer").post(deletePrinterModel);
router.route("/delete-cartridge").post(deleteCartridgeModel);

module.exports = router;