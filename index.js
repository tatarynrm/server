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
const feedbackNorisRoute = require("./routes/noris/feedback");
const session = require("express-session");
const norisdb = require("./db/noris/noris");
const { pathImage, sendNewYearEmail } = require("./nodemailer/newYearNodemailer");

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
app.use("/cart", cartRoutes);
app.use("/feedback", feedbackNorisRoute);
app.use("/email", emailRoutes);
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
// console.log(data);
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
          console.log(result.rows[0]);
          const zapData = result.rows[0]
if (zapData !== null || zapData !== undefined) {
  io.emit('refreshMsg',zapData)
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
    console.log(data);
    io.emit("showEditZapText", data);
  });
  socket.on("newComment", (data) => {
    // console.log(data.selectedZap);
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
  io.emit('show_msg_feedback')
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
  // console.log(data.rows);
  let myArray = [];

  const jsonString = data.rows[0].RESULT;
for (let i = 0; i < data.rows.length; i++) {
  const element = data.rows[i];
  const jsonElement = JSON.parse(element.RESULT)
  myArray.push(jsonElement)
}
  const jsonData = JSON.parse(jsonString);
  
  const result = jsonData;
  console.log(myArray);

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
    console.log(data.rows[1].FOTO);
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
    console.log('Read LOB data:', data);
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

function formatEmail(email) {
  // Упевнитися, що електронний адрес у нижньому регістрі (за бажанням)
  email = email.toLowerCase();

  // Додаткові етапи форматування можна додати за необхідності

  return email;
}
let emailsAll = []
const getAllUrEmail = async ()=>{
  let emails = []
  try {
    const conn = await oracledb.getConnection(pool)
    conn.currentSchema = 'ICTDAT'
  //  const result  = await conn.execute(`select VAL from kontaktval`)
   const result  = await conn.execute(`
   select a.kod as kod_kontakt,
       b.kod,
       a.kod_ur,
       c.drcode,
       a.nkontakt,
       a.prim,
       b.val,
       c.ntype,
       e.nur,
       e.perekmt,
       e.peradr,
       e.pernegabarit,
       f.nkraina,
       g.nobl
from kontakt a
left join kontaktval b on a.kod = b.kod_kontakt
left join kontakttype c on b.kod_type = c.kod
join ur e on a.kod_ur = e.kod
left join kraina f on e.kod_kraina = f.kod
left join obl g on e.kod_obl = g.kod
where c.drcode = 'EMAIL' and
      exists (select * from zaylst u where (u.kod_zam = a.kod_ur or u.kod_per = a.kod_ur) and u.perevdat >= to_date('01.01.2023','DD.MM.YYYY'))
   `)

console.log(result.rows);


    // Обробка результатів запиту
//     result.rows.forEach((row) => {
//       const value = row.VAL;
// // 
//       // Перевірка, чи є значення електронною адресою
//       if (isEmail(value)) {
//         console.log(`Електронна адреса: ${value}`);
//         // emails.push(value)
//         if (validateEmail(value)) {
//           emails.push(value)
//         }
     
//       }
//       // Перевірка, чи є значення номером телефону
//       else if (isPhoneNumber(value)) {
//         console.log(`Номер телефону: ${value}`);
//       }
//       // Інші варіанти обробки за необхідності
//       else {
//         console.log('NOTHING');
//       }

//     });
  //   emailsAll.push(emails)
  // return emailsAll
  } catch (error) {
    console.log(error);
  }
}
// getAllUrEmail()
// if (emailsAll.length > 0) {
//   console.log(emailsAll,'-----------');
// }
// Налаштування Multer для збереження файлів у папці
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Папка для збереження файлів
  },
  filename: (req, file, cb) => {
    cb(null, `new-year`+`.jpeg`);
  },
});

const upload = multer({ storage: storage });

// sendNewYearEmail(photoBuffer,text)


app.post('/upload', upload.single('photo'), (req, res) => {
  try {
    const photoBuffer = req.file.buffer;
    // Handle the photo buffer as needed, e.g., save to disk or process it.
    console.log('Received photo:', photoBuffer);

    res.status(200).send('Photo uploaded successfully!');
  } catch (error) {
    console.error('Error handling photo:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.get('/files', async (req, res) => {
  const uploadsPath = path.join(__dirname, 'uploads');

  try {
    const files =  fs.readdirSync(uploadsPath);
    res.json({ files });
  } catch (error) {
    console.error('Помилка отримання списку файлів', error);
    res.status(500).json({ error: 'Помилка отримання списку файлів' });
  }
});


let arrayOfTG = []
cron.schedule('* 9,14,16 * * 1-5', () => {
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
      console.log(result.rows);

for (let i = 0; i < result.rows.length; i++) {
  const element = result.rows[i];
  if (!arrayOfTG.includes(element.TELEGRAMID)) {
    arrayOfTG.push(element.TELEGRAMID)
  }
}

console.log(arrayOfTG);
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
  getAllZap()
});
// setTimeout(()=>{
//   console.log(arrayOfTG);
//   },10000)
server.listen(process.env.PORT, "0.0.0.0", () => {
  console.log(`Listen ${process.env.PORT}`);
});

// const orDate = new Date();
// console.log(orDate.valueOf());
