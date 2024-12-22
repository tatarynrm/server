const oracledb = require("oracledb");
const { pool_emails_send } = require("../db/pg/email");
const { insertEmailsIntoTables } = require("../utils/saveEmailsToSend");
const { sendEmail } = require("../nodemailer/emails_to_contragents");
const { getTables } = require("../utils/tables/emails-tabels");
oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;

const createEmailListInDb = async (req, res) => {
  const { type, commentTitle, commentText, documentTitle } = req.body;

  const result = await insertEmailsIntoTables(
    type,
    commentTitle,
    commentText,
    documentTitle
  );

  const tableResult = await pool_emails_send.query(`select * from ${result}`);

  res.status(200).json({
    tableResult,
    data: result,
  });
  try {
  } catch (error) {
    console.log(error);
  }
};


// const sendEmailsDirectly = async (req, res) => {
//   const { table, title, text } = req.body;

//   try {
//     // Fetch emails from the database
//     const data = await pool_emails_send.query(`SELECT * FROM ${table}`);
//     console.log('TABLE:', table);

//     // Insert into send_pause if not exists
//     const ensureSendPauseExists = async () => {
//       const checkQuery = `SELECT * FROM send_pause WHERE send_id = $1`;
//       const checkResult = await pool_emails_send.query(checkQuery, [table]);

//       if (checkResult.rows.length === 0) {
//         const insertQuery = `INSERT INTO send_pause (send_id, is_pause) VALUES ($1, 0) RETURNING *;`;
//         const insertResult = await pool_emails_send.query(insertQuery, [table]);
//         console.log("Send pause entry created:", insertResult.rows[0]);
//       }
//     };

//     await ensureSendPauseExists();

//     // Function to check if sending is paused
//     const isPaused = async () => {
//       const checkPauseQuery = `SELECT is_pause FROM send_pause WHERE send_id = $1`;
//       const pauseResult = await pool_emails_send.query(checkPauseQuery, [table]);
//       return pauseResult.rows[0]?.is_pause === 1;
//     };

//     const emails = data.rows;
//     const textToWords = `"${text}"`;

//     if (emails.length > 0) {
//       // Define a function to send a batch of emails
//       const sendBatchEmails = async (emailsBatch) => {
//         for (const email of emailsBatch) {
//           try {
//             // Send email using your email service (e.g., nodemailer)
//             await sendEmail(email.email, title, textToWords);
//             console.log(`Email sent to: ${email.email}`);

//             // Update the `issend` field in the database to true after email is sent
//             await pool_emails_send.query(
//               `UPDATE ${table} SET issend = true WHERE id = $1`,
//               [email.id]
//             );
//             console.log(`Email status updated for: ${email.email}`);
//           } catch (error) {
//             console.log(`Error sending email to: ${email.email}`, error);
//           }
//         }
//       };

//       // Function to send emails in batches of 10 every 20 seconds
//       const sendEmailsInBatches = async () => {
//         for (let i = 0; i < emails.length; i += 10) {
//           // Check if sending is paused
//           if (await isPaused()) {
//             console.log(`Sending is paused for table: ${table}`);
//             res.status(400).json({ message: `Sending is paused for table: ${table}` });
//             return;
//           }

//           const emailsBatch = emails.slice(i, i + 10); // Get the next 10 emails
//           await sendBatchEmails(emailsBatch); // Send this batch

//           if (i + 10 < emails.length) {
//             console.log(
//               "Waiting for 20 seconds before sending the next batch..."
//             );
//             await new Promise((resolve) => setTimeout(resolve, 20000)); // Wait 20 seconds
//           }
//         }

//         res.status(200).json({ message: "Emails sent successfully" });
//       };

//       // Start sending emails in batches
//       await sendEmailsInBatches();
//     } else {
//       res.status(400).json({ message: "No emails found to send." });
//     }
//   } catch (error) {
//     console.log(error);
//     res
//       .status(500)
//       .json({ message: "An error occurred while fetching or sending emails." });
//   }
// };


const sendEmailsDirectly = async (req, res) => {
  const { table, title, text,photo } = req.body;
console.log('PHOTO!!!!!!!!!',photo);

  try {
    // Функція для перевірки, чи процес призупинено для конкретної таблиці
    const isPaused = async () => {
      const checkPauseQuery = `SELECT is_pause FROM send_pause WHERE send_id = $1`;
      const pauseResult = await pool_emails_send.query(checkPauseQuery, [table]);
      return pauseResult.rows[0]?.is_pause === 1;
    };

    // Переконуємось, що запис для паузи існує для конкретної таблиці
    const ensureSendPauseExists = async () => {
      const checkQuery = `SELECT * FROM send_pause WHERE send_id = $1`;
      const checkResult = await pool_emails_send.query(checkQuery, [table]);

      if (checkResult.rows.length === 0) {
        const insertQuery = `INSERT INTO send_pause (send_id, is_pause) VALUES ($1, 0) RETURNING *;`;
        const insertResult = await pool_emails_send.query(insertQuery, [table]);
        console.log("Send pause entry created:", insertResult.rows[0]);
      }
    };

    // Переконуємось, що запис для паузи існує
    await ensureSendPauseExists();

    // Функція для отримання всіх листів, які ще не були надіслані
    const getEmailsToSend = async () => {
      const query = `SELECT * FROM ${table} WHERE issend = false`;
      const result = await pool_emails_send.query(query);
      return result.rows;
    };

    // Функція для відправки партії листів
    const sendBatchEmails = async (emailsBatch) => {
      for (const email of emailsBatch) {
        try {
          // Відправка листа (наприклад, через nodemailer)
          await sendEmail(email.email, title, `${text}`,photo);
          console.log(`Email sent to: ${email.email}`);

          // Оновлення статусу `issend` в базі
          await pool_emails_send.query(
            `UPDATE ${table} SET issend = true WHERE id = $1`,
            [email.id]
          );
          console.log(`Email status updated for: ${email.email}`);
        } catch (error) {
          console.log(`Error sending email to: ${email.email}`, error);
        }
      }
    };

    let responseSent = false; // Прапор для перевірки, чи вже надіслано відповідь

    // Основний цикл для відправки листів, який продовжує працювати поки не будуть всі листи відправлені
    do {
      // Перевірка чи процес призупинено
      if (await isPaused()) {
        console.log(`Sending is paused for table: ${table}`);
        
        // Якщо вже була надіслана відповідь, не намагаємось зробити це знову
        if (!responseSent) {
          res.status(400).json({ message: `Sending is paused for table: ${table}` });
          responseSent = true;
        }
        
        // Зупиняємо відправку та чекаємо, поки буде знову активовано (is_pause = 0)
        while (await isPaused()) {
          console.log("Pausing email sending, waiting for is_pause = 0...");
          await new Promise(resolve => setTimeout(resolve, 5000)); // Чекаємо 5 секунд перед повторною перевіркою
        }
        
        console.log("Sending resumed, continuing email sending...");
      }

      const emailsToSend = await getEmailsToSend();

      if (emailsToSend.length > 0) {
        // Розбиваємо на партії по 10 листів
        const emailsBatch = emailsToSend.slice(0, 10);
        await sendBatchEmails(emailsBatch); // Відправка цієї партії

        console.log("Waiting for 20 seconds before sending the next batch...");
        await new Promise((resolve) => setTimeout(resolve, 20000)); // Очікування 20 секунд
      } else {
        console.log('All emails have been sent.');
      }
    } while ((await getEmailsToSend()).length > 0); // Цикл буде тривати, поки є хоча б один лист із `issend = false`

    // Надсилаємо фінальну відповідь тільки один раз
    if (!responseSent) {
      res.status(200).json({ message: "Emails sent successfully" });
      responseSent = true;
    }

  } catch (error) {
    console.log(error);
    if (!responseSent) {
      res.status(500).json({ message: "An error occurred while fetching or sending emails." });
      responseSent = true;
    }
  }
};



const playSendingDirectly = async (req, res) => {
  const { play,send_id } = req.body;  // Отримуємо значення 'play' з тіла запиту
  console.log('Received play:', req.body);  // Лог для перевірки

  try {
    // Перевіряємо значення 'play' та визначаємо, яке значення присвоїти 'is_pause'
  // Якщо play = 'true', встановлюємо is_pause = 0 (продовжити)
    
    // Оновлення значення поля is_pause для конкретної таблиці (table_name)
    const updatePauseQuery = `
      UPDATE send_pause
      SET is_pause = $1
      WHERE send_id = $2
    `;

    // Параметри запиту: is_pause та send_id (таблиця, для якої відправка листів буде відновлена/призупинена)
    await pool_emails_send.query(updatePauseQuery, [play, send_id]);

    // Відправляємо відповідь клієнту
    res.status(200).json({ message: `Sending ${play === 'true' ? 'resumed' : 'paused'} successfully.` });
  } catch (error) {
    console.error('Error in playSendingDirectly:', error);
    res.status(500).json({ message: 'An error occurred while updating the pause status.' });
  }
};



const getAllTables = async (req, res) => {
  const data = await getTables();


    res.status(200).json(data)

 
};
module.exports = {
  createEmailListInDb,
  sendEmailsDirectly,
  getAllTables,
  playSendingDirectly
};
