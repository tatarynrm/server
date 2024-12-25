require("dotenv").config();
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cors = require("cors");
const http = require("http");
const EventEmitter = require("events");
const eventEmitter = new EventEmitter();
const server = http.createServer(app);
const cron = require('node-cron');
const { bot } = require("./telegram__bot/telegram_bot");
const { Server } = require("socket.io");
const path = require("path");
const nodemailer = require("nodemailer");
const hbs = require("nodemailer-express-handlebars");
const oracledb = require("oracledb");
const multer = require('multer');
oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;
const fs = require("fs");
const moment = require("moment");
require('moment/locale/uk.js');
const cookieParser = require("cookie-parser");
const schedule = require("./services/schedule/shcedule");
const {insertData} = require('./utils/saveEmailsToSend')

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
const emailRoutes = require('./routes/emails')
const webRoutes = require('./routes/web/web')
const feedbackNorisRoute = require("./routes/noris/feedback");
const tendersRoute = require("./routes/tenders");
const printersRoute = require('./routes/noris/printer.route') 
const greetingsRoute = require('./routes/noris/greeting-cards.route') 
const session = require("express-session");
const norisdb = require("./db/noris/noris");
const { pathImage, sendNewYearEmail } = require("./nodemailer/newYearNodemailer");
const { getOsPIP } = require("./helpers/os/osFunctions");
const { getDataFromLogistPro, multiplyLogistData, getAndWriteDataLogistPro } = require("./parser/logist-pro/logist-pro-parser");
const { getTables } = require("./utils/tables/emails-tabels");
const { getAllTables } = require("./controllers/emails-controller");
const { pool_emails_send } = require("./db/pg/email");

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
    "https://work.ict.lviv.ua"
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
app.use('/files', express.static(__dirname + '/uploads'));
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



  socket.on('get_emails_send_info', async data => {

    const my_data = await getTables();

   
    

    io.emit('show_get_emails_send_data', my_data)
  })
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

    if (data !==undefined || data !== null) {
   
      const refreshZapMessageToAllUsers = async (data)=>{
        try {
          const connection = await oracledb.getConnection(pool);
          connection.currentSchema = "ICTDAT";
          const result = await connection.execute(`select * from zap where KOD = ${data}`);
     
          const zapData = result.rows[0]
if (zapData !== null || zapData !== undefined) {
  // io.emit('refreshMsg',zapData)
}
        } catch (error) {
          console.log(error);
        }

      }
      refreshZapMessageToAllUsers(data)
    }else {
      console.log('UNDEFINED KOD');
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
  socket.on("newComment", (data) => {
  
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
  socket.on("changeCountAm", async (data) => {
    io.emit("showChangeCountAm", data);

const resultName = await getOsPIP(data?.pKodMen)
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


socket.on('start_feedback',()=>{
  io.emit('show_msg_feedback')
})



// ЗАПИТИ З ОСНОВНОГО САЙТУ

socket.on('newWebZap',data =>{
  console.log(data);
  const date = moment(new Date()).format('LLLL');

const adminTg = [
  {who:'Татарин Роман',id:5248905716},
  {who:'Корецька Ольга',id:1612647542},
  {who:'Риптик Володимир',id:5298432643},
]

for (let i = 0; i < adminTg.length; i++) {
  const el = adminTg[i];

  
  bot.telegram.sendMessage(
    el.id,
    `<i>Новий запит з корпоративного сайту компанії ${date}</i>\n\n<b>${data.name}</b>\n<b>${data.tel}</b>\n<b>${data.email}</b>\n<b>${data.text}</b>`,
    { parse_mode: "HTML" }
  );
  
  
  
}



  
  
})
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
app.get('/list-ur',async(req,res) =>{
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
  const jsonElement = JSON.parse(element.RESULT)
  myArray.push(jsonElement)
}
  const jsonData = JSON.parse(jsonString);
  
  const result = jsonData;


res.json(myArray)
  } catch (error) {
    console.log(error);
    res.json(error)
  }
})

app.get('/photo',async (req,res)=>{
  try {
    const connection = await oracledb.getConnection(pool);
    connection.currentSchema = "ICTDAT";
    const data = await connection.execute(`select a.foto from os a`)

    // Функція для читання LOB-потоку і обробки його даних
function readLobStream(lobStream) {
  return new Promise((resolve, reject) => {
    const chunks = [];

    lobStream.on('data', (chunk) => {
      chunks.push(chunk);
    });

    lobStream.on('end', () => {
      const data = Buffer.concat(chunks);
      resolve(data);
    });

    lobStream.on('error', (error) => {
      reject(error);
    });
  });
}
readLobStream(data.rows[0].FOTO)
  .then((data) => {

    // Тут ви можете використовувати data, наприклад, відобразити зображення в React
    res.json(data)
  })
  .catch((error) => {
    console.error('Error reading LOB stream:', error);
  });
  } catch (error) {
    console.log(error);
  }
})


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

  // Електронний адрес не відповідає вимогам
  return false;
}
// // Set up multer storage configuration
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     const uploadDir = path.join(__dirname, 'uploads');
    
//     // Create uploads folder if it doesn't exist
//     if (!fs.existsSync(uploadDir)) {
//       fs.mkdirSync(uploadDir);
//     }

//     cb(null, uploadDir); // Save files to the 'uploads' folder
//   },
//   filename: (req, file, cb) => {
//     // Use the custom file name if provided in the request
//     console.log(req.headers.fileName);
//     console.log(req);
    
    
//     const fileName = decodeURIComponent(req.headers['x-filename']) || file.originalname;
//     const fileExtension = path.extname(file.originalname); // Get file extension

//     // Ensure that the file name ends with the correct extension
//     const finalFileName = fileName.endsWith(fileExtension) ? fileName : `${fileName}${fileExtension}`;

//     cb(null, finalFileName); // Save with the custom file name
//   }
// });

// // Set up multer middleware for handling file uploads
// const upload = multer({ storage: storage });

// // Route for uploading files
// app.post('/upload', upload.single('file'), (req, res) => {

  
//   if (!req.file) {
//     return res.status(400).send('No file uploaded.');
//   }

// const fileName = decodeURIComponent(req.headers['x-filename'])


// const extension = req.file.originalname.split('.').pop();// Slice after the dot
// console.log('extension',extension);  // 'xls'
//   // Send the file URL as a response
//   const fileUrl = `http://localhost:8800/uploads/${fileName}.${extension}`;
//   res.send({
//     message: 'File successfully uploaded',
//     fileUrl: fileUrl
//   });
// });

// // Serve the uploaded files
// app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// // Шлях до папки uploads
// const uploadsDir = path.join(__dirname, 'uploads');

// app.get('/xls-files', (req, res) => {
//   fs.readdir(uploadsDir, (err, files) => {
//     if (err) {
//       return res.status(500).send('Помилка при читанні папки');
//     }

//     // Фільтрація файлів за розширенням .xlsx та .xls
//     const xlsxFiles = files.filter(file => 
//       file.endsWith('.xlsx') || file.endsWith('.xls')
//     );

//     res.json(xlsxFiles);
//   });
// });


// Функція для перевірки та створення папки, якщо вона не існує
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
      return res.status(500).send({ message: "Error uploading the file.", error: err.message });
    }
    if (!req.file) {
      return res.status(400).send({ message: "No file uploaded." });
    }

    // Визначаємо тип файлу та його URL
    const fileType = req.file.mimetype.startsWith("image/") ? "images" : "files";
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
    const xlsxFiles = files.filter(file =>
      file.endsWith(".xlsx") || file.endsWith(".xls")
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
    const xlsxFiles = files.filter(file =>
      file.endsWith(".xlsx") || file.endsWith(".xls")
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
    const imageFiles = files.filter(file =>
      file.endsWith(".jpg") || file.endsWith(".jpeg") || file.endsWith(".png") || file.endsWith(".gif")
    );

    res.json(imageFiles);
  });
});

let arrayOfTG = []
cron.schedule('30 9,14,17 * * 1-5', () => {

// Запускатиме  задачу (нагадування менеджерам у яких заявка в CRM має більше 2 днів) 
// о 09:30, 14:30 та 17:30, кожного дня з понеділка по п'ятницю.
// 10 sec --- */10 * * * * *
// Той що треба * 9,14,16 * * 1-5
  const getAllZap = async ()=>{
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
    arrayOfTG.push(element.TELEGRAMID)
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
arrayOfTG = []
    } catch (error) {
      console.log(error);
    }
  }
  // getAllZap()
});
cron.schedule('*/10 * * * *', async () => {
  try {
    await getAndWriteDataLogistPro();
    console.log("КАЖДДИЙ 10 МІНУУТА!!!!!!!!!!--------------");
    
  } catch (err) {
    console.error('Error during scheduled task execution:', err);
  }
});

// setTimeout(()=>{
//   console.log(arrayOfTG);
//   },10000)


// logewq


// getAndWriteDataLogistPro();

if (process.env.SERVER === 'LOCAL') {
  console.log('LOCAL_SERVER');
  
}else {
  console.log('MAIN SERVER');
  
}



app.post('/delete-file', (req, res) => {
  try {
    // Назва файлу, який потрібно видалити
    const { filename } = req.body;  // Отримуємо тільки filename

    // Шляхи до папок, де можуть бути файли
    const directories = [
      path.join(__dirname, 'uploads', 'files'),
      path.join(__dirname, 'uploads', 'images')
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
      return res.status(404).send('Файл не знайдено');
    }

    // Видалення файлу
    fs.unlink(filePath, (err) => {
      if (err) {
        console.error('Помилка при видаленні файлу:', err);
        return res.status(500).send('Помилка при видаленні файлу');
      }

      console.log(`Файл ${filename} успішно видалений з ${filePath}`);
      res.status(200).json({ message: `${filename} успішно видалений` });
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Сталася помилка');
  }
});



// Маршрут для видалення таблиці
app.get("/drop-table/:tableName", async (req, res) => {
  const { tableName } = req.params;

  try {
    // Запит на видалення таблиці
    const result = await pool_emails_send.query(`DROP TABLE IF EXISTS ${tableName}`);
    

    

    // Якщо таблиця була видалена або не існувала, відповідаємо успіхом
    res.status(200).send(`Таблицю "${tableName}" успішно видалено.`);
  } catch (error) {
    console.error("Помилка при видаленні таблиці:", error);
    res.status(500).send("Не вдалося видалити таблицю.");
  }
});








// insertData()

server.listen(process.env.PORT, "0.0.0.0", () => {
  console.log(`Listen ${process.env.PORT}`);
});

// const orDate = new Date();
// console.log(orDate.valueOf());
