const express = require("express");
const { createPrinter, getAllCartridges, getAllPrinters, getPrintersLocation, createCartridge, createPrinterLocation, createCartridgeChange, getAllData, getAllCartridgesChange, updatePrinter, updateCartridge, updateCartridgeChange, updateLocation } = require("../../controllers/noris/printers.controller");


const router = express.Router();

router.route("/all-printers").get(getAllPrinters);
router.route("/all-cartridges").get(getAllCartridges);
router.route("/location").get(getPrintersLocation);
router.route("/all-data").get(getAllData);

router.route("/all-cartridge-changes").get(getAllCartridgesChange);



// POST
// 
router.route("/new-printer").post(createPrinter);
router.route("/new-cartridge").post(createCartridge);
router.route("/printer-location").post(createPrinterLocation);

router.route("/cartridge-change").post(createCartridgeChange);






// UPDATE

router.route("/update-printer").post(updatePrinter);
router.route("/update-cartridge").post(updateCartridge);
router.route("/update-cartridge-change").post(updateCartridgeChange);
router.route("/update-location-change").post(updateLocation);






module.exports = router;
