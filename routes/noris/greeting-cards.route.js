const express = require("express");
const { getAllGreetings, checkUserViewdGreeting, changeStatusToActiveViewd } = require("../../controllers/noris/greeting-cards.controller");


const router = express.Router();



// GET
router.route("/all").post(getAllGreetings);



// POST
router.route("/mark-as-viewed").post(changeStatusToActiveViewd);



// POST
// 



module.exports = router;
