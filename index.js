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
const anywhere = require("express-cors-anywhere")
const path = require("path");
const nodemailer = require("nodemailer");
const hbs = require("nodemailer-express-handlebars");
const oracledb = require("oracledb");
oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;
const OracleEventEmitter = require("./utils/eventEmitters");
const pool = require("./db/pool");
const authRouter = require("./routes/auth");
const usersRoute = require("./routes/users");
const cargosRoute = require("./routes/cargos");
const zasRoute = require("./routes/zas");
const UrRoute = require("./routes/UR");
const zapRoute = require("./routes/zap");
const commentsRoute = require("./routes/comments");
const eventsRoutes = require("./routes/events");

// let corsOptions = {
//   origin : ['http://ict.lviv.ua']
// }
// const allowlist = ['http://ict.lviv.ua', 'http://192.168.5.180']
// const corsOptionsDelegate = function (req, callback) {
//   var corsOptions;
//   if (allowlist.indexOf(req.header('Origin')) !== -1) {
//     corsOptions = { origin: true } // reflect (enable) the requested origin in the CORS response
//   } else {
//     corsOptions = { origin: false } // disable CORS for this request
//   }
//   callback(null, corsOptions) // callback expects two parameters: error and options
// }
// app.get('/api/noris', cors(corsOptionsDelegate), function (req, res, next) {
//   res.json({msg: 'Андрій Боровенко'})
// })
// app.use(cors(corsOptions))
// Middlewares------------------------------------------------------------------------------------------------------
// Add headers before the routes are defined
// app.use(function (req, res, next) {

//   // Website you wish to allow to connect
//   res.setHeader('Access-Control-Allow-Origin', '*');

//   // Request methods you wish to allow
//   res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

//   // Request headers you wish to allow
//   res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

//   // Set to true if you need the website to include cookies in the requests sent
//   // to the API (e.g. in case you use sessions)
//   res.setHeader('Access-Control-Allow-Credentials', true);

//   // Pass to next layer of middleware
//   next();
// });

app.use(cors(
  //   {
  //   origin:"http://ict.lviv.ua"
  // }
  ));
app.use(bodyParser.json({ limit: "30mb", extended: true }));
app.use(bodyParser.urlencoded({ limit: "30mb", extended: true }));
app.use(express.json());

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



// WEB SOCKETS------------------------------------------------------------------------
const io = new Server(server, {
  // cors: {
  //   origin: "http://192.168.5.180/",
  //   methods: ["GET", "POST"],
  // },
  // cors: {
  //   origin: "http://localhost:3000",
  //   methods: ["GET", "POST"],
  // },
  // cors: {
  //   origin: "http://194.44.241.122:80",
  //   methods: ["GET", "POST"],
  // },
  cors: {
    origin: ["http://http://194.44.241.122/","http://192.168.5.180","http://ict.lviv.ua","http://localhost:3000","http://194.44.241.122:80","http://194.44.241.122/"],
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
console.log(userId);
  });
  io.emit("getUsers", onlineUsers);
  // КОРИСТУВАЧІ

  // ЗАПИТИ

  socket.on("newZap", (data) => {
    io.emit("showNewZap", data);
    bot.telegram.sendMessage(
      -1001894284480,
      `👉Користувач ${data.PIP} щойно добавив\nнову заявку: ✅<code><b>${data.ZAP_KOD}</b></code>\nЗавантаження: ${data.pZav}\nВивантаження: ${data.pRozv}\nІнформація: ${data.pZapText}\nПереглянути заявку: http://192.168.5.180`,
      { parse_mode: "HTML" }
    );
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
    console.log(data);
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

const { Telegraf } = require("telegraf");
const { message } = require("telegraf/filters");

const bot = new Telegraf(process.env.BOT_TOKEN);
const firstName = (ctx) => ctx.message.from.first_name
bot.start((ctx) => ctx.reply("Вітаю"));
bot.hears("ok", (ctx) => {
//  roman - 282039969
  console.log(ctx.message.from.id);
  bot.telegram.sendMessage(941236974,'OK')
  // ctx.sendMessage('MESSAGE',{chat_id:'@I_Dont_Have_A_Phone_Number'})
});

bot.launch();

// Enable graceful stop
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));

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

server.listen(process.env.PORT,'0.0.0.0', () => {
  console.log(`Listen ${process.env.PORT}`);
});
