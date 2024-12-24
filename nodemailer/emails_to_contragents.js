const nodemailer = require('nodemailer');
const path = require('path');
const fs = require('fs');
const transporter = nodemailer.createTransport({
  // service: "smtp",
  host: "mail.ict.lviv.ua",
  port: 465,
  secure: true,
  auth: {
    user: "ict-info-logistics@ict.lviv.ua",
    pass: "Tfc34#sR51",
  },
});
// Helper function to send email (replace with your actual email sending logic)
// const sendEmail = async (to, subject, text,photo) => {

// if (!photo) {
//   const mailOptions = {
//     from: 'ict-info-logistics@ict.lviv.ua',
//     to,
//     subject,
//     text: text 
// };

// return transporter.sendMail(mailOptions);
// }
// if (photo) {
//   const mailOptions = {
//     from: 'ict-info-logistics@ict.lviv.ua',
//     to,
//     subject,
//     text: text,
//     file:photo
// };

// return transporter.sendMail(mailOptions);
// }

// };
const sendEmail = async (to, subject, text, photo) => {
  const mailOptions = {
    from: 'noreply@ict.lviv.ua',
    to,
    subject,
    text,
  };

  // Якщо є фото, додаємо його як вкладення
  if (photo) {
    // Отримуємо ім'я файлу
    const fileName = path.basename(photo);  // Отримуємо ім'я файлу з шляху

    // Формуємо правильний шлях до файлу в папці uploads/images (без 'nodemailer')
    const filePath = path.join(__dirname, '..', 'uploads', 'images', fileName);

    // Логування шляху до файлу
    console.log('Шлях до файлу для вкладення:', filePath);

    // Перевірка на існування файлу
    if (!fs.existsSync(filePath)) {
      console.error('Файл не знайдено за шляхом:', filePath);
      return;  // Вийти без відправки email
    }

    // Переконаємось, що path є рядком
    if (typeof filePath !== 'string') {
      console.error('Шлях до файлу має бути рядком, отримано:', typeof filePath);
      return;  // Вийти без відправки email
    }

    // Додаємо фото до вкладень
    mailOptions.attachments = [
      {
        filename: fileName,  // Назва файлу
        path: filePath,  // Шлях до файлу
      },
    ];
  }

  try {
    // Відправляємо лист
    await transporter.sendMail(mailOptions);
    console.log('Email успішно надіслано');
  } catch (error) {
    console.error('Помилка при відправці email:', error);
  }
};
module.exports = {
  transporter,
  sendEmail

};
