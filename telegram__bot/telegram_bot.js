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
const moment = require('moment')
require('moment/locale/uk.js');

bot.start(async (ctx) => {
  // ctx.message.from.id === 282039969 || 
  if (ctx.message.from.id === 941236974) {
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
    await ctx.reply('Функції користувача', {reply_markup:{
      keyboard:[
        [{text:"Моя експедиція"}]
      ],resize_keyboard:true
    }})
  }
});

bot.hears("test", async (ctx) => {
  ctx.replyWithPhoto(
    { source: fs.createReadStream("images/logo.png") },
    { caption: "Усі тести пройдено!" }
  );
});
bot.hears("Моя експедиція", async (ctx) => {
  const connection = await oracledb.getConnection(pool);
  connection.currentSchema = "ICTDAT";
  const myKod = await connection.execute(`select kod_os from us where TELEGRAMID = ${ctx.message.from.id}`)
  const KOD_OS = myKod?.rows[0]?.KOD_OS

if (KOD_OS) {
  const result = await connection.execute(
    `select b.datzav as datzav,
    p_utils.AddStr(', ', a.punktz, decode(a.kod_krainaz, p_base.GetKodKraina, d1.nobl, c1.idd)) as zav,
    p_utils.AddStr(', ', a.punktr, decode(a.kod_krainar, p_base.GetKodKraina, d2.nobl, c2.idd)) as rozv,
    e1.nur as zam,
    e2.nur as per,
    f1.pip as menz,
    f2.pip as menp,
    a.am,
    a.pr,
    a.vod1,
    a.vod1tel
from
(select rownum as recnum, 
       t.*
from
 (
 select b.kod_zay
 from zay a
 join zaylst b on a.kod = b.kod_zay
 where a.kod_zaym is null and
       a.datprov is not null and
       (b.kod_menz = 35781 or b.kod_menp = 35781)
 order by b.datzav desc
 ) t
) t
join zay a on t.kod_zay = a.kod
join zaylst b on t.kod_zay = b.kod_zay
left join kraina c1 on a.kod_krainaz = c1.kod
left join kraina c2 on a.kod_krainar = c2.kod
left join obl d1 on a.kod_oblz = d1.kod
left join obl d2 on a.kod_oblr = d2.kod
left join ur e1 on b.kod_zam = e1.kod
left join ur e2 on b.kod_per = e2.kod
left join os f1 on b.kod_menz = f1.kod
left join os f2 on b.kod_menp = f2.kod
WHERE ROWNUM <= 10
order by recnum desc 
`);
let str = '';
console.log(result.rows);
// console.log(result.rows);
for (let i = 0; i < result.rows.length; i++) {
  const el = result.rows[i];
  console.log(el);  
  str += `\n${i + 1}\n${moment(el.DATZAV).format('L')}\n${el.ZAV} - ${el.ROZV}\nЗамовник: ${el.ZAM}\nПеревізник: ${el.PER}\nМенеджер замовника: ${el.MENZ}\nМенеджер перевізника: ${el.MENP}\nАвто:${el.AM}/${el.PR}\nВодій: ${el.VOD1} ${el.VOD1TEL}\n____________________`
}
  await ctx.reply(`Моя експедиція.\nОстанні 50 завантажень :\n${str}`)
}else {
  await ctx.reply('Я не знайшов ваших заявок.')
}

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
