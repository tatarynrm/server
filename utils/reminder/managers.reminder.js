const oracledb = require("oracledb");
const pool = require("../../db/pool");
const { bot } = require("../../telegram__bot/telegram_bot");

const managersReminderCron = async () => {
  const connection = await oracledb.getConnection(pool);
  connection.currentSchema = "ICTDAT";
  try {
    const result = await connection.execute(
      `select telegramid from us where telegramid is not  null`
    );

    console.log(result.rows, "MANAGERS FOR REMINDER");

    for (let i = 0; i < result.rows.length; i++) {
        const {TELEGRAMID} = result.rows[i];
        console.log('TELEGRAM ID ', TELEGRAMID);
        

        bot.telegram.sendMessage(TELEGRAMID,`Щоденне нагадування.\nОновіть статуси авто в базі ✅`)
    }
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  managersReminderCron,
};
