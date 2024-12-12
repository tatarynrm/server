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

const sendEmailsDirectly = async (req, res) => {
  const { table, title, text } = req.body;
  console.log(table);

  try {
    // Fetch emails from the database
    const data = await pool_emails_send.query(`SELECT * FROM ${table}`);
    console.log(table);
    console.log(data.rows);

    const emails = data.rows;
const textToWords = `"${text}"`
    if (emails.length > 0) {
      // Define a function to send a batch of emails
      const sendBatchEmails = async (emailsBatch) => {
        for (const email of emailsBatch) {
          try {
            // Send email using your email service (e.g., nodemailer)
            await sendEmail(email.email, title, textToWords);
            console.log(`Email sent to: ${email.email}`);

            // Update the `issend` field in the database to true after email is sent
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

      // Function to send emails in batches of 10 every 20 seconds
      const sendEmailsInBatches = async () => {
        for (let i = 0; i < emails.length; i += 10) {
          const emailsBatch = emails.slice(i, i + 10); // Get the next 10 emails
          await sendBatchEmails(emailsBatch); // Send this batch

          if (i + 10 < emails.length) {
            console.log(
              "Waiting for 20 seconds before sending the next batch..."
            );
            await new Promise((resolve) => setTimeout(resolve, 20000)); // Wait 20 seconds
          }
        }

        res.status(200).json({ message: "Emails sent successfully" });
      };

      // Start sending emails in batches
      await sendEmailsInBatches();
    } else {
      res.status(400).json({ message: "No emails found to send." });
    }
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ message: "An error occurred while fetching or sending emails." });
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
};
