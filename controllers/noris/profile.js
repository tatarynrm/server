const fs = require('fs');
const path = require('path');
const { ict_managers } = require('../../db/noris/noris');
const { uploadUserProfilePhoto } = require('../../multer/user_profile');

const uploadUserProfilePicture = async (req, res) => {
  try {
    const { userId } = req.body;

    // Перевірка, чи файл було завантажено
    if (!req.file) {
      return res.status(400).json({ message: 'Файл не було завантажено' });
    }

    const filePath = `/uploads/userProfile/${req.file.filename}`;

  
    const result = await ict_managers.query(
      'SELECT * FROM user_images WHERE user_id = $1',
      [userId] 
    );

    if (result.rows.length > 0) {
      const oldFile = result.rows[0];


      const oldFilePath = path.join(__dirname, '..', '..', 'uploads', 'userProfile', oldFile.filename);
      if (fs.existsSync(oldFilePath)) {
        fs.unlinkSync(oldFilePath);
      }

      await ict_managers.query(
        `INSERT INTO user_images (user_id, image_path, filename) 
         VALUES ($1, $2, $3)
         ON CONFLICT (user_id) 
         DO UPDATE SET image_path = $2, filename = $3`,
        [userId, filePath, req.file.filename]
      );
    } else {
      
      await ict_managers.query(
        'INSERT INTO user_images (user_id, image_path, filename) VALUES ($1, $2, $3)',
        [userId, filePath, req.file.filename]
      );
    }

    // Відправлення відповіді
    res.status(200).json({
      message: 'Файл завантажено успішно',
      filePath,
    });
  } catch (error) {
    console.error('Помилка завантаження файлу:', error);
    res.status(500).json({ message: 'Помилка при завантаженні файлу' });
  }
};



module.exports = {
  uploadUserProfilePicture,
};
