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

const moment = require("moment");
const { mainMenuFunc } = require("./menu/mainManu");
require("moment/locale/uk.js");

bot.start(async (ctx) => {
  
  await mainMenuFunc(ctx)

  // if (ctx.message.from.id === 941236974 || ctx.message.from.id === 282039969 || ctx.message.from.id === 526930289 || ctx.message.from.id === 5298432643 || ctx.message.from.id === 1905920358) {
  //   await ctx.telegram.sendMessage(ctx.chat.id, "Головне меню", {
  //     parse_mode: "html",
  //     reply_markup: {
  //       keyboard: [
  //         [
  //           { text: "Активні користувачі", callback_data: "activeUsers" },
  //           { text: "Перезавантажити дані", callback_data: "reloadData" },
  //         ],
  //         [{ text: "Менеджери з логістики", callback_data: "allLogists" }],
  //         [{ text: "Аналіз роботи відділів", callback_data: "viddilJob" }],
  //         [
  //           {
  //             text: "Звіт по роботі менеджерів",
  //             callback_data: "managersWorkData",
  //           },
  //         ],
  //         [
  //           {
  //             text: "Нагадування:Актуальність заявок",
  //             callback_data: "managerZapReminder",
  //           },
  //         ],
  //       ],
  //       resize_keyboard: true,
  //     },
  //   });
  // } else {
  //   await ctx.telegram.sendMessage(ctx.chat.id, "Ви в режимі користувача.");
  //   await ctx.reply("Функції користувача", {
  //     reply_markup: {
  //       keyboard: [
  //         [{ text: "Моя експедиція" }],
  //         [{ text: "Некомплект документів" }],
  //       ],
  //       resize_keyboard: true,
  //     },
  //   });
  // }
});

bot.on('contact', async(ctx) => {
  const contact = ctx.message.contact;

  // Витягнення інформації з об'єкта contact
  const phoneNumber = contact.phone_number;
  const firstName = contact.first_name;
  const lastName = contact.last_name || ''; // Прізвище може бути відсутнім
  const userId = contact.user_id;

  const connection = await oracledb.getConnection(pool);
  const findUser = await connection.execute(`SELECT * FROM ICTDAT.OSTEL WHERE VALIDX  LIKE '%${phoneNumber.slice(2,phoneNumber.length)}%'`)
  // const findUser = await connection.execute(`SELECT * FROM ICTDAT.OSTEL WHERE VALIDX  LIKE '%0505001107%'`)
  
  let checkArrayOfUserKod = []
//  console.log(phoneNumber.slice(2,phoneNumber.length));
for (let i = 0; i < findUser.rows.length; i++) {
  const element = findUser.rows[i];
  // console.log(element);
  let isTrueUser = await  connection.execute(`select * from ictdat.os where KOD = ${element.KOD_OS} and ZVILDAT is null`)
  console.log(isTrueUser.rows[0]?.KOD);
  checkArrayOfUserKod.push(isTrueUser.rows[0]?.KOD)
//  if (isTrueUser.rows[0]?.KOD !== undefined) {

//  console.log(checkArrayOfUserKod);
//  }else {
//   return null
//  }
}

const uniq = checkArrayOfUserKod.filter(item => item !== undefined);
// console.log(uniq[0]);
if (uniq[0]) {
  try {
    const query = `UPDATE ictdat.us SET telegramid = :telegramid WHERE kod_os = :kod_os`;
    const binds = {
        telegramid: ctx.message.from.id,
        kod_os: uniq[0],

    };

    // Виконання запиту на оновлення даних
    const result = await connection.execute(query, binds, { autoCommit: true });


} catch (err) {
    console.error('Помилка оновлення даних:', err);
} finally {
    // Закриття пула підключень
    if (connection) {
        await connection.close();
    }
}
  await ctx.reply(`Дякуємо, ${firstName} ${lastName}. Ми отримали ваш номер телефону: +${phoneNumber}.`);
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
  const hideKeyboard = {
    remove_keyboard: true
};

// Відправка повідомлення з відключеною клавіатурою
await ctx.telegram.sendMessage(ctx.chat.id, "ВИ НЕ МОЖЕТЕ ВИКОРИСТОВУВАТИ ДАНИЙ СЕРВІС!", {
    reply_markup: hideKeyboard
});
}
  // Відправка відповіді користувачеві


  // Ви можете виконати додаткові дії, наприклад, зберегти контакт у базі даних або надіслати його кудись
//  console.log(`Отримано контакт: ${firstName} ${lastName} (ID: ${userId}), номер телефону: ${phoneNumber}`);
});



bot.hears("test", async (ctx) => {
  ctx.replyWithPhoto(
    { source: fs.createReadStream("images/logo.png") },
    { caption: "Усі тести пройдено!" }
  );
});

const myExpedition = [];
bot.hears("Моя експедиція", async (ctx) => {
  const connection = await oracledb.getConnection(pool);
  connection.currentSchema = "ICTDAT";
  const myKod = await connection.execute(
    `select kod_os from us where TELEGRAMID = ${ctx.message.from.id}`
  );
  const KOD_OS = myKod?.rows[0]?.KOD_OS;

  if (!KOD_OS) {
   
      await ctx.reply("Я не знайшов ваших заявок.");
   
  }
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
       a.datprov is not null  and 
       (b.kod_menz = ${KOD_OS} or b.kod_menp = ${KOD_OS})
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
WHERE  b.datzav > sysdate - 30 and ROWNUM <= 30
order by recnum desc 
`
    );

    if (result.rows.length > 0) {
      myExpedition.push(...result.rows);
      let str = "";
      result.rows.sort((a, b) => a.DATZAV - b.DATZAV);
    
      for (let i = 0; i < result.rows.length; i++) {
        const el = result.rows[i];

        str += `______\n${i + 1} ${moment(el.DATZAV).format("L")} ${el.ZAV} - ${
          el.ROZV
        } Водій: ${el.VOD1}\n______`;
      }
      await ctx.reply(
        `Моя експедиція.\nЗавантаження за останнім 30 днів (сортування по даті завантаження) :\n\n${str}\n\n`
      );

      function generateCalendarKeyboard(result) {
        const keyboard = [];
        let row = [];

        for (let i = 0; i < result.rows.length; i++) {
          const el = result.rows[i];
          row.push({ text: `${i + 1}`, callback_data: `zay_${i + 1}` });

          if (row.length === 6 || i === result.rows.length - 1) {
            keyboard.push(row);
            row = [];
          }
        }

        return keyboard;
      }
      const keyboard = {
        inline_keyboard: generateCalendarKeyboard(result),
      };

      // Відправлення повідомлення з клавіатурою
      bot.telegram.sendMessage(ctx.message.from.id, "Оберіть заявку:", {
        reply_markup: keyboard,
      });
  
    } else {
      await ctx.reply("У вас немає заявок за останні 30 днів.");
    }
  } 
});

bot.on("callback_query", async (ctx) => {
  // const query_data = ctx.update.callback_query.data;

  const callbackData = ctx.callbackQuery.data;

  if (callbackData.startsWith("zay_")) {
    const myZay = query_data.split("_")[1] - 1;
    const zay = myExpedition[myZay];
    if (zay) {
      await ctx.replyWithHTML(
        `Дата завантаження: ${moment(zay.DATZAV).format(
          "L"
        )}\nМісце завантаження: ${zay.ZAV}\nМісце розвантаження: ${
          zay.ROZV
        }\nЗамовник: ${zay.ZAM}\nПеревізник: ${zay.PER}\nВодій / Авто: ${
          zay.VOD1
        } <code>${zay.VOD1TEL}</code>\n${zay.AM} - ${
          zay.PR
        }\n\nОперативна інформація:\nМенеджер замовника: ${
          zay.MENZ
        }\nМенеджер перевізника: ${zay.MENP}`,
        { parse_mode: "HTML" }
      );
    }  
  }
  
  else if (callbackData.startsWith('viddil_code_')) {

         // Перевірка, чи починається callback_data з "viddil_code_"
           // Використовуємо регулярний вираз для отримання коду відділу
           const regex = /viddil_code_(\d+)/;
           const match = callbackData.match(regex);
          
          
           if (match) {
            const connection = await oracledb.getConnection(pool);
            connection.currentSchema = "ICTDAT";
             const viddilCode = match[1]; // Отримання коду відділу з відповіді
            //  await ctx.reply(`Ви обрали відділ з кодом ${viddilCode}`);

            
             const dataData = await connection.execute(`
             SELECT 
    b.kod_viddilz AS kod_viddil,
    c.nviddil,
    SUM(b.margrn) AS grn,
    COUNT(*) AS kilam
FROM 
    zay a
JOIN 
    zaylst b ON a.kod = b.kod_zay
LEFT JOIN 
    viddil c ON b.kod_viddilz = c.kod
WHERE 
    b.kod_viddilz = ${viddilCode}
    AND a.appdat >= trunc(sysdate) 
    AND TRUNC(a.appdat) <= trunc(sysdate) 
GROUP BY 
    b.kod_viddilz,
    c.nviddil
             `)

     
             if (dataData.rows[0]) {
              const myData = dataData.rows[0]
         
              await ctx.reply(` 
              ${myData.NVIDDIL}\nК-сть.авто: ${myData.KILAM}\nМаржа: ${myData.GRN}
              `)
             }else {
              await ctx.reply('Сьогодні ще не було роботи.')
             }
           } else {
             ctx.reply('Помилка: Невірний формат callback_data');
           }
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
    managers.push(el.PIP);
  
  }
  setTimeout(() => {}, 1000);
  myArray.push(...result.rows);
  await ctx.replyWithHTML("OK", {
    parse_mode: "html",
    reply_markup: {
      keyboard: myArray
        .sort((a, b) => a.PIP.localeCompare(b.PIP))
        .map((item, idx) => {
          return [{ text: item.PIP, callback_data: item.KOD }];
        }),
      resize_keyboard: true,
    },
  });
});

bot.hears("Аршулік М.В.", async (ctx) => {
  const connection = await oracledb.getConnection(pool);
  const result = await connection.execute(`
  SELECT a.*,b.*
  FROM ICTDAT.OS a 
  LEFT JOIN ICTDAT.US b ON a.kod = b.KOD_OS 
  WHERE a.ZVILDAT IS NULL AND a.ISMEN = 1 AND a.PIP = 'Аршулік М.В.'
  `);

  const res = result.rows;

  const my = Object.entries(res[0]).map(([key, value]) => {
    return `${key}:${value}`;
  });

  ctx.reply(my.join(`\n`));
});

// Основна функція для створення клавіатури
function generateCalendarKeyboard() {
  const keyboard = [];
  let row = [];
  for (let i = 1; i <= 30; i++) {
    row.push({ text: `${i}`, callback_data: `day_${i}` });
    if (i % 5 === 0) {
      keyboard.push(row);
      row = [];
    }
  }
  return keyboard;
}

// Обробник команди /start
bot.hears("da", (msg) => {
  const chatId = msg.message.from.id;

  // Отримання клавіатури
  const keyboard = {
    inline_keyboard: generateCalendarKeyboard(),
  };

  // Відправлення повідомлення з клавіатурою
  bot.telegram.sendMessage(chatId, "Оберіть число:", {
    reply_markup: keyboard,
  });
});

// Обробник кнопок
// bot.on("callback_query", async (query) => {
//   const callbackQueryId = query.id;
//   const chatId = query.from.id;
//   const chosenDay = query.update.callback_query.data.split("_")[1];
//   bot.telegram.sendMessage(chatId, `Ви обрали день ${chosenDay}`);
//   await query.answerCbQuery(`Ви обрали ${chosenDay}`);
// });

bot.hears("Некомплект документів", async (ctx) => {
  const connection = await oracledb.getConnection(pool);
  connection.currentSchema = "ICTDAT";
  // zhyla_id = 35781
  // petya_id = 38001
  const getManagerId = await connection.execute(
    `select * from us where TELEGRAMID = ${ctx.message.from.id}`
  );

  const managerKOD = getManagerId?.rows[0]?.KOD_OS;
  if (!managerKOD) {

      await ctx.reply("Виникла якась помилка на сервері...");

  }
  if (managerKOD) {
    const manager = await connection.execute(` 
    SELECT *
    FROM zay
    WHERE kod_menz IN (35781)
      AND kod_menp IN (35781)
      AND pernekomplekt IS NOT NULL AND ROWNUM <= 20`);
 
    if (manager.rows.length > 0) {
      let msg = "";
      let cont = [];
      let obj = {};
      for (let i = 0; i < manager.rows.length; i++) {
        const el = manager.rows[i];
        obj.nekom = el.PERNEKOMPLKT;
        cont.push(obj);
        msg += `${
          el.PERDATKOMPLEKT ? moment(el.PERDATKOMPLEKT).format("L") : ""
        }\nЗаявка: ${el.NUM} - ${el.PERNEKOMPLEKT}\n\n`;
      }
      await ctx.reply(msg);
    } else {
      await ctx.reply("У вас немає некомплектів документів");
    }
  } 
});
bot.hears("Аналіз роботи відділів", async (ctx) => {
  const connection = await oracledb.getConnection(pool);
  connection.currentSchema = "ICTDAT";
  // zhyla_id = 35781
  // petya_id = 38001

  const viddil = await connection.execute(`
  select * from viddil where islog = 1
  `);
 
  if (viddil.rows.length > 0) {
    // Розділити масив на підмасиви довжиною три елементи
    const chunkedArray = [];
    for (let i = 0; i < viddil.rows.length; i += 2) {
      chunkedArray.push(viddil.rows.slice(i, i + 2));
    }

    // Створити клавіатуру з кнопками по три в ряд
    const keyboard = chunkedArray.map((chunk) => {
      return chunk
        .filter((item) => item)
        .sort((a, b) => b.DOVINFO - a.DOVINFO)
        .map((item) => {
          return { text: item.DOVINFO ,callback_data:`viddil_code_${item.KOD}`};
        });
    });

    // Надіслати повідомлення з клавіатурою
    await ctx.telegram.sendMessage(ctx.chat.id, "Головне меню", {
      parse_mode: "html",
      reply_markup: {
        inline_keyboard: keyboard,
        resize_keyboard: true,
      },
    });
  } else {
    await ctx.reply("Виникла помилка, спробуйте пізніше!");
  }
});






bot.hears('сума',async ctx =>{
  const connection = await oracledb.getConnection(pool);
  connection.currentSchema = "ICTDAT";
  const data1 = await connection.execute(`
  select sum(margrn)
  from zaylst a
  where a.appdat >= to_date('01.01.2024','dd.mm.yyyy')  and
        a.appdat <= trunc(to_date('31.01.2024', 'dd.mm.yyyy'))`)
    
})
// bot.hears('Сплачені перевезення',async ctx =>{
//   const connection = await oracledb.getConnection(pool);
//   connection.currentSchema = "ICTDAT";
//   const data1 = await connection.execute(`
//   SELECT * 
// FROM ICTDAT.ZAYLST 
// WHERE 
//     APPDAT >= TRUNC(SYSDATE, 'MM') 
//     AND APPDAT < ADD_MONTHS(TRUNC(SYSDATE, 'MM'), 1)`)
//         console.log(data1);
// })
// bot.hears('Сплачені перевезення',async ctx =>{
//   const connection = await oracledb.getConnection(pool);
//   connection.currentSchema = "ICTDAT";
//   const data1 = await connection.execute(`
//   select * from zaylst where borgp > 0`)
//         console.log(data1);
// })






bot.launch();

// Enable graceful stop
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));

module.exports = {
  bot,
};
