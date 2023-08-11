const { Telegraf } = require("telegraf");
const { message } = require("telegraf/filters");
const bot = new Telegraf(process.env.BOT_TOKEN);
const path = require('path')
const fs = require("fs");
const oracledb = require("oracledb");
const pool = require("../db/pool");
oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;
const firstName = (ctx) => ctx.message.from.first_name



bot.start(async(ctx) => {
  if (ctx.message.from.id === 282039969 || ctx.message.from.id === 941236974) {
    await ctx.telegram.sendMessage(ctx.chat.id,'Головне меню', {
      parse_mode: 'html',
      reply_markup: {
          keyboard: [
              [
                  {text: 'Активні користувачі', callback_data: 'activeUsers'},
                  {text: 'Перезавантажити дані', callback_data: 'reloadData'}
              ],
              [{text: 'Звіт по роботі менеджерів', callback_data: 'managersWorkData'}],
              [{text: 'Нагадування:Актуальність заявок', callback_data: 'managerZapReminder'}],
  
          ],
          resize_keyboard:true
      }
  })
  }else {
    await ctx.telegram.sendMessage(ctx.chat.id,'Ви в режимі користувача.')
  }
}
);


bot.hears("test",async (ctx) => {
  console.log(ctx.message.from.id);
   ctx.replyWithPhoto({source:fs.createReadStream('images/logo.png')},{caption:"Усі тести пройдено!"})
});

bot.hears('Нагадування:Актуальність заявок',async ctx =>{
try {
  const connection = await oracledb.getConnection(pool);
  const result = await connection.execute(`select telegramid from ictdat.us where telegramid is not null`);
  if (result.rows.length > 0) {
  const arrayOfUsers = result.rows;
  arrayOfUsers.forEach(item => {
    ctx.sendMessage(`Доброго дня.Прошу перевірити актуальність заявок на транспортні перевезення.`,{chat_id:item.TELEGRAMID})
  })
  }
} catch (error) {
  console.log(error);
}
})


// Function to send the object























bot.launch();

// Enable graceful stop
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));



module.exports = {
  bot
}