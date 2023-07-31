const oracledb = require("oracledb");
oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;
// const pool = require("../db/index");
const pool = require("../db/pool");
const jwt = require("jsonwebtoken");
const generateRandomNumber = require('../helpers/randomNumber')
const {bot} = require('../telegram__bot/telegram_bot')
const {sendOTPCode} = require('../telegram__bot/bot__functions')
const mobileLogin = async (req, res) => {
  const { email, password } = req.body;
  try {
    const connection = await oracledb.getConnection(pool);
    const user = await connection.execute(`SELECT
        a.KOD,
        a.PRIZV,
        a.IMJA,
        a.PIPFULL,
        a.ISDIR,
        a.PIP,
        a.CODE_SEX,
        b.DB_PASSWD,
        c.MAIL
    FROM
        ictdat.os a
    JOIN ictdat.us b ON
        a.kod = b.kod_os
    JOIN ICTDAT.OSMAIL c ON a.kod = c.KOD_OS
    WHERE
        a.ZVILDAT IS NULL
        AND c.mail = '${email}'
        AND b.DB_PASSWD = '${password}'
    ORDER BY
        a.pip ASC`);

    if (user.rows.length > 0) {
      res.status(200).json(user);
    }

    if (!user) {
      return res.status(404).json({
        message: "Користувача не знайдено",
      });
    }
  } catch (error) {
    console.log(error);
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const connection = await oracledb.getConnection(pool);
    const user = await connection.execute(`SELECT
        a.KOD,
        a.PRIZV,
        a.IMJA,
        a.PIPFULL,
        a.ISDIR,
        a.PIP,
        a.CODE_SEX,
        b.DB_PASSWD,
        b.TELEGRAMID,
        c.MAIL
    FROM
        ictdat.os a
    JOIN ictdat.us b ON
        a.kod = b.kod_os
    JOIN ICTDAT.OSMAIL c ON a.kod = c.KOD_OS
    WHERE
        a.ZVILDAT IS NULL
        AND c.mail = '${email}'
        AND b.DB_PASSWD = '${password}'
    ORDER BY
        a.pip ASC`);

    const token = jwt.sign(
      {
        id: user.rows[0].KOD,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "30d",
      }
    );
    if (user.rows.length > 0) {
      const us = user.rows[0];
      
      const connection = await oracledb.getConnection(pool);
     await connection.execute(
        `BEGIN
ICTDAT.p_zap.SetAuth(:pKodOs,:pTelegramId,:pOtpCode);
END;`,
        {
          pKodOs: us?.KOD,
          pTelegramId: us?.TELEGRAMID,
          pOtpCode: generateRandomNumber(),
        }
      );
    
      const telegramCode = await connection.execute(`select * from ictdat.zapauth where KOD_OS = ${us?.KOD} `)
//  console.log(telegramCode.rows[0]);
console.log(telegramCode);
      sendOTPCode(bot,telegramCode.rows[0])





      res.status(200).json({ ...user, token: token,OTP:telegramCode.rows[0].OTPCODE });
    }










    if (!user) {
      return res.status(404).json({
        message: "Користувача не знайдено",
      });
    }
    if (user.rows.length === 0) {
      return res.status(404).json({
        message: "Користувача не знайдено",
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Не вдалось авторизуватись",
    });
  }
};
const getMe = async (req, res) => {
  try {
    const connection = await oracledb.getConnection(pool);
    const user = await connection.execute(`SELECT
    a.KOD,
    a.PRIZV,
    a.IMJA,
    a.PIPFULL,
    a.ISDIR,
    a.PIP,
    a.CODE_SEX,
    b.DB_PASSWD,
    b.TELEGRAMID,
    c.MAIL,
    d.TEL
FROM
    ictdat.os a
JOIN ictdat.us b ON
    a.kod = b.kod_os
JOIN ICTDAT.OSMAIL c ON a.kod = c.KOD_OS
JOIN ICTDAT.OSTEL d ON a.kod = d.KOD_OS 
WHERE
    a.ZVILDAT IS NULL
    AND a.KOD = '${req.userId}'
    AND d.SL = 1
    AND d.MOB = 1
    AND d.VALIDX is not null
ORDER BY
    a.pip ASC`);

    res.status(200).json({ ...user.rows[0] });
    if (!user) {
      return res.status(404).json({
        message: "Користувача не знайдено",
      });
    }
  } catch (error) {
    res.status(500).json({
      message: "Немає доступу",
    });
  }
};

const getOtpCode = async (req,res)=>{
  const {KOD_OS} = req.body
  console.log(KOD_OS);
  try {
    const connection = await oracledb.getConnection(pool);
    const userOTP  = await connection.execute(`SELECT * from ictdat.zapauth where KOD_OS = ${KOD_OS}`)
    if (userOTP) {
      res.status(200).json(userOTP);
    }
  } catch (error) {
    console.log(error);
  }
}
module.exports = {
  login,
  getMe,
  mobileLogin,
  getOtpCode
};
