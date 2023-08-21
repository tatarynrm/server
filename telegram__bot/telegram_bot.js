const { Telegraf } = require("telegraf");
const { message } = require("telegraf/filters");
const bot = new Telegraf(process.env.BOT_TOKEN);
const path = require("path");
const fs = require("fs");
const oracledb = require("oracledb");
const pool = require("../db/pool");
oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;
const firstName = (ctx) => ctx.message.from.first_name;
let managers = [];

bot.start(async (ctx) => {
  if (ctx.message.from.id === 282039969 || ctx.message.from.id === 941236974) {
    await ctx.telegram.sendMessage(ctx.chat.id, "Головне меню", {
      parse_mode: "html",
      reply_markup: {
        keyboard: [
          [
            { text: "Активні користувачі", callback_data: "activeUsers" },
            { text: "Перезавантажити дані", callback_data: "reloadData" },
          ],
          [{ text: "Менеджери з логістики", callback_data: "allLogists" }],
          [
            {
              text: "Звіт по роботі менеджерів",
              callback_data: "managersWorkData",
            },
          ],
          [
            {
              text: "Нагадування:Актуальність заявок",
              callback_data: "managerZapReminder",
            },
          ],
        ],
        resize_keyboard: true,
      },
    });
  } else {
    await ctx.telegram.sendMessage(ctx.chat.id, "Ви в режимі користувача.");
  }
});

bot.hears("test", async (ctx) => {
  ctx.replyWithPhoto(
    { source: fs.createReadStream("images/logo.png") },
    { caption: "Усі тести пройдено!" }
  );
});

bot.hears("Нагадування:Актуальність заявок", async (ctx) => {
  try {
    const connection = await oracledb.getConnection(pool);
    const result = await connection.execute(
      `select telegramid from ictdat.us where telegramid is not null`
    );
    if (result.rows.length > 0) {
      const arrayOfUsers = result.rows;
      arrayOfUsers.forEach((item) => {
        ctx.sendMessage(
          `Доброго дня.Прошу перевірити актуальність заявок на транспортні перевезення.`,
          { chat_id: item.TELEGRAMID }
        );
      });
    }
  } catch (error) {
    console.log(error);
  }
});

bot.hears("Менеджери з логістики", async (ctx) => {
  const connection = await oracledb.getConnection(pool);
  const result = await connection.execute(`
  SELECT a.*,a.KOD,b.TELEGRAMID
  FROM ICTDAT.OS a 
  LEFT JOIN ICTDAT.US b ON a.kod = b.KOD_OS 
  WHERE a.ZVILDAT IS NULL AND a.ISMEN = 1
  `);

  let myArray = [];
for (let i = 0; i < result.rows.length; i++) {
  const el = result.rows[i];
  managers.push(el.PIP)
  console.log(el.KOD);
}
setTimeout(()=>{

},1000)
myArray.push(...result.rows)
  await ctx.replyWithHTML("OK", {
    parse_mode: "html",
    reply_markup: {
      keyboard: 
      myArray.sort((a, b) => a.PIP.localeCompare(b.PIP)).map((item, idx) => {
        return [{ text: item.PIP,callback_data:item.KOD }];
      }),
      resize_keyboard: true,
    },
  });


});



bot.hears('Аршулік М.В.',async ctx =>{
  const connection = await oracledb.getConnection(pool);
  const result = await connection.execute(`
  SELECT a.*,b.*
  FROM ICTDAT.OS a 
  LEFT JOIN ICTDAT.US b ON a.kod = b.KOD_OS 
  WHERE a.ZVILDAT IS NULL AND a.ISMEN = 1 AND a.PIP = 'Аршулік М.В.'
  `);

const res = result.rows;

console.log(res[0]);
const my = Object.entries(res[0]).map(([key,value])=>{
  return `${key}:${value}`;
})

ctx.reply(my.join(`\n`))
})






















bot.launch();

// Enable graceful stop
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));

module.exports = {
  bot,
};
