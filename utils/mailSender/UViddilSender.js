require("dotenv").config();
const nodemailer = require("nodemailer");
const cron = require("node-cron");
const oracledb = require("oracledb");
const pool = require("../../db/pool");
const moment = require("moment");

// Nodemailer
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

// Отримати дані по конкретній даті (сьогодні)
async function fetchOracleLogs(date) {
  connection = await oracledb.getConnection(pool);
  connection.currentSchema = "ICTDAT";
  console.log(date, "date");

  try {
    const result = await connection.execute(
      `
      SELECT 
        b.pip,
        TO_CHAR(a.dat, 'YYYY-MM-DD') AS dat,
        TO_CHAR(a.timein, 'hh24:mi') AS chasin,
        DECODE(a.code_type, 'ROB', 'РОБ', c.info) AS stan,
        a.prim
      FROM guarddat a
      LEFT JOIN os b ON a.kod_os = b.kod
      LEFT JOIN v_guardtype c ON a.code_type = c.code
      WHERE a.dat = TRUNC(:dat, 'DD')
      ORDER BY b.pip
      `,
      {
        dat: new Date(date.toISOString().split("T")[0]), // передаємо тільки дату без часу
      }
    );

    const my = new Date(date.toISOString().split("T")[0]); // передаємо тільки дату без часу


    return result.rows;
  } catch (err) {
    console.error("Помилка при запиті до Oracle:", err);
    return [];
  } finally {
    await connection.close();
  }
}

// Формування HTML
function generateHTMLReport(rows) {
  if (rows.length === 0) return "<p>Сьогодні записів немає.</p>";

  const tableRows = rows
    .map(
      (r) => `
    <tr>
      <td>${r.PIP}</td>
      <td>${moment(r.DAT).format("LLL")}</td>
      <td>${r.CHASIN}</td>
      <td>${r.STAN}</td>
      <td>${r.PRIM || ""}</td>
    </tr>
  `
    )
    .join("");

  return `
    <h2>Щоденний звіт працівників</h2>
    <table border="1" cellpadding="6" cellspacing="0">
      <thead>
        <tr>
          <th>ПІП</th>
          <th>Дата</th>
          <th>Час</th>
          <th>Стан</th>
          <th>Примітки</th>
        </tr>
      </thead>
      <tbody>
        ${tableRows}
      </tbody>
    </table>
  `;
}

// Надсилання листа
async function sendDailyReport() {
  const today = new Date();
  const logs = await fetchOracleLogs(today);
  const html = generateHTMLReport(logs);
  const formattedDate = moment(new Date()).format("LLL");

  const mailOptions = {
    from: `rt@ict.lviv.ua`,
    to: ["rt@ict.lviv.ua"],
    subject: `Щоденний звіт — ${formattedDate}`,
    html,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`[${formattedDate}] Email успішно надіслано`);
  } catch (error) {
    console.error(`[${formattedDate}] Помилка надсилання:`, error);
  }
}

module.exports = {
  sendDailyReport,
};
