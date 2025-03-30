const express = require('express');
const router = express.Router();



const { uploadUserProfilePicture, deleteUserProfilePicture } = require('../../controllers/noris/profile');



const { uploadUserProfilePhoto } = require('../../multer/user_profile');


// Маршрут для завантаження файлу
router.post('/upload', uploadUserProfilePhoto.single('file'), uploadUserProfilePicture);
router.post('/delete',  deleteUserProfilePicture);

module.exports = router;