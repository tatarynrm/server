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
// const socketIo = require("socket.io");
// const io = socketIo(server);
const { Server } = require("socket.io");
// const io = new Server(server);
const path = require("path");
const nodemailer = require("nodemailer");
const hbs = require("nodemailer-express-handlebars");
const oracledb = require("oracledb");
oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;
const OracleEventEmitter = require("./utils/eventEmitters");
// const EventEmitter = require("events");
const pool = require("./db/pool");
const authRouter = require("./routes/auth");
const usersRoute = require("./routes/users");
const cargosRoute = require("./routes/cargos");
const zasRoute = require("./routes/zas");
const UrRoute = require("./routes/UR");
// const chatRoute = require("./routes/chat");
const zapRoute = require("./routes/zap");
const commentsRoute = require("./routes/comments");
// Middlewares------------------------------------------------------------------------------------------------------
app.use(bodyParser.json({ limit: "30mb", extended: true }));
app.use(bodyParser.urlencoded({ limit: "30mb", extended: true }));
app.use(cors());
app.use(express.json());

// Middlewares------------------------------------------------------------------------------------------------------

// ROUTES------------------------------------------------------------------------------------------------------
app.use("/auth", authRouter);
app.use("/users", usersRoute);
app.use("/cargos", cargosRoute);
app.use("/zas", zasRoute);
app.use("/ur", UrRoute);
// app.use("/chat", chatRoute);
app.use("/zap", zapRoute);
app.use("/comments", commentsRoute);
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
  console.log("====================================");
  console.log(req.body);
  console.log("====================================");
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

//# Connect to the Oracle database
// oracleEmitter.connect();

// Execute a sample query
// oracleEmitter.executeQuery("SELECT * FROM employees");

// Disconnect from the Oracle database
// oracleEmitter.disconnect();

// oracleEmitter.executeQuery(`SELECT * FROM ICTDAT.OS`);

// WEB SOCKETS------------------------------------------------------------------------
const io = new Server(server, {
  // cors: {
  //   origin: "http://192.168.5.180",
  //   methods: ["GET", "POST"],
  // },
  cors: {
    origin: "http://localhost:3000",
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
    console.log(onlineUsers);
  });
  io.emit("getUsers", onlineUsers);
  // КОРИСТУВАЧІ

  // ЗАПИТИ

  socket.on("newZap", (data) => {
    io.emit("showNewZap", data);
    // bot.telegram.sendMessage(
    //   -1001894284480,
    //   `👉Користувач ${data.PIP} щойно добавив\nнову заявку: ✅<code><b>${data.ZAP_KOD}</b></code>\nЗавантаження: ${data.pZav}\nВивантаження: ${data.pRozv}\nІнформація: ${data.pZapText}\nПереглянути заявку: http://192.168.5.180`,
    //   { parse_mode: "HTML" }
    // );
  });
  socket.on("deleteZap", (data) => {
    io.emit("deleteZapAllUsers", data);
  });
  socket.on("refreshZap", (data) => {
    console.log(data);
    io.emit("refreshAllZap", data);
  });
  socket.on("editZap", (data) => {
    io.emit("showEditZap", data);
  });
  socket.on("newComment", (data) => {
    // console.log(socket.userId);

    io.emit("showNewComment", data);
    // io.sockets.emit("showNewComment", data);
  });

  socket.on("deleteComm", (data) => {
    io.emit("deleteCommAllUsers", data);
  });
  socket.on("myZapComment", (data) => {
    console.log("my__comment", data);
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
    io.emit("showTextToAllUsers", data);
  });
  socket.on("admin_msg_user", (data) => {
    io.emit("show_msg_from_admin", data);
  });
  // ADMIN
  // ВИЙТИ
  socket.on("disconnect", () => {
    // removeUser(socket.id);
    console.log("disconnect");
  });
});

// WEB SOCKETS END.........................................................

// const { Telegraf } = require("telegraf");
// const { message } = require("telegraf/filters");

// const bot = new Telegraf(process.env.BOT_TOKEN);
// bot.start((ctx) => ctx.reply("Вітаю"));
// bot.hears("ok", (ctx) => {
//   console.log(ctx.message.from.id);
// });

// bot.launch();

// // Enable graceful stop
// process.once("SIGINT", () => bot.stop("SIGINT"));
// process.once("SIGTERM", () => bot.stop("SIGTERM"));

// // VPN
// const opts = {
//   host: "ict.lviv.ua", // Normally '127.0.0.1', will default to if undefined
//   // port: 1337, // Port for the OpenVPN management console
// };

// const auth = {
//   user: "rt",
//   pass: "Pm56@Erf1",
// };

// const openvpn = openvpnmanager.connect(opts);

// openvpn.on("connected", () => {
//   openvpnmanager.authorize(auth);
// });
// // VPN

// Server run------------------------------------------------------------------------------------------------------
server.listen(process.env.PORT, () => {
  console.log(`Listen ${process.env.PORT}`);
});
