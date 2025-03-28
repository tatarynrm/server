const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Налаштування multer для завантаження файлів
const storage = multer.diskStorage({
  destination: (req, file, cb) => {

    const userId = req.body.userId; // userId має передаватися з фронтенду

    console.log(req.body,'REQ BODY');
    
    const uploadDir = `uploads/userProfile`;

    // Створюємо папку, якщо її немає
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now();
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const uploadUserProfilePhoto = multer({ storage: storage });

module.exports = {
  uploadUserProfilePhoto
};
