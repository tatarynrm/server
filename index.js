require("dotenv").config();
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cors = require("cors");
const http = require("http");
const EventEmitter = require("events");
const eventEmitter = new EventEmitter();
const server = http.createServer(app);
const { bot } = require("./telegram__bot/telegram_bot");
const { Server } = require("socket.io");
const path = require("path");
const nodemailer = require("nodemailer");
const hbs = require("nodemailer-express-handlebars");
const oracledb = require("oracledb");
const fs = require("fs");
const moment = require("moment");
const cookieParser = require("cookie-parser");
const schedule = require("./services/schedule/shcedule");
oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;
const OracleEventEmitter = require("./utils/eventEmitters");
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
const commentsRoute = require("./routes/comments");
const eventsRoutes = require("./routes/events");
const zayRoutes = require("./routes/zay");
const groupsRoutes = require("./routes/groups");
const cartRoutes = require("./routes/cart/cart");
const session = require("express-session");
const norisdb = require("./db/noris/noris");

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
// Middlewares------------------------------------------------------------------------------------------------------

// ROUTES------------------------------------------------------------------------------------------------------
app.use("/auth", authRouter);
app.use("/users", usersRoute);
app.use("/cargos", cargosRoute);
app.use("/zas", zasRoute);
app.use("/ur", UrRoute);
app.use("/zap", zapRoute);
app.use("/comments", commentsRoute);
app.use("/events", eventsRoutes);
app.use("/zay", zayRoutes);
app.use("/groups", groupsRoutes);
app.use("/cart", cartRoutes);
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

io.on("connection", (socket) => {
  // КОРИСТУВАЧІ
  socket.on("newUser", (userId) => {
    addNewUser(userId, socket.id);
    // console.log(userId);
  });
  io.emit("getUsers", onlineUsers);
  // КОРИСТУВАЧІ

  // ЗАПИТИ

  socket.on("newZap", (data) => {
    io.emit("showNewZap", data);
    // // БОТ

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
  });
  socket.on("editZap", (data) => {
    io.emit("showEditZap", data);
  });
  socket.on("editZapText", (data) => {
    console.log(data);
    io.emit("showEditZapText", data);
  });
  socket.on("newComment", (data) => {
    console.log(data.selectedZap);
    if (data.telegramId !== null) {
      // БОТ
      bot.telegram.sendMessage(
        data.telegramId,
        `💻 ${data.PIP}  прокоментував вашу заявку ✅${data.pKodZap}\n\n${data?.selectedZap.ZAV} --- ${data?.selectedZap.ROZV}\n💬 ${data.pComment}`
      );
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
  socket.on("changeCountAm", (data) => {
    console.log("0000000000", data);
    io.emit("showChangeCountAm", data);
    if (data.userToWarn?.length > 0) {
      for (let i = 0; i < data?.userToWarn?.length; i++) {
        const element = data?.userToWarn[i];
        bot.telegram.sendMessage(
          element.TELEGRAMID,
          `По заявці \n${data.zapDeleteData?.zav}\n${data.zapDeleteData?.rozv}\nзакрито ${data.pKilAmZakr} авто `,
          { parse_mode: "HTML" }
        );
      }
    }
  });

  // ЗАПИТИ

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
    console.log(data);
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
          console.log(element);
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
      console.log(el.TELEGRAMID);
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


socket.on('start_feedback',()=>{
  socket.emit('show_msg_feedback')
})
  socket.on("create_feedback", async (data) => {
console.log(data);
      const newFeedBack = await norisdb.query(
        `
         INSERT INTO feedback (feedback,manager)
         values (${data.text},'${data.user}')
         `
      );
  
      if (newFeedBack.rowCount) {
        socket.emit("feedback_create");
      }
    

  });

  // ADMIN TELEGRAM
  // ВИЙТИ
  socket.on("disconnect", () => {
    removeUser(socket.id);
    console.log("disconnect");
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

server.listen(process.env.PORT, "0.0.0.0", () => {
  console.log(`Listen ${process.env.PORT}`);
});

// const orDate = new Date();
// console.log(orDate.valueOf());
