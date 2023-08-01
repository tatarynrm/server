require("dotenv").config();
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cors = require("cors");
const http = require("http");
const EventEmitter = require("events");
const openvpnmanager = require("node-openvpn");
const eventEmitter = new EventEmitter();
const server = http.createServer(app);
const compression = require("compression");
const { bot } = require("./telegram__bot/telegram_bot");
const { Server } = require("socket.io");
const anywhere = require("express-cors-anywhere");
const path = require("path");
const nodemailer = require("nodemailer");
const hbs = require("nodemailer-express-handlebars");
const oracledb = require("oracledb");
oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;
const OracleEventEmitter = require("./utils/eventEmitters");
const { sendMessageToGroup } = require("./telegram__bot/bot__functions");
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




// Middlewares------------------------------------------------------------------------------------------------------


app.use(bodyParser.json({ limit: "30mb", extended: true }));
app.use(bodyParser.urlencoded({ limit: "30mb", extended: true }));
app.use(express.json());
app.use(cors());
// Відключає CORS

// Відключає CORS
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
// ROUTES------------------------------------------------------------------------------------------------------

// NODEMAILER

// const transporter = nodemailer.createTransport({
//   service: "gmail",
//   host: "smtp.gmail.com",
//   port: 587,
//   secure: false,
//   auth: {
//     user: "tatarynrm@gmail.com",
//     pass: "uexmjdtvgddhnmkj",
//   },
// });
const transporter = nodemailer.createTransport({
  // service: "uarnet",
  host: "demomail.uar.net",
  port: 465,
  // 465
  // secure: false,
  auth: {
    user: "tarasdragan@demomail.uar.net",
    pass: "44zf8Fd9CR",
  },
});

// const handlebarOptions = {
//   viewEngine: {
//     extName: ".hbs",
//     partialsDir: "./views/",
//     defaultLayout: false,
//   },
//   viewPath: "./views/",
//   extName: ".hbs",
// };
// transporter.use("compile", hbs(handlebarOptions));

// NODEMAILER
app.post("/mail-send", async (req, res) => {
  const { from, to, theme, text } = req.body;
  try {
    const mailOptions = {
      from: `${from}`,
      to: `${to}`,
      subject: `${theme}`,
      text: text,
      // template: "email",
      // context: {
      //   title: "Тестовий лист",
      //   full_name: "Роман",
      // },
    };
    const mail = await transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        res.json({ status: false });
      } else {
        console.log(`Email sent: ${info.response}`);
        res.json(info);
      }
    });
    res.status(200).json({ status: "ok" });
  } catch (error) {
    console.log(error);
  }
});

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
    sendMessageToGroup(bot, data);
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
  socket.on("newComment", (data) => {
    if (data.telegramId !== null) {
      // БОТ 
      bot.telegram.sendMessage(
        data.telegramId,
        `💻 ${data.PIP}  прокоментував вашу заявку ✅${data.pKodZap}\n\n💬 ${data.pComment}`
      );
    }
    io.emit("showNewComment", data);
    // io.sockets.emit("showNewComment", data);
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
  // ЗАПИТИ

  // ADMIN

  socket.on("activeUsers", () => {
    io.emit("showActiveUsers", onlineUsers);
  });

  socket.on("windowReload", () => {
    io.emit("windowReloadAllUsers", 1);
  });
  socket.on("textToAllUsers", (data) => {
    // console.log(data);
    io.emit("showTextToAllUsers", data);
  });
  socket.on("admin_msg_user", (data) => {
    console.log(data);
    io.emit("show_msg_from_admin", data);
  });
  // ADMIN
  // ВИЙТИ
  socket.on("disconnect", () => {
    removeUser(socket.id);
    console.log("disconnect");
  });
});


// WEB SOCKETS END.........................................................

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


// Server run------------------------------------------------------------------------------------------------------

server.listen(process.env.PORT, "0.0.0.0", () => {
  console.log(`Listen ${process.env.PORT}`);
});
