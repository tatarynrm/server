 const mainMenuFunc = async (ctx)=>{
    if (ctx.message.from.id === 941236974 || ctx.message.from.id === 282039969 || ctx.message.from.id === 526930289 || ctx.message.from.id === 5298432643 || ctx.message.from.id === 1905920358) {
        await ctx.telegram.sendMessage(ctx.chat.id, "Головне меню", {
          parse_mode: "html",
          reply_markup: {
            keyboard: [
              [
                { text: "Активні користувачі", callback_data: "activeUsers" },
                { text: "Перезавантажити дані", callback_data: "reloadData" },
              ],
            //   [{ text: "Менеджери з логістики", callback_data: "allLogists" }],
              [{ text: "Аналіз роботи відділів", callback_data: "viddilJob" }],
            //   [
            //     {
            //       text: "Звіт по роботі менеджерів",
            //       callback_data: "managersWorkData",
            //     },
            //   ],
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
      }
}

module.exports = {
    mainMenuFunc
}