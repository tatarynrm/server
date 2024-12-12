const nodemailer = require('nodemailer');
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
const sendEmail = async (to, subject, text) => {


    const mailOptions = {
        from: 'ict-info-logistics@ict.lviv.ua',
        to,
        subject,
        text: text 
    };

    return transporter.sendMail(mailOptions);
};
module.exports = {
  transporter,
  sendEmail

};
