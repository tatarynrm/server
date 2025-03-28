const express = require('express');
const router = express.Router();


const { uploadUserProfilePhoto } = require('../../multer/user_profile');
const { uploadUserProfilePicture } = require('../../controllers/noris/profile');

// Маршрут для завантаження файлу
router.post('/upload', uploadUserProfilePhoto.single('file'), uploadUserProfilePicture);

module.exports = router;