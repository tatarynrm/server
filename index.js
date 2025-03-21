require("dotenv").config();
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cors = require("cors");
const http = require("http");
const EventEmitter = require("events");
const eventEmitter = new EventEmitter();
const server = http.createServer(app);
const i18next = require('i18next');
const i18nextMiddleware = require('i18next-http-middleware');
const Cookies = require('cookies'); // Для роботи з cookies
const cron = require("node-cron");
const { bot } = require("./telegram__bot/telegram_bot");
const { Server } = require("socket.io");
const path = require("path");
const nodemailer = require("nodemailer");
const hbs = require("nodemailer-express-handlebars");
const oracledb = require("oracledb");
const multer = require("multer");
oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;
const fs = require("fs");
const moment = require("moment");
require("moment/locale/uk.js");
const cookieParser = require("cookie-parser");
const schedule = require("./services/schedule/shcedule");
const { insertData } = require("./utils/saveEmailsToSend");

const {
  sendMessageToGroup,
  sendMessageToGroupZapCina,
} = require("./telegram__bot/bot__functions");
const pool = require("./db/pool");
const authRouter = require("./routes/auth");
const usersRoute = require("./routes/users");
const cargosRoute = require("./routes/cargos");
const zasRoute = require("./routes/zas");
const UrRoute = require("./routes/UR");
const zapRoute = require("./routes/zap");
const zapArchiveRoute = require("./routes/zap_archive");
const commentsRoute = require("./routes/comments");
const eventsRoutes = require("./routes/events");
const zayRoutes = require("./routes/zay");
const groupsRoutes = require("./routes/groups");
const cartRoutes = require("./routes/cart/cart");
const emailRoutes = require("./routes/emails");
const webRoutes = require("./routes/web/web");
const feedbackNorisRoute = require("./routes/noris/feedback");
const tendersRoute = require("./routes/tenders");
const printersRoute = require("./routes/noris/printer.route");
const greetingsRoute = require("./routes/noris/greeting-cards.route");
const mobileNotificationsRoute = require("./routes/mobile-app/notifications");
const mobileHomeScreenRoute = require('./routes/mobile-app/home.screen')

const mobileAuth = require('./routes/mobile-app/mobile-auth') 
const mobileFaq = require('./routes/mobile-app/faq') 
const session = require("express-session");
const norisdb = require("./db/noris/noris");
const {
  pathImage,
  sendNewYearEmail,
} = require("./nodemailer/newYearNodemailer");
const { getOsPIP } = require("./helpers/os/osFunctions");
const {
  getDataFromLogistPro,
  multiplyLogistData,
  getAndWriteDataLogistPro,
} = require("./parser/logist-pro/logist-pro-parser");
const { getTables } = require("./utils/tables/emails-tabels");
const { getAllTables } = require("./controllers/emails-controller");
const { pool_emails_send } = require("./db/pg/email");
const {
  sendTelegramJoin,
  reportHtml,
} = require("./nodemailer/emails_to_contragents");
const { default: axios } = require("axios");
const generateReportHTML = require("./htmlTemplates/reportsForNoris");
const {
  sendPushNotification,
} = require("./controllers/mobile-app/notifications");

// Middlewares------------------------------------------------------------------------------------------------------

app.use(bodyParser.json({ limit: "30mb", extended: true }));
app.use(bodyParser.urlencoded({ limit: "30mb", extended: true }));
app.use(express.json());

app.use(
  cors({
    origin: "*",
    methods: ["POST", "GET"],
  })
);

app.use(cookieParser());
app.use(
  session({
    secret: "dsadsasa",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false,
      maxAge: 1000 * 60 * 60 * 24,
    },
  })
);
app.use((req, res, next) => {
  const allowedOrigins = [
    "https://carriers.ict.lviv.ua",
    "http://localhost:3000",
    "http://localhost:3001",
    "https://ictwork.site",
    "https://ict.lviv.ua",
    "https://work.ict.lviv.ua",
    "*"
  ];
  // const allowedOrigins = [
  //   process.env.ALLOW_ORIGIN_1,
  //   process.env.ALLOW_ORIGIN_2,
  //   process.env.ALLOW_ORIGIN_3,
  // ];
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader("Access-Controll-Allow-Origin", origin);
  }
  res.header("Access-Controll-Allow-Methods", "GET,OPTIONS");
  res.header("Access-Controll-Allow-Headers", "Content-Type,Authorization");
  res.header("Access-Controll-Allow-Credentials", true);
  return next();
});
// app.use(express.static('public'));
// app.use(express.static('/uploads'));
// app.use('/uploads',express.static('public'));
// app.use('/files',express.static('public'));
app.use("/files", express.static(__dirname + "/uploads"));
// Middlewares------------------------------------------------------------------------------------------------------

// ROUTES------------------------------------------------------------------------------------------------------
app.use("/auth", authRouter);
app.use("/users", usersRoute);
app.use("/cargos", cargosRoute);
app.use("/zas", zasRoute);
app.use("/ur", UrRoute);
app.use("/zap", zapRoute);
app.use("/zap-archive", zapArchiveRoute);
app.use("/comments", commentsRoute);
app.use("/events", eventsRoutes);
app.use("/zay", zayRoutes);
app.use("/groups", groupsRoutes);
// app.use("/cart", cartRoutes);
app.use("/feedback", feedbackNorisRoute);
app.use("/email", emailRoutes);
app.use("/tenders", tendersRoute);
app.use("/printers", printersRoute);
app.use("/greetings", greetingsRoute);
app.use("/mobile", mobileNotificationsRoute);
app.use("/mobile", mobileAuth);
app.use("/mobile", mobileFaq);
app.use("/mobile", mobileHomeScreenRoute);

// WEB
app.use("/web", webRoutes);

// WEB--------------

// ROUTES------------------------------------------------------------------------------------------------------
// app.options("*", cors({ origin: 'http://localhost:3000', optionsSuccessStatus: 200 }));

// app.use(cors({ origin: "http://localhost:3000", optionsSuccessStatus: 200 }));
// NODEMAILER
// app.get('/',(req,res)=>{
//   res.json('dsad')
// })
// NODEMAILER

// WEB SOCKETS------------------------------------------------------------------------
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});
// ...
let onlineUsers = [];
const addNewUser = (data, socketId) => {
  !onlineUsers.some((user) => user.userId === data.KOD) &&
    onlineUsers.push({ userId: data.KOD, socketId, ...data });
};

const removeUser = (socketId) => {
  onlineUsers = onlineUsers.filter((user) => user.socketId !== socketId);
};

const getUser = (userId) => {
  return onlineUsers.find((user) => user.userId === userId);
};
// ..

io.on("connection", async (socket) => {
  // КОРИСТУВАЧІ
  socket.on("newUser", (userId) => {
    addNewUser(userId, socket.id);
  });
  io.emit("getUsers", onlineUsers);
  // КОРИСТУВАЧІ

  socket.on("get_emails_send_info", async (data) => {
    const my_data = await getTables();

    io.emit("show_get_emails_send_data", my_data);
  });
  // ЗАПИТИ

  socket.on("newZap", (data) => {
    io.emit("showNewZap", data);
    // БОТ

    if (data.pZapCina === 1) {
      sendMessageToGroupZapCina(bot, data);
    } else {
      sendMessageToGroup(bot, data);
    }
  });
  socket.on("deleteZap", (data) => {
    io.emit("deleteZapAllUsers", data);
  });
  socket.on("refreshZap", (data) => {
    io.emit("refreshAllZap", data);

    if (data !== undefined || data !== null) {
      const refreshZapMessageToAllUsers = async (data) => {
        try {
          const connection = await oracledb.getConnection(pool);
          connection.currentSchema = "ICTDAT";
          const result = await connection.execute(
            `select * from zap where KOD = ${data}`
          );

          const zapData = result.rows[0];
          if (zapData !== null || zapData !== undefined) {
            // io.emit('refreshMsg',zapData)
          }
        } catch (error) {
          console.log(error);
        }
      };
      refreshZapMessageToAllUsers(data);
    } else {
      console.log("UNDEFINED KOD");
    }
  });
  socket.on("editZap", (data) => {
    io.emit("showEditZap", data);
  });
  socket.on("editZapText", (data) => {
    io.emit("showEditZapText", data);
  });
  socket.on("editKilAm", (data) => {
    io.emit("showEditKilAm", data);
  });
  socket.on("editTzType", (data) => {
    io.emit("showEditTzType", data);
  });
  socket.on("editZapCina", (data) => {
    io.emit("showZapCina", data);
  });
  socket.on("editZapZbir", (data) => {
    io.emit("showZapZbir", data);
  });
  socket.on("editZapZam", (data) => {
    // io.emit("showZapZbir", data);
  });
  socket.on("newComment",async  (data) => {

    if (data.telegramId !== null) {

      // БОТ
  if (data.pKodAuthor !== data.zapAuthor) {
    bot.telegram.sendMessage(
      data.telegramId,
      `💻 ${data.PIP}  прокоментував вашу заявку ✅${data.pKodZap}\n\n${data?.selectedZap.ZAV} --- ${data?.selectedZap.ROZV}\n💬 ${data.pComment}`
    );
  }
    
      console.log('КОД ЗАЯВКИ',data);
      const connection = await oracledb.getConnection(pool);
      connection.currentSchema = "ICTDAT";
      const resultMessages = await connection.execute(
        `select a.*,b.telegramid
         from zapcomm a 
         left join us b on a.kod_os = b.kod_os
         where a.KOD_ZAP = ${data.pKodZap}`
      );
  
   
      
      const uniqueTelegramIds = [...new Set(resultMessages.rows.map(item => item.TELEGRAMID))];

      console.log(uniqueTelegramIds);
      // БОТ
   for (let i = 0; i < uniqueTelegramIds.length; i++) {
    const element = uniqueTelegramIds[i];
    bot.telegram.sendMessage(
      element,
      `💻 ${data.PIP}  Новий коментар до заявки ✅\n${data?.selectedZap.ZAV} --- ${data?.selectedZap.ROZV}\n💬 ${data.pComment}`
    );
    
   }
    }

    io.emit("showNewComment", data);
  });

  socket.on("deleteComm", (data) => {
    io.emit("deleteCommAllUsers", data);
  });
  socket.on("myZapComment", (data) => {
    const userToSend = onlineUsers.filter(
      (item) => item.userId === data.pKodAuthor
    );
    io.to(userToSend.socketId).emit("showMyZapComment", data);
  });
  socket.on("changeCountAm", async (data) => {
    io.emit("showChangeCountAm", data);

    const resultName = await getOsPIP(data?.pKodMen);
    if (resultName && data.userToWarn?.length > 0) {
      for (let i = 0; i < data?.userToWarn?.length; i++) {
        const element = data?.userToWarn[i];
        bot.telegram.sendMessage(
          element.TELEGRAMID,
          `По заявці \n${data.zapDeleteData?.zav}\n${data.zapDeleteData?.rozv}\nзакрито ${data.pKilAmZakr} авто - ${resultName} `,
          { parse_mode: "HTML" }
        );
      }
    }
  });
  // ЗАПИТИ
// Функція для отримання userId по socket.id
async function  getUserIdBySocketId(socketId) {
  try {
    // Виконуємо запит до бази даних
    const result = await norisdb.ict_mobile.query('SELECT user_id FROM user_sessions WHERE socket_id = $1', [socketId]);

    if (result.rows.length > 0) {
      // Якщо запис знайдений, повертаємо user_id
      return result.rows[0].user_id;
    } else {
      // Якщо socket.id не знайдений, повертаємо null
      return null;
    }
  } catch (error) {
    console.error('Error fetching userId by socketId:', error);
    return null;
  }
};
// Функція для збереження socket.id та userId в БД
async function saveSocketId(userId, socketId) {
  try {
    const res = await norisdb.ict_mobile.query(
      'INSERT INTO user_sessions (user_id, socket_id) VALUES ($1, $2) ON CONFLICT (user_id, socket_id) DO NOTHING',
      [userId, socketId]
    );
    console.log(`Socket ID saved for user: ${userId}, socket ID: ${socketId}`);
  } catch (err) {
    console.error('Error saving socket ID to DB:', err);
  }
}
// Функція для видалення socket.id з БД при відключенні
async function removeSocketId(userId) {
  try {
    const res = await norisdb.ict_mobile.query('DELETE FROM user_sessions WHERE user_id = $1', [userId]);
    console.log(`Socket ID removed for user: ${userId}`);
  } catch (err) {
    console.error('Error removing socket ID from DB:', err);
  }
}


  // Реєстрація користувача за допомогою userId
  socket.on('register-user', async (userId) => {
    
    await saveSocketId(userId, socket.id); // Зберігаємо socket.id для userId в БД
  });

  // Обробка приватних повідомлень (якщо потрібно)
  socket.on('send-private-message', async (userId, message) => {
    const targetSocketId = await getSocketId(userId); // Отримуємо socket.id для конкретного користувача
    if (targetSocketId) {
      io.to(targetSocketId).emit('private-message', message); // Відправляємо повідомлення
    } else {
      console.log('User not found');
    }
  });


  socket.on('show-greet-modal',async ()=>{

    

const user = await norisdb.ict_mobile.query(`select * from user_sessions where user_id = $1`,[38231])
    // io.emit('show-greet-modal-user')
    console.log(user.rows[0]);

    const users = user.rows;

    users.forEach(item =>{
      io.to(item.socket_id).emit('show-greet-modal-user');
    })
    

   
  })

  // ADMIN

  socket.on("activeUsers", () => {
    io.emit("showActiveUsers", onlineUsers);
  });

  socket.on("activeUsersToCompare", () => {
    io.emit("showActiveUsersToCompare", onlineUsers);
  });

  socket.on("windowReload", () => {
    io.emit("windowReloadAllUsers", 1);
  });
  socket.on("textToAllUsers", (data) => {
    io.emit("showTextToAllUsers", data);
    const allActiveUsers = data.activeUsers;
    if (allActiveUsers) {
      for (let i = 0; i < allActiveUsers.length; i++) {
        const element = allActiveUsers[i];
        bot.telegram.sendMessage(
          element.TELEGRAMID,
          `<i>Повідомлення від ${data.user}</i>\n\n<b>${data.textToAllUsers}</b>`,
          { parse_mode: "HTML" }
        );
      }
    } else {
      return;
    }
  });
  socket.on("admin_msg_user", (data) => {
    io.emit("show_msg_from_admin", data);
    if (data.kod) {
      const sendMessageToUserTg = async () => {
        try {
          const connection = await oracledb.getConnection(pool);
          connection.currentSchema = "ICTDAT";
          const result = await connection.execute(
            `SELECT a.TELEGRAMID
             FROM us a
             WHERE a.KOD_OS = ${data.kod}
             `
          );
          if (result.rows[0].TELEGRAMID) {
            bot.telegram.sendMessage(
              result.rows[0].TELEGRAMID,
              `<i>Повідомлення від ${data.user}</i>\n\n<b>${data.message}</b>`,
              { parse_mode: "HTML" }
            );
          }
        } catch (error) {
          console.log(error);
        }
      };
      sendMessageToUserTg();
    }
  });
  socket.on("startGoogleMeet", (data) => {
    const remindDate = new Date(data?.dateToRemind);

    switch (data.status) {
      case 1:
        // io.emit("showStartGoogleMeet", data.GOOGLEMEET);
        for (let i = 0; i < data.users.length; i++) {
          const element = data.users[i];
          bot.telegram.sendMessage(
            element.TELEGRAMID,
            `<i>ШВИДКА НАРАДА</i>\n<i>ПРОШУ УСІМ ПРИЄДНАТИСЯ</i>\n\n<b>${data.GOOGLEMEET}</b>`,
            { parse_mode: "HTML" }
          );
        }
        break;
      case 2:
        //   io.emit("showStartGoogleMeet", data.GOOGLEMEET);
        for (let i = 0; i < data.users.length; i++) {
          const element = data.users[i];

          bot.telegram.sendMessage(
            element,
            `<i>ШВИДКА НАРАДА</i>\n<i>ПРОШУ  ПРИЄДНАТИСЯ</i>\n\n<b>${data.GOOGLEMEET}</b>`,
            { parse_mode: "HTML" }
          );
        }
        break;
      case 3:
        // io.emit("showStartGoogleMeet", data.GOOGLEMEET);
        for (let i = 0; i < onlineUsers.length; i++) {
          const element = onlineUsers[i];

          bot.telegram.sendMessage(
            element.TELEGRAMID,
            `<i>ШВИДКА НАРАДА</i>\n\n<i>ПРОШУ УСІМ ПРИЄДНАТИСЯ</i>\n\n<b>${data.GOOGLEMEET}</b>`,
            { parse_mode: "HTML" }
          );
        }
        break;
      case 4:
        schedule.scheduleJob(remindDate, () => {
          // io.emit("showStartGoogleMeetWithTime", data.GOOGLEMEET);
          for (let i = 0; i < data.users.length; i++) {
            const element = data.users[i];
            bot.telegram.sendMessage(
              element.TELEGRAMID,
              `<b>ЗАПЛАНОВАНА НАРАДА</b>\n\nТема: ${data.title}\n\nДата та час: ${data.date}\n\n<i>ПРОШУ УСІМ ПРИЄДНАТИСЯ ТЕРМІНОВО!</i>\n\n<b>${data.GOOGLEMEET}</b>`,
              { parse_mode: "HTML" }
            );
          }
        });

        for (let i = 0; i < data.users.length; i++) {
          const element = data.users[i];
          bot.telegram.sendMessage(
            element.TELEGRAMID,
            `<b>ЗАПЛАНОВАНА НАРАДА</b>\n\nТема: ${data.title}\n\nДата та час: ${data.date}\n\n<i>ПРОШУ УСІМ ПРИЄДНАТИСЯ У ВИЗНАЧЕНИЙ ЧАС!</i>\n\n<b>${data.GOOGLEMEET}</b>`,
            { parse_mode: "HTML" }
          );
        }
        break;
      case 5:
        schedule.scheduleJob(remindDate, () => {
          // io.emit("showStartGoogleMeetWithTime", data.GOOGLEMEET);
          for (let i = 0; i < data.users.length; i++) {
            const element = data.users[i];
            bot.telegram.sendMessage(
              element,
              `<b>ЗАПЛАНОВАНА НАРАДА</b>\n\nТема: ${data.title}\n\nДата та час: ${data.date}\n\n<i>ПРОШУ  ПРИЄДНАТИСЯ ТЕРМІНОВО!</i>\n\n<b>${data.GOOGLEMEET}</b>`,
              { parse_mode: "HTML" }
            );
          }
        });

        for (let i = 0; i < data.users.length; i++) {
          const element = data.users[i];
          bot.telegram.sendMessage(
            element,
            `<b>ЗАПЛАНОВАНА НАРАДА</b>\n\nТема: ${data.title}\n\nДата та час: ${data.date}\n\n<i>ПРОШУ  ПРИЄДНАТИСЯ У ВИЗНАЧЕНИЙ ЧАС!</i>\n\n<b>${data.GOOGLEMEET}</b>`,
            { parse_mode: "HTML" }
          );
        }
        break;
      case 6:
        schedule.scheduleJob(remindDate, () => {
          // io.emit("showStartGoogleMeetWithTime", data.GOOGLEMEET);
          for (let i = 0; i < onlineUsers.length; i++) {
            const element = onlineUsers[i];

            bot.telegram.sendMessage(
              element.TELEGRAMID,
              `<b>ЗАПЛАНОВАНА НАРАДА</b>\n\nТема: ${data.title}\n\nДата та час: ${data.date}\n\n<i>ПРОШУ  ПРИЄДНАТИСЯ ТЕРМІНОВО!</i>\n\n<b>${data.GOOGLEMEET}</b>`,
              { parse_mode: "HTML" }
            );
          }
        });
        for (let i = 0; i < onlineUsers.length; i++) {
          const element = onlineUsers[i];

          bot.telegram.sendMessage(
            element.TELEGRAMID,
            `<b>ЗАПЛАНОВАНА НАРАДА</b>\n\nТема: ${data.title}\n\nДата та час: ${data.date}\n\n<i>ПРОШУ  ПРИЄДНАТИСЯ У ВИЗНАЧЕНИЙ ЧАС</i>\n\n<b>${data.GOOGLEMEET}</b>`,
            { parse_mode: "HTML" }
          );
        }
        break;

      default:
        break;
    }
  });

  socket.on("logoutAll", () => {
    io.emit("logoutAllUsers", 1);
    for (let i = 0; i < onlineUsers.length; i++) {
      const el = onlineUsers[i];

      bot.telegram.sendPhoto(
        el.TELEGRAMID,
        { source: fs.createReadStream("./images/logo.png") },
        { caption: "Адміністратор завершив вашу сесію на сайті" }
      );
    }
  });

  // ADMIN

  // ADMIN TELEGRAM

  socket.on("write_all_tg", (data) => {
    if (data.telegramId !== null) {
      // БОТ
      bot.telegram.sendMessage(
        data.telegramId,
        `💻 ${data.PIP}  прокоментував вашу заявку ✅${data.pKodZap}\n\n💬 ${data.pComment}`
      );
    }
    io.emit("showNewComment", data);
  });

  socket.on("start_feedback", () => {
    io.emit("show_msg_feedback");
  });

  // ЗАПИТИ З ОСНОВНОГО САЙТУ

  socket.on("newWebZap", (data) => {
    console.log(data);
    const date = moment(new Date()).format("LLLL");

    const adminTg = [
      { who: "Татарин Роман", id: 5248905716 },
      { who: "Корецька Ольга", id: 1612647542 },
      { who: "Риптик Володимир", id: 5298432643 },
    ];

    for (let i = 0; i < adminTg.length; i++) {
      const el = adminTg[i];

      bot.telegram.sendMessage(
        el.id,
        `<i>Новий запит з корпоративного сайту компанії ${date}</i>\n\n<b>${data.name}</b>\n<b>${data.tel}</b>\n<b>${data.email}</b>\n<b>${data.text}</b>`,
        { parse_mode: "HTML" }
      );
    }
  });
  // ADMIN TELEGRAM




  socket.on('faq-add',() =>{
 
  
    io.emit('faq-add')
  })
  socket.on('new-order',() =>{
 
  
    io.emit('new-order')
  })
  // ВИЙТИ
  socket.on("disconnect", async () => {
    removeUser(socket.id);
    const userId = await getUserIdBySocketId(socket.id); // Отримуємо userId для socket.id
    if (userId) {
      await removeSocketId(userId); // Видаляємо socket.id для цього користувача
    }
  });
});

// BOT SOCKETS

bot.hears("Активні користувачі", async (ctx) => {
  if (onlineUsers.length <= 0) {
    await ctx.sendMessage("Користувачі онлайн: 0");
  } else {
    const mappedString = onlineUsers.map((obj) => obj.PIP).join("\n");
    await ctx.sendMessage(`Користувачів онлайн: ${onlineUsers.length}`);
    await ctx.sendMessage(
      `Список активних користувачів: ${onlineUsers.length}\n<b>${mappedString}</b>`,
      { parse_mode: "HTML" }
    );
  }
});
bot.hears("Перезавантажити дані", async (ctx) => {
  ctx.sendMessage("Перезавантажив");
  io.emit("windowReloadAllUsers", 1);
});
// BOT SOCKETS

// REMINDERS / НАГАДУВАННЯ

// REMINDERS / НАГАДУВАННЯ

// Server run------------------------------------------------------------------------------------------------------
app.get("/list-ur", async (req, res) => {
  try {
    const connection = await oracledb.getConnection(pool);
    connection.currentSchema = "ICTDAT";
    const data = await connection.execute(`
    SELECT JSON_OBJECT(
      'kod' VALUE a.kod,
      'name' VALUE a.nur,
      'dogs' VALUE (
        SELECT JSON_ARRAYAGG(
          JSON_OBJECT('kod' VALUE b.kod, 'numdoc' VALUE b.numdoc)
        ) 
        FROM dog b 
        WHERE b.kod_ur = a.kod
      )
    ) AS result
    FROM ur a
  `);

    let myArray = [];

    const jsonString = data.rows[0].RESULT;
    for (let i = 0; i < data.rows.length; i++) {
      const element = data.rows[i];
      const jsonElement = JSON.parse(element.RESULT);
      myArray.push(jsonElement);
    }
    const jsonData = JSON.parse(jsonString);

    const result = jsonData;

    res.json(myArray);
  } catch (error) {
    console.log(error);
    res.json(error);
  }
});

app.get("/photo", async (req, res) => {
  try {
    const connection = await oracledb.getConnection(pool);
    connection.currentSchema = "ICTDAT";
    const data = await connection.execute(`select a.foto from os a`);

    // Функція для читання LOB-потоку і обробки його даних
    function readLobStream(lobStream) {
      return new Promise((resolve, reject) => {
        const chunks = [];

        lobStream.on("data", (chunk) => {
          chunks.push(chunk);
        });

        lobStream.on("end", () => {
          const data = Buffer.concat(chunks);
          resolve(data);
        });

        lobStream.on("error", (error) => {
          reject(error);
        });
      });
    }
    readLobStream(data.rows[0].FOTO)
      .then((data) => {
        // Тут ви можете використовувати data, наприклад, відобразити зображення в React
        res.json(data);
      })
      .catch((error) => {
        console.error("Error reading LOB stream:", error);
      });
  } catch (error) {
    console.log(error);
  }
});

// Перевірка, чи є значення електронною адресою
function isEmail(value) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(value);
}

// Перевірка, чи є значення номером телефону
function isPhoneNumber(value) {
  // Регулярний вираз для валідації українського номера телефону
  const ukrainianPhoneRegex = /^(?:\+38)?(?:\(?0\d{1,2}\)?)?\d{9}$/;

  return ukrainianPhoneRegex.test(value);
}

function validateEmail(email) {
  // Регулярне вираження для перевірки електронного адресу
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // Регулярне вираження для перевірки російського домену
  const russianDomainRegex = /\.ru$/i;

  // Перевірка електронного адреса
  if (emailRegex.test(email)) {
    // Перевірка на російський домен
    if (!russianDomainRegex.test(email)) {
      // Електронний адрес відповідає вимогам
      return true;
    }
  }

  
  return false;
}

function ensureUploadDirExists(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

// Налаштування multer для збереження файлів
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Визначення папки для збереження файлу залежно від типу
    const fileType = file.mimetype.startsWith("image/") ? "images" : "files";
    const uploadDir = path.join(__dirname, "uploads", fileType);

    // Створюємо папку, якщо вона не існує
    ensureUploadDirExists(uploadDir);

    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Отримання кастомного імені файлу з заголовка
    const customFileName = req.headers["x-filename"]
      ? decodeURIComponent(req.headers["x-filename"])
      : file.originalname; // Використовуємо оригінальне ім'я, якщо заголовок відсутній

    const fileExtension = path.extname(file.originalname); // Розширення файлу

    // Забезпечення, що ім'я файлу має правильне розширення
    const finalFileName = customFileName.endsWith(fileExtension)
      ? customFileName
      : `${customFileName}${fileExtension}`;

    cb(null, finalFileName); // Зберігаємо файл із кастомним або оригінальним іменем
  },
});

// Ініціалізація multer
const upload = multer({ storage: storage });

// Маршрут для завантаження файлів
app.post("/upload", (req, res, next) => {
  upload.single("file")(req, res, (err) => {
    if (err) {
      console.error("Upload Error:", err);
      return res
        .status(500)
        .send({ message: "Error uploading the file.", error: err.message });
    }
    if (!req.file) {
      return res.status(400).send({ message: "No file uploaded." });
    }

    // Визначаємо тип файлу та його URL
    const fileType = req.file.mimetype.startsWith("image/")
      ? "images"
      : "files";
    const fileUrl = `http://localhost:8800/uploads/${fileType}/${req.file.filename}`;

    res.send({
      message: "File successfully uploaded.",
      fileUrl: fileUrl,
    });
  });
});
// Статичний доступ до завантажених файлів
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Забезпечуємо наявність базових папок
ensureUploadDirExists(path.join(__dirname, "uploads/images"));
ensureUploadDirExists(path.join(__dirname, "uploads/files"));

// Запуск сервера

app.get("/xls-files", (req, res) => {
  // Оновлений шлях до папки
  const directoryPath = path.join(__dirname, "uploads", "files");

  fs.readdir(directoryPath, (err, files) => {
    if (err) {
      return res.status(500).send("Помилка при читанні папки");
    }

    // Фільтрація файлів за розширенням .xlsx та .xls
    const xlsxFiles = files.filter(
      (file) => file.endsWith(".xlsx") || file.endsWith(".xls")
    );

    res.json(xlsxFiles);
  });
});
app.get("/xls-files", (req, res) => {
  // Оновлений шлях до папки
  const directoryPath = path.join(__dirname, "uploads", "files");

  fs.readdir(directoryPath, (err, files) => {
    if (err) {
      return res.status(500).send("Помилка при читанні папки");
    }

    // Фільтрація файлів за розширенням .xlsx та .xls
    const xlsxFiles = files.filter(
      (file) => file.endsWith(".xlsx") || file.endsWith(".xls")
    );

    res.json(xlsxFiles);
  });
});

app.get("/image-files", (req, res) => {
  // Оновлений шлях до папки
  const directoryPath = path.join(__dirname, "uploads", "images");

  fs.readdir(directoryPath, (err, files) => {
    if (err) {
      return res.status(500).send("Помилка при читанні папки");
    }

    // Фільтрація файлів за розширенням для зображень
    const imageFiles = files.filter(
      (file) =>
        file.endsWith(".jpg") ||
        file.endsWith(".jpeg") ||
        file.endsWith(".png") ||
        file.endsWith(".gif")
    );

    res.json(imageFiles);
  });
});

let arrayOfTG = [];
cron.schedule("30 9,14,17 * * 1-5", () => {
  // Запускатиме  задачу (нагадування менеджерам у яких заявка в CRM має більше 2 днів)
  // о 09:30, 14:30 та 17:30, кожного дня з понеділка по п'ятницю.
  // 10 sec --- */10 * * * * *
  // Той що треба * 9,14,16 * * 1-5
  const getAllZap = async () => {
    try {
      const connection = await oracledb.getConnection(pool);
      connection.currentSchema = "ICTDAT";
      const result = await connection.execute(`
      select a.*,b.telegramid from zap a
      left join us b on a.kod_os = b.kod_os
      where a.status = 0 AND SYSDATE - a.DATUPDATE > 2`);
      for (let i = 0; i < result.rows.length; i++) {
        const element = result.rows[i];
        if (!arrayOfTG.includes(element.TELEGRAMID)) {
          arrayOfTG.push(element.TELEGRAMID);
        }
      }
      if (arrayOfTG.length > 0) {
        for (let i = 0; i < arrayOfTG.length; i++) {
          const element = arrayOfTG[i];
          bot.telegram.sendMessage(
            element,
            `💻 Перегляньте свої заявки.Одна або більше заявок не оновлялись більше 2 днів`
          );
        }
      }
      arrayOfTG = [];
    } catch (error) {
      console.log(error);
    }
  };
  getAllZap()
});


if (process.env.SERVER === "LOCAL") {
  console.log("LOCAL_SERVER");
} else {
  console.log("MAIN SERVER");
}

app.post("/delete-file", (req, res) => {
  try {
    // Назва файлу, який потрібно видалити
    const { filename } = req.body; // Отримуємо тільки filename

    // Шляхи до папок, де можуть бути файли
    const directories = [
      path.join(__dirname, "uploads", "files"),
      path.join(__dirname, "uploads", "images"),
    ];

    let filePath = null;

    // Перевірка обох папок для наявності файлу
    for (const directory of directories) {
      const fullPath = path.join(directory, filename);

      // Перевірка на наявність файлу в поточній директорії
      if (fs.existsSync(fullPath)) {
        filePath = fullPath;
        break;
      }
    }

    if (!filePath) {
      return res.status(404).send("Файл не знайдено");
    }

    // Видалення файлу
    fs.unlink(filePath, (err) => {
      if (err) {
        console.error("Помилка при видаленні файлу:", err);
        return res.status(500).send("Помилка при видаленні файлу");
      }

      console.log(`Файл ${filename} успішно видалений з ${filePath}`);
      res.status(200).json({ message: `${filename} успішно видалений` });
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Сталася помилка");
  }
});

// Маршрут для видалення таблиці
app.get("/drop-table/:tableName", async (req, res) => {
  const { tableName } = req.params;

  try {
    //
    // Запит на видалення таблиці
    const result = await pool_emails_send.query(
      `DROP TABLE IF EXISTS ${tableName}`
    );

    // Якщо таблиця була видалена або не існувала, відповідаємо успіхом
    res.status(200).send(`Таблицю "${tableName}" успішно видалено.`);
  } catch (error) {
    console.error("Помилка при видаленні таблиці:", error);
    res.status(500).send("Не вдалося видалити таблицю.");
  }
});

const joinTelegramChannelHtml = fs.readFileSync(
  "./htmlTemplates/joinTelegramChannel.html",
  "utf-8"
);
// sendTelegramJoin('rt@ict.lviv.ua','Тестова розсилка',joinTelegramChannelHtml)
// sendTelegramJoin('vr@ict.lviv.ua','Тестова розсилка',joinTelegramChannelHtml)

// Приклад виклику функції


// sendPushNotification(38231,"Ти найкраща👋")

// const getFakeData = async ()=>{
//   try {
//     // const data = await axios.get('https://jsonplaceholder.typicode.com/posts');
//  const data = await norisdb.ict_printers.query(`select * from  printers`);
//  const result = data.rows

// if (data) {
//   const reportHtmls = await generateReportHTML(result)
//    await reportHtml('vr@ict.lviv.ua','REPORT',reportHtmls)
// }

//   } catch (error) {
//     console.log(error);

//   }
// }

// getFakeData()

// insertData()
// Кастомний бекенд для i18next, який читає переклади з PostgreSQL
function PgBackend() {
  return {
    type: 'backend',
    async read(language, namespace, callback) {
      try {
        // Запит до PostgreSQL для отримання перекладів
        const res = await norisdb.ict_managers.query(
          'SELECT key, value FROM translations WHERE language = $1',
          [language]
        );

        // Перетворення результату запиту у формат, що підходить для i18next
        const translations = {};
        res.rows.forEach(row => {
          translations[row.key] = row.value;
        });

        // Виклик колбеку з перекладами
        callback(null, translations);
      } catch (err) {
        // У разі помилки викликаємо callback з помилкою
        callback(err, false);
      }
    },
    // Ви можете додати більше методів, якщо потрібно (наприклад, для кешування)
  };
}



// Налаштування i18next з кастомним бекендом для PostgreSQL
i18next
  .use(i18nextMiddleware.LanguageDetector)
  .use(PgBackend()) // Тепер ми правильно додаємо кастомний бекенд
  .init({
    fallbackLng: 'en',
    debug: true,
    backend: PgBackend(), // Також зазначаємо бекенд для завантаження перекладів
  });

// Middleware для обробки cookies і встановлення мови
app.use((req, res, next) => {
  const cookies = new Cookies(req, res);
  let language = cookies.get('i18next'); // Перевіряємо, чи є мова в cookies

  // Якщо мови немає в cookies, встановлюємо її через заголовок accept-language або за замовчуванням
  if (!language) {
    language = req.headers['accept-language']?.split(',')[0] || 'en';
    cookies.set('i18next', language, { httpOnly: true, maxAge: 30 * 24 * 60 * 60 * 1000 }); // 30 днів
  }

  req.language = language; // Додаємо мову до запиту
  next();
});

// Використовуємо i18next middleware для обробки запитів
app.use(i18nextMiddleware.handle(i18next));

// Створення API для завантаження перекладів
app.get('/api/translations', (req, res) => {
  const language = req.language; // Отримуємо мову з cookies
 
  
  const translations = i18next.services.resourceStore.data[language] || {}; // Завантажуємо переклади


  res.json(translations); // Відправляємо переклади на клієнт
});






















server.listen(process.env.PORT, "0.0.0.0", () => {
  console.log(`Listen ${process.env.PORT}`);
});

// const orDate = new Date();
// console.log(orDate.valueOf());
