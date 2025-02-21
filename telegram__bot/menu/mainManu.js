const pool = require("../../db/pool");
const oracledb = require("oracledb");
const mainMenuFunc = async (ctx,findUser) => {

  if (
    ctx.message.from.id === 941236974 ||
    ctx.message.from.id === 282039969 ||
    ctx.message.from.id === 526930289 ||
    ctx.message.from.id === 5298432643 ||
    ctx.message.from.id === 1905920358
  ) {
    await ctx.telegram.sendMessage(ctx.chat.id, "Головне меню", {
      parse_mode: "html",
      reply_markup: {
        keyboard: [
          [
            { text: "Активні користувачі", callback_data: "activeUsers" },
            { text: "Перезавантажити дані", callback_data: "reloadData" },
          ],
          [{ text: "Аналіз роботи відділів", callback_data: "viddilJob" }],
          [
            {
              text: "Нагадування:Актуальність заявок",
              callback_data: "managerZapReminder",
            },
          ],
          [
            {
              text: "Сплачені перевезення",
              callback_data: "sumMonth",
            },
          ],
        ],
        resize_keyboard: true,
      },
    });
  } else {

    const connection = await oracledb.getConnection(pool);
    const checkUser = await connection.execute(`select * from ictdat.us where telegramid = ${ctx.message.from.id}`)
    const findUser = checkUser.rows[0]
 
    if (findUser?.KOD_OS) {
      await ctx.telegram.sendMessage(ctx.chat.id, "Ви в режимі користувача.");
      await ctx.reply("Функції користувача", {
        reply_markup: {
          keyboard: [
            [{ text: "Моя експедиція" }],
            [{ text: "Некомплект документів" }],
          ],
          resize_keyboard: true,
        },
      });
    }else {
      // Створення клавіатури з кнопкою запиту номера телефону
  const requestContactBtn = {
    text: "Надіслати номер телефону", // Текст на кнопці
    request_contact: true             // Запитати контакт (номер телефону)
  };

  // Формування розмітки клавіатури
  const keyboard = {
    keyboard: [[requestContactBtn]],  // Кнопки в клавіатурі
    resize_keyboard: true,            // Змінення розміру клавіатури
    one_time_keyboard: true           // Приховати клавіатуру після використання
  };

  // Відправка повідомлення з клавіатурою
  await ctx.telegram.sendMessage(ctx.chat.id, "Будь ласка, надішліть свій номер телефону.", {
    reply_markup: keyboard
  });
    }
  }

};

module.exports = {
  mainMenuFunc,
};
