const express = require("express");
const checkAuth = require("../middleware/checkAuth");
const {
  getAllCustomers,
  getAllExpeditions,
  getAllСarriers,
  getContrAgents,
  getOneAgent,
} = require("../controllers/UR");

const router = express.Router();

router.route("/customers").get(getAllCustomers);
router.route("/expeditions").get(getAllExpeditions);
router.route("/carriers").get(getAllСarriers);
router.route("/all").post(getContrAgents);
router.route("/:id").get(getOneAgent);
module.exports = router;
