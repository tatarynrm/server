const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require("path");
const hbs = require('nodemailer-express-handlebars')

const imagePath = path.resolve(__dirname,'../uploads/new-year.jpeg');
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
      user: "noreply@ict.lviv.ua",
      pass: "Tgb34#vC8u",
    },
  });
// const transporter = nodemailer.createTransport({
//     // service: "smtp",
//     host: "mail.ict.lviv.ua",
//     port: 465,
//     secure: true,
//     auth: {
//       user: "ict-info-logistics@ict.lviv.ua",
//       pass: "Tfc34#sR51",
//     },
//   });
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
// const urlImg = 'https://d27jswm5an3efw.cloudfront.net/app/uploads/2019/08/image-url-3.jpg'
const sendNewYearEmail = async (text) => {
    const mailOptions = {
        from: 'noreply@ict.lviv.ua',
        subject: 'ДТЕП ІСТ-Захід вітає вас з Новим Роком!',
        // text: "ok",
        template:"email",
              context: {
        text:text,
        img:'https://api.ict.lviv.ua/files/new-year.jpeg',
      },
      to: ['tatarynrm@gmail.com','lembergus@gmail.com'],
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

// Функція для відправлення листа
function sendEmail(toEmail,text) {
  const mailOptions = {
    from: 'noreply@ict.lviv.ua', // Ваша електронна адреса
    to: toEmail,
    subject: 'ДТЕП ІСТ-Захід вітає вас з Новим Роком!',
    template:"email",
    context: {
text:text,
// img:'https://api.ict.lviv.ua/files/new-year.jpeg',
},
attachments:[
  {
    filename: 'Greettings',
    content: 'Привітання з Новим Роком!',
  },
  {
    path: imagePath,
  }]

  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error(error.message);
    } else {
      console.log(`Email sent: ${info.response}`);
    }
  });
}

// Функція для розсилки листів кожні 10 хвилин
function scheduleEmails() {
  const emails = []; // Ваш масив із 4000 електронних адрес

  let index = 0;
  const interval = setInterval(() => {
    const batch = emails.slice(index, index + 150);
    batch.forEach((email) => {
      sendEmail(email);
    });

    index += 150;

    if (index >= emails.length) {
      clearInterval(interval); // Зупинити інтервал після відправлення всіх листів
    }
  }, 10 * 60 * 1000); // Відправляти кожні 10 хвилин
}


module.exports = {
    sendNewYearEmail,
  pathImage,
  scheduleEmails,
  sendEmail
};