const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require("path");
const hbs = require('nodemailer-express-handlebars')

const imagePath = path.resolve(__dirname,'../photos/post/new-year.jpg');
const imageBuffer = fs.readFileSync(imagePath)
const base64Image = imageBuffer.toString('base64');
const base64String = `data:image/jpeg;base64,${base64Image}`;
// Налаштуйте параметри SMTP-сервера
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
// Створіть об'єкт з параметрами листа
const handlebarOptions = {
  viewEngine: {
    extName: ".handlebars",
    partialsDir: path.resolve("./views/"),
    defaultLayout: false,
  },
  viewPath: path.resolve("./views/"),
  extName: ".handlebars",
};

transporter.use(
  "compile",
  hbs({
    viewEngine: {
      extname: ".handlebars",
      layoutsDir: path.resolve("./views/"),
      defaultLayout: false,
    },
    viewPath: path.resolve("./views/"),
    extName: ".handlebars",
  })
);

// Надішліть листа
// transporter.sendMail(mailOptions, (error, info) => {
//   if (error) {
//     console.error(`Помилка при відправці листа: ${error.message}`);
//   } else {
//     console.log(`Лист відправлено: ${info.response}`);
//   }
// });

const sendNewYearEmail = async () => {
    const mailOptions = {
        from: 'ict-info-logistics@ict.lviv.ua',
        subject: 'ДТЕП ІСТ-Захід вітає вас з Новим Роком!',
        text: "ok",
        template:"new-year",
      to: ['ab@ict.lviv.ua'],
      };
  try {
    const mail = await transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log(error);
      } else {
        console.log(`Email sent: ${info.response}`);
      }
    });
  } catch (error) {
    console.log(error);
  }
};
const pathImage = ()=>{
    console.log(base64String);
}
module.exports = {
    sendNewYearEmail,
  pathImage
};