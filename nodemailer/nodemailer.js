const nodemailer = require("nodemailer");
const hbs = require("nodemailer-express-handlebars");
const path = require("path");

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
const mailOptions = {
  from: "tatarynrm@gmail.com",
  to: "tatarynrm@gmail.com",
  subject: "Sending Email using Node.js",
  text: "ok",
  template: "email",
  //   context: {
  //     title: "Title",
  //     full_name: "Roman Tataryn",
  //   },
};

// transporter.sendMail(mailOptions, (error, info) => {
//   if (error) {
//     console.log(error);
//   } else {
//     console.log(`Email sent: ${info.response}`);
//   }
// });

// const sendBuhTransport = async () => {
//   const mailOptions = {
//     from: "tatarynrm@gmail.com",
//     to: "tatarynrm@gmail.com",
//     subject: "Sending Email using Node.js",
//     text: "ok",
//     template: "email",
//       context: {
//         title: "Title",
//         full_name: "Roman Tataryn",
//       },
//   };
//   try {
//     const mail = await transporter.sendMail(mailOptions, (error, info) => {
//       if (error) {
//         console.log(error);
//       } else {
//         console.log(`Email sent: ${info.response}`);
//       }
//     });
//   } catch (error) {
//     console.log(error);
//   }
// };

// module.exports = {
//   transporter,
//   sendBuhTransport,
// };
