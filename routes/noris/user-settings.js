const express = require('express');
const { getUserSettings, updateSettings } = require('../../controllers/noris/user-settings');
const router = express.Router();









router.post('/all',  getUserSettings);
router.post('/update',  updateSettings);

module.exports = router;