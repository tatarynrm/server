const fs = require('fs');
const path = require('path');
const { ict_managers } = require('../../db/noris/noris');
const { uploadUserProfilePhoto } = require('../../multer/user_profile');

// Функція для завантаження фото профілю
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

      // Видалення старого файлу
      const oldFilePath = path.join(__dirname, '..', '..', 'uploads', 'userProfile', oldFile.filename);
      if (fs.existsSync(oldFilePath)) {
        fs.unlinkSync(oldFilePath);
      }

      // Оновлення нового файлу в базі даних
      await ict_managers.query(
        `INSERT INTO user_images (user_id, image_path, filename) 
         VALUES ($1, $2, $3)
         ON CONFLICT (user_id) 
         DO UPDATE SET image_path = $2, filename = $3`,
        [userId, filePath, req.file.filename]
      );
    } else {
      // Додавання нового файлу в базу даних
      await ict_managers.query(
        'INSERT INTO user_images (user_id, image_path, filename) VALUES ($1, $2, $3)',
        [userId, filePath, req.file.filename]
      );
    }

    res.status(200).json({
      message: 'Файл завантажено успішно',
      filePath,
    });
  } catch (error) {
    console.error('Помилка завантаження файлу:', error);
    res.status(500).json({ message: 'Помилка при завантаженні файлу' });
  }
};

// Функція для видалення фото профілю
const deleteUserProfilePicture = async (req, res) => {
  try {
    const { userId } = req.body;
    console.log(userId);
    

    // Перевірка, чи існує запис фото в базі даних
    const result = await ict_managers.query(
      'SELECT * FROM user_images WHERE user_id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Фото не знайдено' });
    }

    const oldFile = result.rows[0];
    const oldFilePath = path.join(__dirname, '..', '..', 'uploads', 'userProfile', oldFile.filename);

    // Видалення файлу з файлової системи
    if (fs.existsSync(oldFilePath)) {
      fs.unlinkSync(oldFilePath);
    }

    // Видалення запису з бази даних
    await ict_managers.query(
      'DELETE FROM user_images WHERE user_id = $1',
      [userId]
    );

    res.status(200).json({ message: 'Фото профілю видалено успішно' });
  } catch (error) {
    console.error('Помилка при видаленні фото:', error);
    res.status(500).json({ message: 'Помилка при видаленні фото' });
  }
};

module.exports = {
  uploadUserProfilePicture,
  deleteUserProfilePicture,
};
